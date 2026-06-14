export async function main(ns: NS) {
  const target = ns.args[0] as string
  const addWait = ns.args[1] as number
  const endPort = ns.args[2] as number
  await ns.weaken(target, { additionalMsec: addWait })
  const msg = `Weaken ${target} PID ${ns.pid} finished`
  if (!!endPort) {
    ns.tryWritePort(endPort, msg)
  }
}