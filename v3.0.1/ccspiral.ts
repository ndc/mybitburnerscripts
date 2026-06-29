export async function main(ns: NS) {
  const source = [
    [28, 24, 38, 6],
    [20, 5, 20, 14],
    [43, 21, 30, 14],
    [39, 37, 15, 21],
    [11, 18, 20, 45],
    [2, 20, 4, 32],
    [27, 10, 31, 24],
    [47, 17, 13, 18],
    [11, 45, 23, 47],
  ]
  const depth = source.length
  const width = source[0].length
  const result: number[] = []
  for (let d = 0; d < depth; d++) {
    if (width - 2 * d < 1) break
    const mright = source[d].slice(d, width - d)
    ns.tprintf("right %j", mright)
    result.push(...mright)
    const mdown = source.slice(d + 1, depth - d).map(r => r[width - d - 1])
    ns.tprintf("down %j", mdown)
    result.push(...mdown)
    const mleft = source[depth - d - 1].slice(d, width - d - 1).toReversed()
    ns.tprintf("left %j", mleft)
    result.push(...mleft)
    const mup = source.slice(d + 1, depth - d - 1).map(r => r[d]).toReversed()
    ns.tprintf("up %j", mup)
    result.push(...mup)
  }
  ns.tprintf("%j", result)
}