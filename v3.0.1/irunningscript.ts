export async function main(ns: NS) {
  const scriptName = ns.args[0] as string

  const hosts = queryBase(ns)
    .filter(s => ns.scriptRunning(scriptName, s.hostname))
    .map(s => s.hostname)
  ns.printf("%j", hosts)
  ns.ui.openTail()
}

function queryBase(ns: NS) {
  const serverInfoFile = "zserverinfo.json"
  const allservers = (JSON.parse(ns.read(serverInfoFile)) as { Svr: Server }[])
    .map(s => s.Svr)
  return allservers
}
