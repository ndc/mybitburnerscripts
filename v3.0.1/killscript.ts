export async function main(ns: NS) {
  const scriptName = ns.args[0] as string

  const hosts = queryBase(ns)
    .filter(s => ns.scriptRunning(scriptName, s.hostname))
    .map(s => s.hostname)
  for (let i = 0; i < hosts.length; i++) {
    const host = hosts[i]
    if (ns.scriptKill(scriptName, host)) ns.tprintf(`Killed ${scriptName} at ${host}`)
  }
}

function queryBase(ns: NS) {
  const serverInfoFile = "zserverinfo.json"
  const allservers = (JSON.parse(ns.read(serverInfoFile)) as { Svr: Server }[])
    .map(s => s.Svr)
  return allservers
}
