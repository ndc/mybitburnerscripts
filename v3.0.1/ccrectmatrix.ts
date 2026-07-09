export async function main(ns: NS) {
  const source = [
    [0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0]
  ]
  type datum = { width: number, height: number, size: number, start: number[], end: number[], }
  const data: datum[] = []
  for (let row = 0; row < source.length; row++) {
    for (let col = 0; col < source[row].length; col++) {
      if (source[row][col] != 0) continue
      let rowidx = row
      let width = source[row].length - col
      while (rowidx < source.length) {
        if (source[rowidx][col] != 0) break
        const rowOne = source[rowidx].slice(col).findIndex(r => r == 1)
        if (rowOne > -1 && rowOne < width) width = rowOne
        rowidx++
      }
      let height = rowidx - row

      data.push({
        start: [row, col],
        end: [row + height - 1, col + width - 1],
        width: width,
        height: height,
        size: width * height
      })

      let colidx = col
      let height2 = source.length - row
      while (colidx < source[row].length) {
        if (source[row][colidx] != 0) break
        const colOne = source.map(r => r[colidx]).slice(row).findIndex(c => c == 1)
        if (colOne > -1 && colOne < height2) height2 = colOne
        colidx++
      }
      let width2 = colidx - col

      if (height != height2)
        data.push({
          start: [row, col],
          end: [row + height2 - 1, col + width2 - 1],
          width: width2,
          height: height2,
          size: width2 * height2
        })
    }
  }
  ns.tprintf("%j", data)
  const result = data.toSorted((a, b) => b.size - a.size).map(d => [d.start, d.end]).find(a => true)
  ns.tprintf("%j", result)
}