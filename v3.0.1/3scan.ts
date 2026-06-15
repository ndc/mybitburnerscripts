export async function main(ns: NS) {
  ns.disableLog("ALL")
  const results: { thr: number, pct: number, mem: number }[] = []
  const host = ns.getServer("home")
  const target = ns.getServer("omega-net")
  const person = ns.getPlayer()
  const filename = "hack.txt"
  let hackPct = 0
  let hackThr = 1
  while (hackPct < 1) {
    const size = calculateBatchSize(ns, target, host, person, hackThr, 1.7, 1.75, 1.75)
    results.push({ thr: hackThr, pct: size.hackPct, mem: size.batchMemory })
    const thebuffer = `${hackThr},${size.hackPct},${size.batchMemory},${size.growThr},${size.hackWeakenThread},${size.growWeakenThread}`
    ns.write(filename, thebuffer, "a")
    ns.write(filename, "\r\n", "a")
    hackThr += 1
    hackPct = size.hackPct
  }
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

function queryBase(ns: NS) {
  const serverInfoFile = "zserverinfo.json"
  const allservers = (JSON.parse(ns.read(serverInfoFile)) as { Svr: Server }[])
    .map(s => ns.getServer(s.Svr.hostname))
  return allservers
}

/*

function queryBase(ns: NS) {
  const serverInfoFile = "zserverinfo.json"
  const allservers = (JSON.parse(ns.read(serverInfoFile)) as { Svr: Server }[])
    .map(s => ns.getServer(s.Svr.hostname))
  return allservers
}

function goodHost(ns: NS) {
  const serverInfoFile = "zserverinfo.json"
  const hackLvl = ns.getHackingLevel()
  const allservers: Info[] = JSON.parse(ns.read(serverInfoFile))
  return allservers
    .filter(s => s.Svr.hasAdminRights)
    .filter(s => (s.Svr.requiredHackingSkill ?? 0) >= hackLvl / 2)
    .filter(s => s.Svr.maxRam > 0)
    .map(s => ({
      hostname: s.Svr.hostname,
      cpuCores: s.Svr.cpuCores,
      maxRam: s.Svr.maxRam,
      requiredHackingSkill: s.Svr.requiredHackingSkill,
    }))
    .toSorted((a, b) => b.cpuCores - a.cpuCores
      || b.maxRam - a.maxRam)
}

function learnFunctions(ns: NS) {
  let person = ns.getPlayer()
  //ns.tprintf("player: %j", person)
  const targetName = "rothman-uni"
  const target = ns.getServer(targetName)
  ns.tprintf("target: %j", target)
  const homeServer = ns.getServer("home")

  const growthA = ns.growthAnalyze(targetName, 2, homeServer.cpuCores)
  ns.tprintf("growth analyze: %f how many threads to multiply to 2", growthA)
  const growthAS = ns.growthAnalyzeSecurity(1, targetName, homeServer.cpuCores)
  ns.tprintf("growth analyze security: %f", growthAS)
  const growA = ns.formulas.hacking.growAmount(target, person, 1, homeServer.cpuCores)
  ns.tprintf("grow amount: %f", growA)
  const moneyDeltaPercent = ns.formulas.hacking.growPercent(target, 1, person, homeServer.cpuCores)
  ns.tprintf("grow percent: %f", moneyDeltaPercent)
  const howManyThreads = ns.formulas.hacking.growThreads(target, person, target.moneyMax ?? 0, homeServer.cpuCores)
  ns.tprintf("grow threads: %f", howManyThreads)
  const gGrowT = ns.getGrowTime(targetName)
  ns.tprintf("get grow time: %f", gGrowT)
  const growT = ns.formulas.hacking.growTime(target, person)
  ns.tprintf("grow time: %f", growT)

  const hackA = ns.hackAnalyze(targetName)
  ns.tprintf("hack analyze: %f", hackA)
  const hackAT = ns.hackAnalyzeThreads(targetName, 1000000000)
  ns.tprintf("hack analyze threads: %f", hackAT)
  const hackP = ns.formulas.hacking.hackPercent(target, person)
  ns.tprintf("hack percent: %f", hackP)
  const gHackT = ns.getHackTime(targetName)
  ns.tprintf("get hack time: %f", gHackT)
  const hackT = ns.formulas.hacking.hackTime(target, person)
  ns.tprintf("hack time: %f", hackT)
  const hackAC = ns.hackAnalyzeChance(targetName)
  ns.tprintf("hack analyze chance: %f", hackAC)
  const hackC = ns.formulas.hacking.hackChance(target, person)
  ns.tprintf("hack chance: %f", hackC)
  const hackAS = ns.hackAnalyzeSecurity(1, targetName)
  ns.tprintf("hack analyze security: %f", hackAS)

  const weakenA = ns.weakenAnalyze(1, homeServer.cpuCores)
  ns.tprintf("weaken analyze: %f", weakenA)
  const weakenE = ns.formulas.hacking.weakenEffect(1, homeServer.cpuCores)
  ns.tprintf("weaken effect: %f", weakenE)
  const gWeakenT = ns.getWeakenTime(targetName)
  ns.tprintf("get weaken time: %f", gWeakenT)
  const weakenT = ns.formulas.hacking.weakenTime(target, person)
  ns.tprintf("weaken time: %f", weakenT)
}

function goodRatioServer(ns: NS) {
  const serverInfoFile = "zserverinfo.json"
  const hackLvl = ns.getHackingLevel()
  const allServers: Info[] = JSON.parse(ns.read(serverInfoFile))
  return allServers
    .filter(s => (s.Svr.requiredHackingSkill ?? 0) < hackLvl / 2)
    .map(s => ({
      hostname: s.Svr.hostname,
      moneyMax: s.Svr.moneyMax,
      minDifficulty: s.Svr.minDifficulty,
      ratio: (s.Svr.moneyMax ?? 0) / (s.Svr.minDifficulty ?? 1),
      requiredHackingSkill: s.Svr.requiredHackingSkill!,
    }))
    .toSorted((a, b) => b.ratio - a.ratio
      || a.requiredHackingSkill - b.requiredHackingSkill)
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

function tryscan(ns: NS, server: string) {
  const resultall = ns.scan(server)
  const withouttarget = resultall.filter(s => s != server)
  ns.printf("target: %j", server)
  ns.printf("scan: %j", resultall)
  ns.printf("filtered: %j", withouttarget)
}

function trygetserver(ns: NS, server: string) {
  const info = ns.getServer(server)
  ns.printf("%j", info)
}

async function tryport(ns: NS) {
  const portNumber = 9
  ns.exec("runonfinish.ts", "home", 1, portNumber, "scanprocess.ts", "home", 1)
  await ns.sleep(10)
  ns.writePort(portNumber, ["b", 2])
}

function tryweaken(ns: NS, server: string) {
  const ana = ns.weakenAnalyze(230, 1)
  ns.printf("weakenAnalyze %f threads: %f", 230, ana)
}

*/