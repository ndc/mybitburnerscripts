import * as GLBP from "sharedvalues.ts"

export async function main(ns: NS) {
  const scriptName = ns.args[0] as string
  const targetName = ns.args[1] as string

  const hosts = queryBase(ns)
    .filter(s => s.hasAdminRights)
    .filter(s => (s.maxRam - s.ramUsed) > 4)
    .filter(s => !ns.scriptRunning("qoweaken.ts", s.hostname))
    .filter(s => s.hostname != "home")

  for (let host of hosts) {
    const msg = [scriptName, targetName, host.hostname]
    ns.tprintf(`sending %j`, msg)
    ns.writePort(GLBP.BATCHENDPORT, msg)
  }
}

function queryBase(ns: NS) {
  const serverInfoFile = "zserverinfo.json"
  const allservers = (JSON.parse(ns.read(serverInfoFile)) as { Svr: Server }[])
    .map(s => ns.getServer(s.Svr.hostname))
  return allservers
}
