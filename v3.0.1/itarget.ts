export async function main(ns: NS) {
  ns.disableLog("ALL")

  const serverInfoFile = "zserverinfo.json"
  const hackLvl = ns.getHackingLevel()
  const allservers: Server[] = (JSON.parse(ns.read(serverInfoFile)) as { Svr: Server }[])
    .map(s => ns.getServer(s.Svr.hostname))
  const person = ns.getPlayer()
  const result = allservers
    .filter(s => (s.requiredHackingSkill ?? 0) < (hackLvl * 1 / 2))
    .filter(s => (s.moneyMax ?? 0) > 0)
    //.filter(s => ns.getServerMoneyAvailable(s.Svr.hostname) < 0.8 * (s.Svr.moneyMax ?? 0))
    .map(s => {
      const cloneTarget = structuredClone(s)
      cloneTarget.hackDifficulty = cloneTarget.minDifficulty
      const weakenMinute = ns.formulas.hacking.weakenTime(cloneTarget, person) / 1000 / 60
      return {
        hostname: s.hostname,
        moneyPct: (s.moneyAvailable ?? 0) / (s.moneyMax ?? 1),
        moneyMax: s.moneyMax,
        minDifficulty: s.minDifficulty,
        hackDifficulty: s.hackDifficulty,
        ratio: (s.moneyMax ?? 0) / (s.minDifficulty ?? 1),
        requiredHackingSkill: s.requiredHackingSkill!,
        weakenMinute: weakenMinute,
        maxRam: s.maxRam,
        serverGrowth: s.serverGrowth,
      }
    })
    .toSorted((a, b) => b.ratio - a.ratio
      || a.requiredHackingSkill - b.requiredHackingSkill)

  ns.tprintf("%j", result)
}
