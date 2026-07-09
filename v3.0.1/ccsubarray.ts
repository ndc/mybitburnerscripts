export async function main(ns: NS) {
  const source = [4, -8, 2, -10, -10, 9, -7, -3, -3, 7, -1, -3, 7, 5, 7, 3, 3, -1, 3, 2, -5, -9, 8, -10, 0, 3, 6, 10, 1, 9, -1, 7, -9]
  let results: number[][] = []
  for (let i = 0; i < source.length; i++) {
    for (let j = i + 1; j <= source.length; j++) {
      const sub = source.slice(i, j)
      ns.tprintf("%f %f %j", i, j, sub)
      results.push(sub)
    }
  }
  const result = results
    .map(n => n.reduce((t, i) => t + i, 0))
    .toSorted((a, b) => b - a)
    .find(a => true)
  ns.tprintf("%f", result)
}