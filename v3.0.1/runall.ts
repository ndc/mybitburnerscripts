export async function main(ns: NS) {
  const scriptName = ns.args[0] as string
  const targetName = ns.args[1] as string

  const hosts = queryBase(ns)
    .filter(s => s.hasAdminRights)
    .filter(s => (s.maxRam - s.ramUsed) > 4)
    //.filter(s => !ns.scriptRunning("qoweaken.ts", s.hostname))
    .filter(s => s.hostname != "home")
  let apid = 0
  for (let i = 0; i < hosts.length; i++) {
    const host = hosts[i]
    ns.tprintf(`${host.hostname}`)
    apid = ns.exec(scriptName, "home", 1, targetName, false, host.hostname)
    if (apid == 0) ns.tprintf(`Failed to run at ${host.hostname}`)
  }
}

function queryBase(ns: NS) {
  const serverInfoFile = "zserverinfo.json"
  const allservers = (JSON.parse(ns.read(serverInfoFile)) as { Svr: Server }[])
    .map(s => ns.getServer(s.Svr.hostname))
  return allservers
}
