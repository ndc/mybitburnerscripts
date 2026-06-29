export async function main(ns: NS) {
  const source = 84732804858241070466457852675936846600655625129459770450605931303547078888561925851839213342581243928228609936968975325292969471344392316222801360050924564267000746057836716946663082086028075000492433n
  //const source = 1000000000n
  ns.tprintf("sqrt of %s", source.toString())
  const result = sqrt(ns, source)
  ns.tprintf("result %s", result.toString())
}

function sqrt(ns: NS, nbr: bigint) {
  if (nbr < 0n) throw new Error()
  if (nbr < 2n) return nbr
  let x = nbr
  let y = (x + nbr / x) / 2n
  let diff = nbr
  let counter = 0
  while (counter < 1000) {
    if (y == x) break
    x = y
    y = (x + nbr / x) / 2n
    diff = nbr - (x * x)
    diff = (diff < 0n) ? (diff * -1n) : diff
    counter += 1
    ns.tprintf("counter %f diff %s x %s", counter, diff.toString(), x.toString())
  }
  return x
}