export async function main(ns: NS) {
  const currentServers = ns.cloud.getServerNames()
  const buyCount = ns.cloud.getServerLimit() - currentServers.length
  const memorySizes = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768]
  let playerMoney = ns.getPlayer().money
  let chosenMemory = 0
  let buyPrice = 0
  for (let i = 0; i < memorySizes.length; i++) {
    const memorySize = memorySizes[i]
    const tryPrice = ns.cloud.getServerCost(memorySize) * buyCount

    if (tryPrice > playerMoney) break

    chosenMemory = memorySize
    buyPrice = tryPrice
  }
  if (chosenMemory > 0) {
    for (let i = 0; i < buyCount; i++) {
      const serverName = `cloud-${chosenMemory}-${String.fromCodePoint(97 + i)}`
      const newName = ns.cloud.purchaseServer(serverName, chosenMemory)
      playerMoney -= buyPrice
      ns.tprint(`Bought ${newName} for ${buyPrice}`)
    }
  }

  let toUpgrade = lowestServer(ns)
  while (!!toUpgrade) {
    const nextSize = memorySizes
      .filter(s => s > toUpgrade!.memory)
      .toSorted((a, b) => a - b)
      .find(m => true)
    if (!nextSize) break  // at max ram

    const upgradePrice = ns.cloud.getServerUpgradeCost(toUpgrade.name, nextSize)
    if (upgradePrice > playerMoney) break

    if (ns.cloud.upgradeServer(toUpgrade.name, nextSize)) {
      const replaceThis = new RegExp(`-${toUpgrade.memory}-`)
      const newName = toUpgrade.name.replace(replaceThis, `-${nextSize}-`)
      ns.cloud.renameServer(toUpgrade.name, newName)
      ns.tprint(`Upgraded ${toUpgrade.name} to ${nextSize} for ${upgradePrice} becoming ${newName}`)
    }

    toUpgrade = lowestServer(ns)
  }
}

function lowestServer(ns: NS) {
  const servers = ns.cloud.getServerNames()
  const lowest = servers
    .map(s => ({ name: s, memory: ns.getServerMaxRam(s) }))
    .toSorted((a, b) => a.memory - b.memory)
    .find(s => true)
  return lowest
}
