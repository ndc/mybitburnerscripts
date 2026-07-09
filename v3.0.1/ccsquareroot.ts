export async function main(ns: NS) {
  const source = 77338850385956145820384279128985440177642002751200940723923509976527901275140210416216315971912255598219296758168436994621033516050355019560939818507097349899812540964684320240372081913193570773637960n
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
  let diff2 = nbr - ((x + 1n) * (x + 1n))
  diff2 = (diff2 < 0n) ? (diff2 * -1n) : diff2
  if (diff2 < diff) x = x + 1n
  return x
}