export async function main(ns: NS) {
  const source = [17,127,158,56,33,133,158,96,18,182,129,110,49,140,10,95,31]
  let calculations: number[][] = []
  for (let i = 0; i < source.length - 1; i++) {
    const buy = source[i]
    const sell = source.slice(i + 1).toSorted((a, b) => b - a).find(a => true) ?? 0
    calculations.push([buy, sell, sell - buy])
  }
  ns.tprintf("%j", calculations)
  calculations = calculations.toSorted((a, b) => b[2] - a[2])
  ns.tprintf("%j", calculations)
}