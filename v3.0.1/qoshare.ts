export async function main(ns: NS) {
  ns.disableLog("ALL")
  const endPort = ns.args[0] as number
  const nextCommand = ns.args[1] as string
  const host = ns.args[2] as string
  await ns.share()
  const msg = [nextCommand, host]
  if (!!endPort) {
    ns.atExit(() => ns.writePort(endPort, msg))
  }
}