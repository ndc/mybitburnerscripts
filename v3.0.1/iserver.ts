export async function main(ns: NS) {
  const server = ns.args[0] as string
  ns.disableLog("ALL")
  const info = ns.getServer(server)
  ns.tprintf("%j", info)
}