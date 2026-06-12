export async function main(ns: NS) {
  ns.disableLog("ALL")

  const serverInfoFile = "zserverinfo.json"
  const hackLvl = ns.getHackingLevel()
  const allservers: Info[] = JSON.parse(ns.read(serverInfoFile))
  const result = allservers
    .filter(s => (s.Svr.requiredHackingSkill ?? 0) < (hackLvl * 1 / 2))
    .filter(s => (s.Svr.moneyMax ?? 0) > 0)
    .filter(s => ns.getServerMoneyAvailable(s.Svr.hostname) < 0.8 * (s.Svr.moneyMax ?? 0))
    .map(s => ({
      hostname: s.Svr.hostname,
      moneyMax: s.Svr.moneyMax,
      minDifficulty: s.Svr.minDifficulty,
      ratio: (s.Svr.moneyMax ?? 0) / (s.Svr.minDifficulty ?? 1),
      requiredHackingSkill: s.Svr.requiredHackingSkill!,
      maxRam: s.Svr.maxRam,
      serverGrowth: s.Svr.serverGrowth,
    }))
    .toSorted((a, b) => b.ratio - a.ratio
      || a.requiredHackingSkill - b.requiredHackingSkill)
  //.slice(0, 3)

  ns.tprintf("%j", result)
  //ns.ui.openTail()
}

type Info = {
  Svr: Server
  Dep: number
  Parent: string
}
