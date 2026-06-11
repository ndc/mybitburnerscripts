export async function main(ns: NS) {
  ns.disableLog("ALL")

  const allservers = scanNames(ns)

  printservers(ns, allservers)
}

function printservers(ns: NS, allservers: Info[]) {
  const result = allservers.map(s => ({
    hostname: s.Svr.hostname,
    moneyMax: s.Svr.moneyMax ?? 0,
    serverGrowth: s.Svr.serverGrowth ?? 0,
    requiredHackingSkill: s.Svr.requiredHackingSkill ?? 0,
    minDifficulty: s.Svr.minDifficulty,
    numOpenPortsRequired: s.Svr.numOpenPortsRequired,
    maxRam: s.Svr.maxRam,
    cpuCores: s.Svr.cpuCores,
    parent: s.Parent
  }))
    //.filter(s => s.requiredHackingSkill <= 500)
    .sort((a, b) => b.moneyMax - a.moneyMax)
  //.slice(0, 10)
  ns.printf("%j", result)
  ns.ui.openTail()
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
