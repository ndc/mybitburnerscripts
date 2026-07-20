export async function main(ns: NS) {
  ns.disableLog("ALL")

  const serverInfoFile = "zserverinfo.json"
  const allservers: Server[] = (JSON.parse(ns.read(serverInfoFile)) as { Svr: Server }[])
    .map(s => ns.getServer(s.Svr.hostname))
  const person = ns.getPlayer()
  const result = allservers
    .filter(s => s.requiredHackingSkill! < person.skills.hacking)
    .filter(s => s.moneyMax! > 0)
    .filter(s => s.hasAdminRights)
    //.filter(s => ns.getServerMoneyAvailable(s.Svr.hostname) < 0.8 * (s.Svr.moneyMax ?? 0))
    .map(s => {
      const cloneTarget = structuredClone(s)
      cloneTarget.hackDifficulty = cloneTarget.minDifficulty
      const weakenTime = ns.formulas.hacking.weakenTime(cloneTarget, person)
      return {
        ...s,
        weakenTime: weakenTime,
        ratio: s.moneyMax! / weakenTime,
      }
    })
    .filter(s => s.weakenTime < 2 * 60 * 1000)
    .toSorted((a, b) => b.ratio - a.ratio
      || a.requiredHackingSkill! - b.requiredHackingSkill!)
    .slice(0, 3)

  for (let target of result) ns.tprintf("%j", target)
}
