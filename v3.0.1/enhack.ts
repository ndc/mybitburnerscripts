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

  globalThis.bitburnerPortCounter = globalThis.bitburnerPortCounter ?? 0

  let threadCount = 1
  const buffer = (scriptHost.hostname == "home") ? 64 : 0
  const availMemory = scriptHost.maxRam - scriptHost.ramUsed - buffer
  let batch = calculateBatchSize(ns, target, scriptHost, person,
    threadCount, hackScriptSize, growScriptSize, weakenScriptSize, linkScriptSize)
  if (batch.batchMemory > availMemory) {
    ns.tprintf(`${batchScriptName}: not enough memory in ${hostname1}, ${availMemory} available`)
    ns.tprintf("%j", batch)
    return batch.batchMemory
  }

  // @ignore-infinite
  while (true) {
    const tryThread = threadCount + 1
    const tryBatch = calculateBatchSize(ns, target, scriptHost, person,
      tryThread, hackScriptSize, growScriptSize, weakenScriptSize, linkScriptSize)

    if (tryBatch.batchMemory > availMemory) break
    if (tryBatch.hackPct > 0.2) break

    batch = tryBatch
    threadCount = tryThread
  }

  ns.printf(`Using ${threadCount} hack threads`)
  ns.printf("%j", batch)

  if (dryrun) {
    ns.ui.openTail()
    return batch.batchMemory
  }

  globalThis.bitburnerPortCounter += 1
  const batchFinishedPort = globalThis.bitburnerPortCounter

  if (scriptHost.hostname != "home")
    ns.scp([hackScriptName, weakenScriptName, growScriptName, linkScript], scriptHost.hostname)

  const batchArgs = [target.hostname, false, scriptHost.hostname]
  const linkArgs = [batchFinishedPort, batchScriptName, "home", 1, ...batchArgs]
  let apid = ns.exec(linkScript, scriptHost.hostname, 1, ...linkArgs)
  if (apid == 0) ns.tprintf(`Failed to run ${linkScript}`)
  await ns.sleep(1)  // wait for port listener to be ready

  apid = ns.exec(hackScriptName, scriptHost.hostname, threadCount, target.hostname, hackDelay)
  if (apid == 0) ns.tprintf(`Failed to run ${hackScriptName}`)
  apid = ns.exec(weakenScriptName, scriptHost.hostname, batch.hackWeakenThread, target.hostname, 0)
  if (apid == 0) ns.tprintf(`Failed to run ${weakenScriptName}`)
  apid = ns.exec(growScriptName, scriptHost.hostname, batch.growThr, target.hostname, growDelay + 0)
  if (apid == 0) ns.tprintf(`Failed to run ${growScriptName}`)
  apid = ns.exec(weakenScriptName, scriptHost.hostname, batch.growWeakenThread, target.hostname, 0, batchFinishedPort)
  if (apid == 0) ns.tprintf(`Failed to run ${weakenScriptName}`)

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
  threadCount: number, hackScriptSize: number, growScriptSize: number, weakenScriptSize: number, linkScriptSize: number)
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
  const batchMemory = linkScriptSize
    + hackScriptSize * threadCount
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
