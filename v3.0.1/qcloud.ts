export async function main(ns: NS) {
  const allServers = scanNames(ns, "home")
  const hackLevel = ns.getHackingLevel()
  const processed = ns.cloud.getServerNames()
  const cloudNamePrefix = "cloud."
  const scriptName = 'operate.ts'

  const unprocessed = allServers
    .filter(s => (s.Svr.moneyMax ?? 0) > 25000000)
    .filter(s => s.Svr.hasAdminRights)
    .filter(s => s.Svr.maxRam < 1)
    .filter(s => (s.Svr.requiredHackingSkill ?? 0) < (hackLevel / 3))
    .filter(s => !processed.includes(cloudNamePrefix + s.Svr.hostname))
  ns.tprintf("%j", unprocessed.map(u => u.Svr.hostname))

  for (let i = 0; i < unprocessed.length; i++) {
    const target = unprocessed[i]
    const ramNeeded = 32
    const cloudName = cloudNamePrefix + target.Svr.hostname
    ns.cloud.purchaseServer(cloudName, ramNeeded)
    runOp(ns, cloudName, target.Svr.hostname, scriptName)
  }
}

function runOp(ns: NS, cserver: string, target: string, scriptName: string) {
  const threadCount = Math.floor(ns.getServerMaxRam(cserver) / ns.getScriptRam(scriptName))
  if (threadCount < 1) return 0
  const weakenEnd = ns.getServerMinSecurityLevel(target)
  const weakenStart = weakenEnd + 1
  const growEnd = ns.getServerMaxMoney(target)
  if (growEnd < 1) return 0
  const growStart = growEnd * 0.9
  ns.scp(scriptName, cserver)
  ns.printf("start %s %f", cserver, threadCount)
  return ns.exec(scriptName, cserver, threadCount, target, weakenStart, weakenEnd, growStart, growEnd)
}

type Info = {
  Svr: Server
  Dep: number
  Parent: string
}

function scanNames(ns: NS, server2: string): Info[] {
  const processed: string[] = []
  return scanNames2(server2, 0, "")

  function scanNames2(server: string, depth: number, parent: string): Info[] {
    processed.push(server)
    const links = ns.scan(server).filter(s => !processed.includes(s))
    //ns.printf("scanning %s got %j", server, links)
    const selfinfo = {
      Svr: ns.getServer(server),
      Dep: depth,
      Parent: parent,
    } as Info
    if (links.length < 1) return [selfinfo]
    return links.reduce(
      (results, link): Info[] => results.concat(...scanNames2(link, depth + 1, server)),
      [selfinfo]
    )
  }
}
