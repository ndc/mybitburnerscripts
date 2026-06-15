export async function main(ns: NS) {
  const [target1, dryrun, hostname1] = ns.args

  ns.disableLog("ALL")

  await ns.sleep(1)

  const hackScriptName = "qohack.ts"
  const hackScriptSize = 1.7
  const weakenScriptName = "qoweaken.ts"
  const weakenScriptSize = 1.75
  const growScriptName = "qogrow.ts"
  const growScriptSize = 1.75
  const linkScript = "qlink.ts"
  const linkScriptSize = 2.9
  const batchScriptName = ns.getScriptName()

  const target = ns.getServer(target1 as string)
  const person = ns.getPlayer()
  const scriptHost = ns.getServer(hostname1 as string)

  const hackTim = ns.formulas.hacking.hackTime(target, person)
  const weakenTim = ns.formulas.hacking.weakenTime(target, person)
  const growTim = ns.formulas.hacking.growTime(target, person)
  const hackDelay = weakenTim - hackTim
  const growDelay = weakenTim - growTim

  let threadCount = 1
  const buffer = (scriptHost.hostname == "home") ? 64 : 0
  const availMemory = scriptHost.maxRam - scriptHost.ramUsed  - linkScriptSize - buffer
  let batch = calculateBatchSize(ns, target, scriptHost, person,
    threadCount, hackScriptSize, growScriptSize, weakenScriptSize)
  if (batch.batchMemory > availMemory) {
    ns.tprintf(`${batchScriptName}: not enough memory in ${hostname1}, ${availMemory} available`)
    ns.tprintf("%j", batch)
    return batch.batchMemory
  }

  let parallelBatch = Math.floor(availMemory / batch.batchMemory)

  // @ignore-infinite
  while (true) {
    const tryThread = threadCount + 1
    const tryBatch = calculateBatchSize(ns, target, scriptHost, person,
      tryThread, hackScriptSize, growScriptSize, weakenScriptSize)
    const tryParallelBatch = Math.floor(availMemory / tryBatch.batchMemory)

    if (tryBatch.batchMemory > availMemory) break
    if (tryBatch.hackPct > 0.03) break

    batch = tryBatch
    threadCount = tryThread
    parallelBatch = tryParallelBatch
  }

  ns.printf(`Using ${threadCount} hack threads, ${parallelBatch} in parallel`)
  ns.printf("%j", batch)

  if (dryrun) {
    ns.ui.openTail()
    return batch.batchMemory
  }

  if (scriptHost.hostname != "home")
    ns.scp([hackScriptName, weakenScriptName, growScriptName, linkScript], scriptHost.hostname)

  globalThis.bitburnerPortCounter = globalThis.bitburnerPortCounter ?? 0

  globalThis.bitburnerPortCounter += 1
  const batchFinishedPort = globalThis.bitburnerPortCounter

  const batchArgs = [target.hostname, false, scriptHost.hostname]
  const linkArgs = [batchFinishedPort, batchScriptName, "home", 1, ...batchArgs]
  let apid = ns.exec(linkScript, scriptHost.hostname, { threads: 1, temporary: true }, ...linkArgs)
  if (apid == 0) ns.tprintf(`${batchScriptName} failed to run ${linkScript} on ${scriptHost.hostname}`)
  //await ns.sleep(1)  // wait for port listener to be ready

  for (let i = 0; i < parallelBatch; i++) {
    apid = ns.exec(hackScriptName, scriptHost.hostname, { threads: threadCount, temporary: true },
      target.hostname, hackDelay)
    if (apid == 0) ns.tprintf(`${batchScriptName} failed to run ${hackScriptName} on ${scriptHost.hostname}`)

    apid = ns.exec(weakenScriptName, scriptHost.hostname, { threads: batch.hackWeakenThread, temporary: true },
      target.hostname, 0)
    if (apid == 0) ns.tprintf(`${batchScriptName} failed to run ${weakenScriptName} on ${scriptHost.hostname}`)

    apid = ns.exec(growScriptName, scriptHost.hostname, { threads: batch.growThr, temporary: true },
      target.hostname, growDelay + 0)
    if (apid == 0) ns.tprintf(`${batchScriptName} failed to run ${growScriptName} on ${scriptHost.hostname}`)

    if (i + 1 == parallelBatch) {
      apid = ns.exec(weakenScriptName, scriptHost.hostname, { threads: batch.growWeakenThread, temporary: true },
        target.hostname, 0, batchFinishedPort)
    } else {
      apid = ns.exec(weakenScriptName, scriptHost.hostname, { threads: batch.growWeakenThread, temporary: true },
        target.hostname, 0)
    }
    if (apid == 0) ns.tprintf(`${batchScriptName} failed to run ${weakenScriptName} on ${scriptHost.hostname}`)
  }

  return batch.batchMemory
}

type BatchSize = {
  hackPct: number
  hackWeakenThread: number
  hackEffect: number
  growThr: number
  growWeakenThread: number
  growEffect: number
  batchMemory: number
}

function calculateBatchSize(ns: NS, target: Server, host: Server, person: Player,
  threadCount: number, hackScriptSize: number, growScriptSize: number, weakenScriptSize: number)
  : BatchSize {
  const hackPct = threadCount * ns.formulas.hacking.hackPercent(target, person)
  const hackEffect = ns.hackAnalyzeSecurity(threadCount, undefined)
  const weakenEff = ns.formulas.hacking.weakenEffect(1, host.cpuCores)
  const hackWeakenThread = Math.ceil(hackEffect / weakenEff)
  const cloneTarget = structuredClone(target)
  cloneTarget.moneyAvailable = (1 - hackEffect) * (target.moneyMax ?? 0)
  const growThr = ns.formulas.hacking.growThreads(cloneTarget, person, target.moneyMax ?? 0, host.cpuCores)
  const growEffect = ns.growthAnalyzeSecurity(growThr, undefined, host.cpuCores)
  const growWeakenThread = Math.ceil(growEffect / weakenEff)
  const batchMemory = hackScriptSize * threadCount
    + weakenScriptSize * hackWeakenThread
    + growScriptSize * growThr
    + weakenScriptSize * growWeakenThread
  return {
    hackPct: hackPct,
    hackWeakenThread: hackWeakenThread,
    hackEffect: hackEffect,
    growThr: growThr,
    growWeakenThread: growWeakenThread,
    growEffect: growEffect,
    batchMemory: batchMemory,
  }
}
