export async function main(ns: NS) {
  const target = ns.args[0] as string
  const addWait = ns.args[1] as number
  await ns.hack(target, { additionalMsec: addWait })
}