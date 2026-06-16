export async function main(ns: NS) {
  let targets = ns.args.map(a => a as string)

  const growScript = "qgrowtomax.ts"
  const linkScript = "qlink.ts"
  const scanScript = "scanprocess.ts"
  const serverInfoFile = "zserverinfo.json"

  const allservers: Info[] = JSON.parse(ns.read(serverInfoFile))
  const homeInfo = allservers.find(s => s.Svr.hostname == "home")!

  if (targets.length < 1) {
    targets = pickServers(ns, allservers)
  }

  const growScriptSize = 2.1
  const threadCount = Math.floor((homeInfo.Svr.maxRam - 16) / growScriptSize)

  if (threadCount < 1) {
    ns.tprintf("Not enough memory")
    return
  }

  ns.tprintf("grow %j", targets)

  globalThis.bitburnerPortCounter = globalThis.bitburnerPortCounter ?? 0

  for (let i = 0; i < targets.length; i++) {
    const target = allservers.find(s => s.Svr.hostname == targets[i])!
    const maxMoney = target.Svr.moneyMax!
    const weakenEnd = target.Svr.minDifficulty!
    const weakenStart = weakenEnd + 10

    globalThis.bitburnerPortCounter += 1
    const growEndPort = globalThis.bitburnerPortCounter

    globalThis.bitburnerPortCounter += 1
    const scanEndPort = globalThis.bitburnerPortCounter

    const pastScanPort = growEndPort - 1

    let linkGrowToScanArgs = [growEndPort, scanScript, "home", 1]
    if (i < targets.length - 1) linkGrowToScanArgs.push(scanEndPort)
    ns.exec(linkScript, "home", 1, ...linkGrowToScanArgs)

    if (i > 0) {
      const growArgs = [target.Svr.hostname, maxMoney, weakenStart, weakenEnd, growEndPort]
      const linkScanToGrowArgs = [pastScanPort, growScript, "home", threadCount, ...growArgs]
      ns.exec(linkScript, "home", 1, ...linkScanToGrowArgs)
    } else {
      await ns.sleep(1)  // make sure port listener is ready
      const growArgs = [target.Svr.hostname, maxMoney, weakenStart, weakenEnd, growEndPort]
      ns.exec(growScript, "home", threadCount, ...growArgs)
    }
  }
}

function pickServers(ns: NS, allservers: Info[]) {
  const hackLvl = ns.getHackingLevel()
  const result = allservers
    .filter(s => s.Svr.hasAdminRights)
    .filter(s => ![""].includes(s.Svr.hostname))
    .filter(s => (s.Svr.moneyMax ?? 0) > 0)
    .filter(s => (s.Svr.moneyAvailable ?? 0) < (s.Svr.moneyMax ?? 0) * 1 / 3)
    .filter(s => s.Svr.maxRam > 0)
    .filter(s => (s.Svr.requiredHackingSkill ?? 0) < (hackLvl * 2 / 3))
    .sort((a, b) => (b.Svr.serverGrowth ?? 0) - (a.Svr.serverGrowth ?? 0))
    .map(s => s.Svr.hostname)
    .slice(0, 1)
  return result
}

type Info = {
  Svr: Server
  Dep: number
  Parent: string
}
