export async function main(ns: NS) {
  const source = [
    [19, 26, 1],
    [44, 49, 22],
    [7, 25, 18],
    [35, 23, 4],
    [19, 9, 41],
    [3, 15, 10],
    [45, 30, 24],
    [3, 32, 15],
    [45, 7, 26],
    [39, 48, 41],
    [34, 47, 7],
    [29, 20, 8],
    [10, 30, 4],
    [8, 22, 14]
  ]
  const depth = source.length
  const width = source[0].length
  const result: number[] = []
  for (let d = 0; d < depth; d++) {
    //if (width - 2 * d < 1) break
    //if (depth - 2 * d < 1) break

    const mright = source[d].slice(d, width - d)
    if (mright.length < 1) break
    ns.tprintf("right %j", mright)
    result.push(...mright)

    const mdown = source.slice(d + 1, depth - d).map(r => r[width - d - 1])
    if (mdown.length < 1) break
    ns.tprintf("down %j", mdown)
    result.push(...mdown)

    const mleft = source[depth - d - 1].slice(d, width - d - 1).toReversed()
    if (mleft.length < 1) break
    ns.tprintf("left %j", mleft)
    result.push(...mleft)

    const mup = source.slice(d + 1, depth - d - 1).map(r => r[d]).toReversed()
    if (mup.length < 1) break
    ns.tprintf("up %j", mup)
    result.push(...mup)
  }
  ns.tprintf("%j", result)
}