export async function main(ns: NS) {
  const source = [
    [8],
    [9, 1],
    [8, 1, 7],
    [4, 4, 5, 9],
    [2, 3, 5, 3, 6]
  ]

  const options = godown(0, 0, [])
  ns.tprintf("raw %j", options)
  const ordered = options.toSorted((a, b) => a.reduce((t, i) => t + i, 0) - b.reduce((t, i) => t + i, 0))
  ns.tprintf("ordered %j", ordered)
  ns.tprintf("sum %j", ordered.find(a => true)!.reduce((t, i) => t + i, 0))

  function godown(lvl: number, idx: number, path: number[]): number[][] {
    const pathplus = path.concat(source[lvl][idx])
    if (lvl + 1 in source) {
      return godown(lvl + 1, idx, pathplus).concat(godown(lvl + 1, idx + 1, pathplus))
    } else {
      return [pathplus]
    }
  }
}