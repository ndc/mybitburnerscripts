export async function main(ns: NS) {
  const [target1, dryrun, hostname1] = ns.args

  ns.disableLog("ALL")

  const hackScriptName = "qohack.ts"
  const hackScriptSize = 1.7
  const weakenScriptName = "qoweaken.ts"
  const weakenScriptSize = 1.75
  const growScriptName = "qogrow.ts"
  const growScriptSize = 1.75
  const linkScript = "qlink.ts"
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

  let threadCount = 0
  // @ignore-infinite
  while (true) {
    const batchSize = calculateBatchSize(ns, target, scriptHost, person,
      threadCount + 1, hackScriptSize, growScriptSize, weakenScriptSize)
    ns.printf("%j", batchSize)
    if (batchSize.batchMemory > scriptHost.maxRam) break
    if (batchSize.hackAmt > (target.moneyMax ?? 0)) break
    threadCount++
  }

  if (threadCount < 1) {
    ns.printf("Not enough memory")
    return
  }

  const batchSize = calculateBatchSize(ns, target, scriptHost, person,
    threadCount, hackScriptSize, growScriptSize, weakenScriptSize)
  ns.printf(`Using ${threadCount} hack threads`)
  ns.printf("%j", batchSize)

  if (dryrun) {
    ns.ui.openTail()
    return
  }

  globalThis.bitburnerPortCounter += 1
  const batchFinishedPort = globalThis.bitburnerPortCounter

  if (scriptHost.hostname != "home")
    ns.scp([hackScriptName, weakenScriptName, growScriptName], scriptHost.hostname)

  const batchArgs = [target.hostname, false, scriptHost.hostname]
  const linkArgs = [batchFinishedPort, batchScriptName, "home", 1, ...batchArgs]
  ns.exec(linkScript, "home", 1, ...linkArgs)
  await ns.sleep(1)  // wait for port listener to be ready

  ns.exec(hackScriptName, scriptHost.hostname, threadCount, target.hostname, hackDelay)
  ns.exec(weakenScriptName, scriptHost.hostname, batchSize.hackWeakenThread, target.hostname, 1)
  ns.exec(growScriptName, scriptHost.hostname, batchSize.growThr, target.hostname, growDelay + 2)
  ns.exec(weakenScriptName, scriptHost.hostname, batchSize.growWeakenThread, target.hostname, 3, batchFinishedPort)
}

type BatchSize = {
  hackAmt: number
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
  target.moneyAvailable = target.moneyMax
  target.hackDifficulty = target.minDifficulty
  const hackPct = threadCount * ns.formulas.hacking.hackPercent(target, person)
  const hackAmt = hackPct * (target.moneyMax ?? 0)
  const hackEffect = ns.hackAnalyzeSecurity(threadCount, undefined)
  const weakenEff = ns.formulas.hacking.weakenEffect(1, host.cpuCores)
  const hackWeakenThread = Math.ceil(hackEffect / weakenEff)
  target.moneyAvailable = (target.moneyMax ?? 0) - hackAmt
  const growThr = ns.formulas.hacking.growThreads(target, person, target.moneyMax ?? 0, host.cpuCores)
  const growEffect = ns.growthAnalyzeSecurity(growThr, undefined, host.cpuCores)
  const growWeakenThread = Math.ceil(growEffect / weakenEff)
  const batchMemory = hackScriptSize * threadCount
    + weakenScriptSize * hackWeakenThread
    + growScriptSize * growThr
    + weakenScriptSize * growWeakenThread
  return {
    hackAmt: hackAmt,
    hackWeakenThread: hackWeakenThread,
    hackEffect: hackEffect,
    growThr: growThr,
    growWeakenThread: growWeakenThread,
    growEffect: growEffect,
    batchMemory: batchMemory,
  }
}
