export async function main(ns: NS) {
  const server = ns.args[0] as string

  if (!!server) {
    ns.killall(server)
    ns.cloud.deleteServer(server)
    return
  }

  const existing = ns.cloud.getServerNames()
  for (let i = 0; i < existing.length; i++) {
    const cserver = existing[i]
    ns.killall(cserver)
    ns.cloud.deleteServer(cserver)
  }
}