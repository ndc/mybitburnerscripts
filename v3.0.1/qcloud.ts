export async function main(ns: NS) {
  const memoryLimit = ns.args[0] as number ?? 32768

  const currentServers = ns.cloud.getServerNames()
  const serverLimit = ns.cloud.getServerLimit()
  const memorySizes = [16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536]
  let playerMoney = ns.getPlayer().money
  let chosenMemory = 0
  let buyPrice = 0
  let buyCount = 0
  for (let m = 0; m < memorySizes.length; m++) {
    const memorySize = memorySizes[m]

    if (memorySize > memoryLimit) break

    const oneprice = ns.cloud.getServerCost(memorySize)
    const buymax = serverLimit - currentServers.length
    const tryPrice = oneprice * buymax

    if (tryPrice > playerMoney) {
      if (m == 0) {
        buyCount = Math.floor(playerMoney / oneprice)
        chosenMemory = memorySize
        buyPrice = tryPrice
      }
      break
    }

    chosenMemory = memorySize
    buyPrice = tryPrice
    buyCount = buymax
  }
  for (let i = currentServers.length; i < currentServers.length + buyCount; i++) {
    const serverName = `cloud-${String.fromCodePoint(97 + i)}`
    const newName = ns.cloud.purchaseServer(serverName, chosenMemory)
    playerMoney -= buyPrice
    ns.tprint(`Bought ${newName} for ${buyPrice}`)
  }

  let toUpgrade = lowestServer(ns, memoryLimit)
  while (!!toUpgrade) {
    const nextSize = memorySizes
      .filter(s => s > toUpgrade!.memory)
      .filter(s => s <= memoryLimit)
      .toSorted((a, b) => a - b)
      .find(m => true)
    if (!nextSize) break  // at max ram

    const upgradePrice = ns.cloud.getServerUpgradeCost(toUpgrade.name, nextSize)
    if (upgradePrice > playerMoney) break

    if (ns.cloud.upgradeServer(toUpgrade.name, nextSize)) {
      playerMoney -= upgradePrice
      ns.tprint(`Upgraded ${toUpgrade.name} to ${nextSize} for ${upgradePrice}`)
    }

    toUpgrade = lowestServer(ns, memoryLimit)
  }
}

function lowestServer(ns: NS, memoryLimit: number) {
  const servers = ns.cloud.getServerNames()
  const lowest = servers
    .map(s => ({ name: s, memory: ns.getServerMaxRam(s) }))
    .filter(s => s.memory < memoryLimit)
    .toSorted((a, b) => a.memory - b.memory)
    .find(s => true)
  return lowest
}
