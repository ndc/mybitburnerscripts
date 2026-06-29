export async function main(ns: NS) {
  ns.disableLog("ALL")
  const target = ns.args[0] as string
  const addWait = ns.args[1] as number
  await ns.grow(target, { additionalMsec: addWait })
}