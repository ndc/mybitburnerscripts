export async function main(ns: NS) {
  let targets = ns.args.map(a => a as string)

  const growScript = "growtomax.ts"
  const linkScript = "runonfinish.ts"
  const scanScript = "scanprocess.ts"
  const threadCount = Math.floor((ns.getServerMaxRam() - 64) / ns.getScriptRam(growScript))

  if (ns.scriptRunning(growScript)) {
    ns.tprint("There is still grow script running")
    return
  }

  if (targets.length < 1) {
    targets = pickServers(ns, scanNames(ns))
  }
  ns.tprintf("grow %j", targets)

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i]
    const maxMoney = ns.getServerMaxMoney(target)
    const weakenEnd = ns.getServerMinSecurityLevel(target)
    const weakenStart = weakenEnd + 10
    const growEndPort = i * 2 + 1
    const scanEndPort = i * 2 + 2
    const pastScanPort = growEndPort - 1

    let linkGrowToScanArgs = [growEndPort, scanScript, "home", 1]
    if (i < targets.length - 1) linkGrowToScanArgs.push(scanEndPort)
    ns.exec(linkScript, "home", 1, ...linkGrowToScanArgs)

    if (i > 0) {
      const growArgs = [target, maxMoney, weakenStart, weakenEnd, growEndPort]
      const linkScanToGrowArgs = [pastScanPort, growScript, "home", threadCount, ...growArgs]
      ns.exec(linkScript, "home", 1, ...linkScanToGrowArgs)
    } else {
      await ns.sleep(1)  // make sure port listener is ready
      const growArgs = [target, maxMoney, weakenStart, weakenEnd, growEndPort]
      ns.exec(growScript, "home", threadCount, ...growArgs)
    }
  }
}

function pickServers(ns: NS, allservers: Info[]) {
  const result = allservers
    .filter(s => s.Svr.hasAdminRights)
    .filter(s => (s.Svr.moneyMax ?? 0) > 0)
    .filter(s => (s.Svr.moneyAvailable ?? 0) < (s.Svr.moneyMax ?? 0) * 1 / 3)
    .filter(s => s.Svr.maxRam > 0)
    .filter(s => (s.Svr.requiredHackingSkill ?? 0) < (ns.getHackingLevel() * 2 / 3))
    .sort((a, b) => (a.Svr.moneyMax ?? 0) - (b.Svr.moneyMax ?? 0))
    .map(s => s.Svr.hostname)
    .slice(0, 1)
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
