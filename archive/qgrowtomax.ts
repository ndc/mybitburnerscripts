export async function main(ns: NS) {
  const target = ns.args[0] as string
  const growEnd = ns.args[1] as number
  const weakenStart = ns.args[2] as number
  const weakenEnd = ns.args[3] as number
  const portNumber = ns.args[4] as number

  const timeStart = Date.now()

  while (ns.getServerMoneyAvailable(target) < growEnd) {
    await reduceSec()
    await ns.grow(target)
  }

  while (ns.getServerSecurityLevel(target) > weakenEnd)
    await ns.weaken(target)

  const duration = Math.round((Date.now() - timeStart) / 1000)

  if (!!portNumber) ns.tryWritePort(portNumber, `Finished growing ${target} for ${duration}s PID ${ns.pid}`)

  async function reduceSec() {
    if (ns.getServerSecurityLevel(target) > weakenStart)
      while (ns.getServerSecurityLevel(target) > weakenEnd)
        await ns.weaken(target)
  }
}