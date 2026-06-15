export async function main(ns: NS) {
  const scriptName = ns.args[0] as string
  const targetName = ns.args[1] as string

  let hosts = queryBase(ns)
    .map(s => s.hostname)

  if (!!scriptName) hosts.filter(s => ns.scriptRunning(scriptName, s))

  if (!!targetName) hosts = [targetName]

  for (let i = 0; i < hosts.length; i++) {
    const host = hosts[i]
    if (!!scriptName) {
      if (ns.scriptKill(scriptName, host)) ns.tprintf(`Killed ${scriptName} at ${host}`)
    } else {
      if (ns.killall(host)) ns.tprintf(`Killed all at ${host}`)
    }
  }
}

function queryBase(ns: NS) {
  const serverInfoFile = "zserverinfo.json"
  const allservers = (JSON.parse(ns.read(serverInfoFile)) as { Svr: Server }[])
    .map(s => s.Svr)
  return allservers
}
