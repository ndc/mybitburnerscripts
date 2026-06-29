export async function main(ns: NS) {
  const source = [-3,-8,10,8,-6,-8,7,8,3,-7,0,-9,-7,8,-5,-6,-6,-8,4,1,-5]
  let results: number[][] = []
  for (let i = 0; i < source.length; i++) {
    for (let j = 0; j < source.length - i; j++) {
      const sub = source.slice(i, i + j + 1)
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