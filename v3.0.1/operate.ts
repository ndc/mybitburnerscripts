export async function main(ns: NS) {
  const target = ns.args[0] as string
  const weakenStart = ns.args[1] as number
  const weakenEnd = ns.args[2] as number
  const growStart = ns.args[3] as number
  const growEnd = ns.args[4] as number

  while (true) {
    if (ns.getServerMoneyAvailable(target) < growStart)
      while (ns.getServerMoneyAvailable(target) < growEnd) {
        await reduceSec()
        await ns.grow(target)
      }

    await reduceSec()
    await ns.hack(target)
  }

  async function reduceSec() {
    if (ns.getServerSecurityLevel(target) > weakenStart)
      while (ns.getServerSecurityLevel(target) > weakenEnd)
        await ns.weaken(target)
  }
}