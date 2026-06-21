export async function main(ns: NS) {
  const prices = [130, 103, 161, 76, 163, 88, 75, 196, 162, 187, 34, 92, 141, 171, 56, 89, 109, 20, 18, 69, 161, 45, 171, 98, 36, 19, 172]
  const found = { buy: 0, sell: 0, profit: 0 }
  for (let i = 0; i < prices.length; i++) {
    const buy = prices[i]
    const sell = prices.slice(i + 1).filter(p => p > buy).toSorted((a, b) => b - a).find(p => true)
    if (!!sell && ((sell - buy) > found.profit)) {
      found.buy = buy
      found.sell = sell
      found.profit = sell - buy
      ns.tprintf(`i ${i} buy ${buy} sell ${sell} profit ${found.profit}`)
    }
  }
  ns.tprintf("%j", found)
}