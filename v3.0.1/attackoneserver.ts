export async function main(ns: NS) {
  ns.disableLog("ALL")

  const target = ns.args[0] as string

  const processed: string[] = []
  function scanNames(server: string, depth: number, action: (s: string) => void): string[] {
    processed.push(server)
    const links = ns.scan(server).filter(s => !processed.includes(s))
    ns.printf("scanning %s got %j", server, links)
    if (links.length < 1) return [server]
    return links.reduce(
      (results, link) => {
        action(link)
        return results.concat(...scanNames(link, depth + 1, action))
      },
      [server]
    )
  }

  const hacklevel = ns.getHackingLevel()

  scanNames(target, 0, process)

  function process(server: string): void {
    const serverlevel = ns.getServerRequiredHackingLevel(server)
    if (serverlevel > hacklevel) return
    const scriptName = 'operate.ts'
    if (ns.hasRootAccess(server)) {
      if (ns.scriptRunning(scriptName, server)) {
        return
      }
      runOp(server, scriptName)
    } else {
      if (!crackServer(server)) {
        return
      }
      runOp(server, scriptName)
    }
  }

  function crackServer(svrName: string) {
    ns.brutessh(svrName)
    ns.ftpcrack(svrName)
    ns.relaysmtp(svrName)
    ns.httpworm(svrName)
    ns.sqlinject(svrName)
    return ns.nuke(svrName)
  }

  function runOp(svrName: string, scriptName: string) {
    const threadCount = Math.floor(ns.getServerMaxRam(svrName) / ns.getScriptRam(scriptName))
    if (threadCount < 1) return 0
    const weakenEnd = ns.getServerMinSecurityLevel(target)
    const weakenStart = weakenEnd + 1
    const growEnd = ns.getServerMaxMoney(target)
    if (growEnd < 1) return 0
    const growStart = growEnd * 0.9
    ns.scp(scriptName, svrName)
    ns.printf("%s %f", svrName, threadCount)
    return ns.exec(scriptName, svrName, threadCount, target, weakenStart, weakenEnd, growStart, growEnd)
  }
}