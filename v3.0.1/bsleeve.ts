export async function main(ns: NS) {
  while (true) {
    await ns.sleep(10000)

    const dopIdx = 0
    const dop = ns.sleeve.getSleeve(dopIdx)
    if (dop.sync < 99) {
      const syncSucc = ns.sleeve.setToSynchronize(dopIdx)
      ns.tprintf(`${new Date().toLocaleTimeString()} sleeve ${dopIdx} sync ${syncSucc}`)
      continue
    }

    const crimeSucc = ns.sleeve.setToCommitCrime(dopIdx, "Mug")
    ns.tprintf(`${new Date().toLocaleTimeString()} sleeve ${dopIdx} crime ${crimeSucc}`)
    break
  }
}