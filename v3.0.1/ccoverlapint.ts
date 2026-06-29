export async function main(ns: NS) {
  const source = [[22, 31], [25, 28], [4, 14], [22, 24], [4, 11], [9, 16], [18, 26], [10, 17], [10, 18], [5, 10], [16, 22], [11, 12], [5, 11], [8, 16], [15, 23], [19, 22], [4, 14]]
  const sourceSorted = source
    .toSorted((a, b) => a[0] - b[0] || a[1] - b[1])
  const merged: number[][] = []
  for (let i = 0; i < sourceSorted.length; i++) {
    const parents = merged
      .filter(m => m[0] <= sourceSorted[i][1] && m[1] >= sourceSorted[i][0])
    if (parents.length < 1) {
      merged.push(structuredClone(sourceSorted[i]))
      continue
    }
    if (parents[0][1] < sourceSorted[i][1]) parents[0][1] = sourceSorted[i][1]
  }
  ns.tprintf("%j", merged)
}