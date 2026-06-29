export async function main(ns: NS) {
  const prices = [17, 127, 158, 56, 33, 133, 158, 96, 18, 182, 129, 110, 49, 140, 10, 95, 31]
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