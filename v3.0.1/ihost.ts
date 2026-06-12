export async function main(ns: NS) {
  ns.disableLog("ALL")

  const serverInfoFile = "zserverinfo.json"
  const hackLvl = ns.getHackingLevel()
  const allservers: Info[] = JSON.parse(ns.read(serverInfoFile))
  const result = allservers
    .filter(s => s.Svr.hasAdminRights)
    .filter(s => (s.Svr.requiredHackingSkill ?? 0) >= hackLvl * 1 / 2)
    .filter(s => s.Svr.maxRam > 0)
    .map(s => ({
      hostname: s.Svr.hostname,
      cpuCores: s.Svr.cpuCores,
      maxRam: s.Svr.maxRam,
      requiredHackingSkill: s.Svr.requiredHackingSkill,
    }))
    .toSorted((a, b) => b.cpuCores - a.cpuCores
      || b.maxRam - a.maxRam)
    //.slice(0, 3)

  ns.tprintf("%j", result)
  //ns.ui.openTail()
}

type Info = {
  Svr: Server
  Dep: number
  Parent: string
}
