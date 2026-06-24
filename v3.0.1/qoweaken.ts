export async function main(ns: NS) {
  const target = ns.args[0] as string
  const addWait = ns.args[1] as number
  const endPort = ns.args[2] as number
  const nextScript = ns.args[3] as string
  const host = ns.args[4] as string
  await ns.weaken(target, { additionalMsec: addWait })
  const msg = [nextScript, target, host]
  if (!!endPort) {
    ns.tryWritePort(endPort, msg)
  }
}