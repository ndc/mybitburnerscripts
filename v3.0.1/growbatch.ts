export async function main(ns: NS) {
  const targetName = (ns.args[0] as string)
  const dryrun = (ns.args[1] as boolean) ?? false
  const scriptHostName = (ns.args[2] as string) ?? "home"

  ns.disableLog("ALL")

  const target = ns.getServer(targetName)
  const scriptHost = ns.getServer(scriptHostName)
  const person = ns.getPlayer()
  const weakenScriptName = "qoweaken.ts"
  const weakenScriptSize = ns.getScriptRam(weakenScriptName)
  const growScriptName = "qogrow.ts"
  const growScriptSize = ns.getScriptRam(growScriptName)

  const data = collectData(ns, target, scriptHost, person, weakenScriptSize, growScriptSize, dryrun)
  ns.printf("%j", data)

  if (dryrun) {
    ns.ui.openTail()
    return
  }

  const buffer = (scriptHostName == "home") ? 64 : 0
  let remainingRam = scriptHost.maxRam - scriptHost.ramUsed - buffer
  if (remainingRam < data.batchMemory) {
    ns.tprintf(`${ns.getScriptName()}: not enough memory in ${scriptHostName}, ${data.batchMemory} needed ${remainingRam} available`)
    return
  }

  if (scriptHostName != "home")
    ns.scp([weakenScriptName, growScriptName], scriptHostName)

  let apid = 0
  if (data.prepWeakenThread > 0) {
    apid = ns.exec(weakenScriptName, scriptHostName, data.prepWeakenThread, targetName, 0)
    if (apid == 0) ns.tprintf(`Failed to run ${weakenScriptName}`)
  }
  if (data.growThr > 0) {
    apid = ns.exec(growScriptName, scriptHostName, data.growThr, targetName, data.growDelay + 1)
    if (apid == 0) ns.tprintf(`Failed to run ${growScriptName}`)
  }
  if (data.growWeakenThread > 0) {
    apid = ns.exec(weakenScriptName, scriptHostName, data.growWeakenThread, targetName, 2)
    if (apid == 0) ns.tprintf(`Failed to run ${weakenScriptName}`)
  }
}

type BatchData = {
  prepWeakenThread: number
  growThr: number
  growDelay: number
  growWeakenThread: number
  batchMemory: number
}

function collectData(ns: NS, target: Server, hostServer: Server, person: Player,
  weakenScriptSize: number, growScriptSize: number, dryrun: boolean): BatchData {
  const weakenEff = ns.formulas.hacking.weakenEffect(1, hostServer.cpuCores)
  const prepWeakenThread = Math.ceil(
    ((target.hackDifficulty ?? 0) - (target.minDifficulty ?? 0)) / weakenEff)

  if (dryrun) ns.printf("%j", {
    weakenEff: weakenEff,
    prepWeakenThread: prepWeakenThread
  })

  const growThr = ns.formulas.hacking.growThreads(target, person, target.moneyMax ?? 0, hostServer.cpuCores)
  const growEffect = ns.growthAnalyzeSecurity(growThr, undefined, hostServer.cpuCores)
  const growWeakenThread = Math.ceil(growEffect / weakenEff)

  if (dryrun) ns.printf("%j", {
    growEffect: growEffect,
    growThr: growThr,
    growWeakenThread: growWeakenThread,
  })

  const batchMemory = prepWeakenThread * weakenScriptSize
    + growThr * growScriptSize
    + growWeakenThread * weakenScriptSize

  if (dryrun) ns.printf("%j", {
    batchMemory: batchMemory,
  })

  const weakenTim = ns.formulas.hacking.weakenTime(target, person)
  const growTim = ns.formulas.hacking.growTime(target, person)
  const weakenVsGrow = weakenTim / growTim
  const growDelay = weakenTim - growTim

  if (dryrun) ns.printf("%j", {
    weakenTim: weakenTim,
    growTim: growTim,
    weakenVsGrow: weakenVsGrow,
    growDelay: growDelay,
  })

  return {
    prepWeakenThread: prepWeakenThread,
    growThr: growThr,
    growDelay: growDelay,
    growWeakenThread: growWeakenThread,
    batchMemory: batchMemory,
  }
}
