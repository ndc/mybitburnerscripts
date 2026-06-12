export async function main(ns: NS) {
  const scriptHostName = (ns.args[0] as string) ?? "home"
  const dryrun = (ns.args[1] as boolean) ?? false
  const target = (ns.args[2] as string)

  ns.disableLog("ALL")

  const serverInfoFile = "zserverinfo.json"
  const allservers: Info[] = JSON.parse(ns.read(serverInfoFile))
  const scriptHost = allservers.find(s => s.Svr.hostname == scriptHostName)!.Svr
  let remainingRam = scriptHost.maxRam - scriptHost.ramUsed

  const person = ns.getPlayer()

  let targets: string[]
  if (!!target) {
    targets = [target]
  } else {
    targets = pickServers(ns, allservers, person.skills.hacking)
  }

  while (targets.length > 0) {
    const targetName = targets[0]
    targets = targets.slice(1)

    const target = allservers.find(s => s.Svr.hostname == targetName)!.Svr
    const data = collectData(ns, target, scriptHost, dryrun, person)
    ns.printf("%j", data)

    if (dryrun) {
      ns.ui.openTail()
      return
    }

    if (remainingRam < data.batchMemory) {
      ns.printf(`Remaining ${remainingRam} script ${data.batchMemory}`)
      continue
    }

    remainingRam -= data.batchMemory

    if (scriptHostName != "home")
      ns.scp([data.weakenScriptName, data.growScriptName], scriptHostName)

    if (data.prepWeakenThread > 0)
      ns.exec(data.weakenScriptName, scriptHostName, data.prepWeakenThread, targetName, 0)
    if (data.growThr > 0)
      ns.exec(data.growScriptName, scriptHostName, data.growThr, targetName, data.growDelay + 1)
    if (data.growWeakenThread > 0)
      ns.exec(data.weakenScriptName, scriptHostName, data.growWeakenThread, targetName, 2)
  }
}

type BatchData = {
  weakenScriptName: string
  growScriptName: string
  prepWeakenThread: number
  growThr: number
  growDelay: number
  growWeakenThread: number
  batchMemory: number
}

function collectData(ns: NS, target: Server, hostServer: Server, dryrun: boolean, person: Player): BatchData {
  const weakenEff = ns.formulas.hacking.weakenEffect(1, hostServer.cpuCores)
  const prepWeakenThread = Math.ceil(
    ((target.hackDifficulty ?? 0) - (target.minDifficulty ?? 0)) / weakenEff)

  if (dryrun) ns.printf("%j", {
    weakenEff: weakenEff,
    prepWeakenThread: prepWeakenThread
  })

  const growEffect = ns.growthAnalyzeSecurity(1, undefined, hostServer.cpuCores)
  const growThr = ns.formulas.hacking.growThreads(target, person, target.moneyMax ?? 0, hostServer.cpuCores)
  const growWeakenThread = Math.ceil(growEffect * growThr / weakenEff)

  if (dryrun) ns.printf("%j", {
    growEffect: growEffect,
    growThr: growThr,
    growWeakenThread: growWeakenThread,
  })

  const weakenScriptName = "qoweaken.ts"
  const weakenScriptSize = ns.getScriptRam(weakenScriptName)
  const growScriptName = "qogrow.ts"
  const growScriptSize = ns.getScriptRam(growScriptName)
  const batchMemory = prepWeakenThread * weakenScriptSize
    + growThr * growScriptSize
    + growWeakenThread * weakenScriptSize

  if (dryrun) ns.printf("%j", {
    weakenScriptSize: weakenScriptSize,
    growScriptSize: growScriptSize,
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
    weakenScriptName: weakenScriptName,
    growScriptName: growScriptName,
    prepWeakenThread: prepWeakenThread,
    growThr: growThr,
    growDelay: growDelay,
    growWeakenThread: growWeakenThread,
    batchMemory: batchMemory,
  }
}

function pickServers(ns: NS, allservers: Info[], hackingLevel: number) {
  const result = allservers
    .filter(s => s.Svr.hasAdminRights)
    .filter(s => (s.Svr.moneyMax ?? 0) > 0)
    .filter(s => (s.Svr.moneyAvailable ?? 0) < (s.Svr.moneyMax ?? 0) * 1 / 3)
    //.filter(s => s.Svr.maxRam > 0)
    .filter(s => (s.Svr.requiredHackingSkill ?? 0) < (hackingLevel * 1 / 2))
    .sort((a, b) => (b.Svr.serverGrowth ?? 0) - (a.Svr.serverGrowth ?? 0))
    .map(s => s.Svr.hostname)
  ns.printf("Pick: %j", result)
  return result
}

type Info = {
  Svr: Server
  Dep: number
  Parent: string
}
