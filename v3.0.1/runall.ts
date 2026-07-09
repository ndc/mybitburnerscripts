import * as GLBL from "sharedvalues.ts"

export async function main(ns: NS) {
  const commandName = ns.args[0] as string
  const targetName = ns.args[1] as string

  const scriptCheck = (commandName == GLBL.ACTSHARE) ? "qoshare.ts" : "qoweaken.ts"

  const hosts = queryBase(ns)
    .filter(s => s.hasAdminRights)
    .filter(s => (s.maxRam - s.ramUsed) > 4)
    .filter(s => !ns.scriptRunning(scriptCheck, s.hostname))
    .filter(s => s.hostname != "home")

  for (let host of hosts) {
    let msg: string[] = []
    if (commandName == GLBL.ACTSHARE) msg = [commandName, host.hostname]
    else msg = [commandName, targetName, host.hostname]
    ns.tprintf(`sending %j`, msg)
    ns.writePort(GLBL.BATCHENDPORT, msg)
  }
}

function queryBase(ns: NS) {
  const serverInfoFile = "zserverinfo.json"
  const allservers = (JSON.parse(ns.read(serverInfoFile)) as { Svr: Server }[])
    .map(s => ns.getServer(s.Svr.hostname))
  return allservers
}
