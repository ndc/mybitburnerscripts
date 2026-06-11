export async function main(ns: NS) {
  const target = (ns.args[0] as string)
  const dryrun = (ns.args[1] as boolean) ?? false

  const scriptHostName = "home"
  const scriptHost = ns.getServer(scriptHostName)
  let remainingRam = scriptHost.maxRam - scriptHost.ramUsed

  let targets: string[]
  if (!!target) {
    targets = [target]
  } else {
    targets = pickServers(ns, scanNames(ns))
  }

  while (targets.length > 0) {
    const targetName = targets[0]
    targets = targets.slice(1)

    const data = collectData(ns, targetName, scriptHostName, dryrun)

    if (dryrun) {
      ns.ui.openTail()
      return
    }

    if (remainingRam < data.batchMemory) return
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

function collectData(ns: NS, targetName: string, scriptHostName: string, dryrun: boolean): BatchData {
  const person = ns.getPlayer()
  const target = ns.getServer(targetName)
  const hostServer = ns.getServer(scriptHostName)

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

  const weakenScriptName = "onlyweaken.ts"
  const weakenScriptSize = ns.getScriptRam(weakenScriptName)
  const growScriptName = "onlygrow.ts"
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

function pickServers(ns: NS, allservers: Info[]) {
  const hackingLevel = ns.getHackingLevel()
  const result = allservers
    .filter(s => s.Svr.hasAdminRights)
    .filter(s => (s.Svr.moneyMax ?? 0) > 0)
    .filter(s => (s.Svr.moneyAvailable ?? 0) < (s.Svr.moneyMax ?? 0) * 1 / 3)
    //.filter(s => s.Svr.maxRam > 0)
    .filter(s => (s.Svr.requiredHackingSkill ?? 0) < (hackingLevel * 2 / 3))
    .sort((a, b) => (a.Svr.moneyMax ?? 0) - (b.Svr.moneyMax ?? 0))
    .map(s => s.Svr.hostname)
  return result
}

type Info = {
  Svr: Server
  Dep: number
  Parent: string
}

function scanNames(ns: NS): Info[] {
  const processed: string[] = []
  return scanNames2("home", 0, "")

  function scanNames2(server: string, depth: number, parent: string): Info[] {
    processed.push(server)
    const links = ns.scan(server).filter(s => !processed.includes(s))
    //ns.printf("scanning %s got %j", server, links)
    const selfinfo = { Svr: ns.getServer(server), Dep: depth, Parent: parent } as Info
    if (links.length < 1) return [selfinfo]
    return links.reduce(
      (results, link): Info[] => results.concat(...scanNames2(link, depth + 1, server)),
      [selfinfo]
    )
  }
}
