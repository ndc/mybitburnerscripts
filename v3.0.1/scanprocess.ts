export async function main(ns: NS) {
  ns.disableLog("ALL")

  const portNumber = ns.args[0] as number ?? null

  const originaltarget = "home"
  const maxDepth = 99

  const hacklevel = ns.getHackingLevel()
  let serverprocessed: string[] = []
  function scanRec(svrName: string, depth: number) {
    serverprocessed.push(svrName)
    const servers = ns.scan(svrName).filter(s => !serverprocessed.includes(s))
    ns.printf("%f scanning %s: %j", depth + 1, svrName, servers)
    for (let i = 0; i < servers.length; i++) {
      const server = servers[i]
      const serverlevel = ns.getServerRequiredHackingLevel(server)
      if (serverlevel > hacklevel) continue
      const pid = process(server)
      if (depth + 1 < maxDepth) scanRec(server, depth + 1)
    }
  }

  scanRec(originaltarget, 0)

  if (!!portNumber) ns.tryWritePort(portNumber, `Scan ${ns.pid} finished`)

  function process(svrName: string) {
    const scriptName = 'qoperate.ts'
    const weakenScript = "qoweaken.ts"
    const weakenLoopScript = "qoweakenloop.ts"
    if (ns.hasRootAccess(svrName)) {
      if (ns.scriptRunning(scriptName, svrName)
        || ns.scriptRunning(weakenScript, svrName)
        || ns.scriptRunning(weakenLoopScript, svrName)) {
        return 0
      }
      return runOp(svrName, scriptName)
    } else {
      if (!crackServer(svrName)) {
        return 0
      }
      return runOp(svrName, scriptName)
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
    const weakenEnd = ns.getServerMinSecurityLevel(svrName)
    const weakenStart = weakenEnd + 1
    const growEnd = ns.getServerMaxMoney(svrName)
    if (growEnd < 1) return 0
    const growStart = growEnd * 0.9
    ns.scp(scriptName, svrName)
    ns.printf("start %s %f", svrName, threadCount)
    return ns.exec(scriptName, svrName, threadCount, svrName, weakenStart, weakenEnd, growStart, growEnd)
  }
}