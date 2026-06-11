export async function main(ns: NS) {
  const targetName = (ns.args[0] as string)
  const scriptHostName = (ns.args[1] as string) ?? "home"
  const monitorHostName = (ns.args[2] as string) ?? "home"
  const fanout = (ns.args[3] as boolean) ?? false
  const dryrun = (ns.args[4] as boolean) ?? false

  const data = collectData(ns, targetName, scriptHostName, dryrun)

  if (dryrun) {
    ns.ui.openTail()
    return
  }

  const linkScript = "runonfinish.ts"
  const batchScriptName = ns.getScriptName()

  if (scriptHostName != "home")
    ns.scp([data.hackScriptName, data.weakenScriptName, data.growScriptName, batchScriptName], scriptHostName)

  if (monitorHostName != "home")
    ns.scp([linkScript], monitorHostName)

  const sleepPerBatch = 5000
  const toCoverWeakenTime = Math.floor(data.weakenTim / sleepPerBatch)
  const fiveMinutes = 5 * 60 * 1000
  let batchCount = data.howManyBatch
  if (batchCount > toCoverWeakenTime) batchCount = toCoverWeakenTime
  if (batchCount > fiveMinutes) batchCount = fiveMinutes
  const concurrentCount = fanout ? batchCount : 1

  for (let i = 1; i <= concurrentCount; i++) {
    globalThis.bitburnerPortCounter = globalThis.bitburnerPortCounter ?? 0
    globalThis.bitburnerPortCounter += 1

    const batchFinishedPort = globalThis.bitburnerPortCounter
    const batchArgs = [targetName, scriptHostName, monitorHostName]
    const linkArgs = [batchFinishedPort, batchScriptName, scriptHostName, 1, ...batchArgs]

    ns.exec(linkScript, monitorHostName, 1, ...linkArgs)
    await ns.sleep(1)  // wait for port listener to be ready

    ns.exec(data.hackScriptName, scriptHostName, data.hackThread, targetName, data.hackDelay)
    ns.exec(data.weakenScriptName, scriptHostName, data.hackWeakenThread, targetName, 1)
    ns.exec(data.growScriptName, scriptHostName, data.growThr, targetName, data.growDelay + 2)
    ns.exec(data.weakenScriptName, scriptHostName, data.growWeakenThread, targetName, 3, batchFinishedPort)
    await ns.sleep(sleepPerBatch)
  }
}

type BatchData = {
  hackScriptName: string
  weakenScriptName: string
  growScriptName: string
  hackThread: number
  hackDelay: number
  hackWeakenThread: number
  growThr: number
  growDelay: number
  growWeakenThread: number
  weakenTim: number
  howManyBatch: number
}

function collectData(ns: NS, targetName: string, scriptHostName: string, dryrun: boolean): BatchData {
  const person = ns.getPlayer()
  const target = ns.getServer(targetName)
  const hostServer = ns.getServer(scriptHostName)

  const hackPct = ns.formulas.hacking.hackPercent(target, person)
  let hackThread = (hackPct >= 0.2)
    ? 1
    : Math.floor(0.2 / hackPct)
  const hackSecurity = ns.hackAnalyzeSecurity(hackThread, targetName)
  const weakenEff = ns.formulas.hacking.weakenEffect(1, hostServer.cpuCores)
  const hackWeakenThread = Math.ceil(hackSecurity / weakenEff)

  if (dryrun) ns.printf("%j", {
    hackPct: hackPct,
    hackThread: hackThread,
    hackSecurity: hackSecurity,
    weakenEff: weakenEff,
    hackWeakenThread: hackWeakenThread
  })

  const growEffect = ns.growthAnalyzeSecurity(1, undefined, hostServer.cpuCores)
  target.moneyAvailable = (target.moneyMax ?? 0) * 0.8
  const growThr = ns.formulas.hacking.growThreads(target, person, target.moneyMax ?? 0, hostServer.cpuCores)
  const growWeakenThread = Math.ceil(growEffect * growThr / weakenEff)

  if (dryrun) ns.printf("%j", {
    growEffect: growEffect,
    growThr: growThr,
    growWeakenThread: growWeakenThread,
  })

  const hackScriptName = "onlyhack.ts"
  const hackScriptSize = ns.getScriptRam(hackScriptName)
  const weakenScriptName = "onlyweaken.ts"
  const weakenScriptSize = ns.getScriptRam(weakenScriptName)
  const growScriptName = "onlygrow.ts"
  const growScriptSize = ns.getScriptRam(growScriptName)
  const batchMemory = hackThread * hackScriptSize
    + hackWeakenThread * weakenScriptSize
    + growThr * growScriptSize
    + growWeakenThread * weakenScriptSize
  const howManyBatch = Math.floor(
    (hostServer.hostname == "home" ? (hostServer.maxRam - hostServer.ramUsed - 64) : hostServer.maxRam)
    / batchMemory)

  if (dryrun) ns.printf("%j", {
    hackScriptSize: hackScriptSize,
    weakenScriptSize: weakenScriptSize,
    growScriptSize: growScriptSize,
    batchMemory: batchMemory,
    howManyBatch: howManyBatch,
  })

  const hackTim = ns.formulas.hacking.hackTime(target, person)
  const weakenTim = ns.formulas.hacking.weakenTime(target, person)
  const growTim = ns.formulas.hacking.growTime(target, person)
  const weakenVsHack = Math.floor(weakenTim / hackTim)
  const growVsHack = growTim / hackTim
  const weakenVsGrow = weakenTim / growTim
  const hackDelay = weakenTim - hackTim
  const growDelay = weakenTim - growTim

  if (dryrun) ns.printf("%j", {
    hackTim: hackTim,
    weakenTim: weakenTim,
    growTim: growTim,
    weakenVsHack: weakenVsHack,
    growVsHack: growVsHack,
    weakenVsGrow: weakenVsGrow,
    hackDelay: hackDelay,
    growDelay: growDelay,
  })

  return {
    hackScriptName: hackScriptName,
    weakenScriptName: weakenScriptName,
    growScriptName: growScriptName,
    hackThread: hackThread,
    hackDelay: hackDelay,
    hackWeakenThread: hackWeakenThread,
    growThr: growThr,
    growDelay: growDelay,
    growWeakenThread: growWeakenThread,
    weakenTim: weakenTim,
    howManyBatch: howManyBatch,
  }
}