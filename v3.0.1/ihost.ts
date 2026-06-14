export async function main(ns: NS) {
  ns.disableLog("ALL")

  const serverInfoFile = "zserverinfo.json"
  const hackLvl = ns.getHackingLevel()
  const allservers: Server[] = (JSON.parse(ns.read(serverInfoFile)) as { Svr: Server }[])
    .map(s => ns.getServer(s.Svr.hostname))
  const result = allservers
    .filter(s => s.hasAdminRights)
    .filter(s => s.maxRam > 0)
    .filter(s => s.cpuCores > 1)
    .map(s => ({
      hostname: s.hostname,
      cpuCores: s.cpuCores,
      maxRam: s.maxRam,
      requiredHackingSkill: s.requiredHackingSkill ?? 0,
      moneyMax: s.moneyMax,
    }))
    .toSorted((a, b) => b.cpuCores - a.cpuCores
      || b.maxRam - a.maxRam
      || b.requiredHackingSkill - a.requiredHackingSkill)

  ns.tprintf("%j", result)
}
