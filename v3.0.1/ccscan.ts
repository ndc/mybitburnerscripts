export async function main(ns: NS) {
  const solveIt = ns.args[0] as boolean ?? false

  const withContract = queryBase(ns)
    .filter(s => ns.ls(s, ".cct").length > 0)
    .flatMap(s => ns.ls(s, ".cct").map(c => ({
      hostname: s,
      filename: c,
      contract: ns.codingcontract.getContract(c, s)
    })))

  if (solveIt) {
    for (let contract of withContract) {
      const solution = solveContract(ns, contract.hostname, contract.filename, contract.contract)
      if (solution == "") continue
      const solveResult = contract.contract.submit(solution)
      ns.tprintf("%s %s %s", contract.hostname, contract.filename, contract.contract.type)
      ns.tprintf(solveResult)
    }
  } else {
    const abbrev = withContract.map(c => [c.hostname, c.filename, c.contract.type, c.contract.difficulty])
    ns.tprintf("%j", abbrev)
  }
}

function queryBase(ns: NS) {
  const serverInfoFile = "zserverinfo.json"
  const allservers = (JSON.parse(ns.read(serverInfoFile)) as { Svr: Server }[])
    .map(s => s.Svr.hostname)
  return allservers
}

function solveContract(ns: NS, hostname: string, filename: string, contract: CodingContractObject) {
  switch (contract.type) {
    case "Algorithmic Stock Trader I":
      return StockTrader1(contract.data)
    case "Encryption I: Caesar Cipher":
      return CaesarCipher(...contract.data)
    case "Encryption II: Vigenère Cipher":
      return VigenereCipher(contract.data)
    case "Generate IP Addresses":
      if (!Array.isArray(contract.data)) return IPAddress(contract.data)
      else return ""
    case "Largest Rectangle in a Matrix":
      return ""
    case "Merge Overlapping Intervals":
      return OverlapInterval(contract.data)
    case "Minimum Path Sum in a Triangle":
      return MinPathSumTriangle(contract.data)
    case "Proper 2-Coloring of a Graph":
      return ""
    case "Sanitize Parentheses in Expression":
      return ""
    case "Spiralize Matrix":
      return SpiralMatrix(contract.data)
    case "Square Root":
      return SquareRoot(contract.data)
    case "Subarray with Maximum Sum":
      return SubarrayMaxSum(contract.data)
    default:
      return ""
  }
}

function CaesarCipher(plaintext: string, shift: number) {
  const offset = "A".charCodeAt(0)
  const encrypted = plaintext.split('').map(c => (c == " ") ? " "
    : String.fromCharCode(((c.charCodeAt(0) - offset - shift + 26) % 26) + offset))
    .join('')
  return encrypted
}

function IPAddress(source: string) {
  const result: string[] = []
  for (let i = 1; i <= 3 && i < source.length; i++) {
    for (let j = 1; j <= 3 && i + j < source.length; j++) {
      for (let k = 1; k <= 3 && i + j + k < source.length; k++) {
        const s1 = source.slice(0, i)
        const s2 = source.slice(i, i + j)
        const s3 = source.slice(i + j, i + j + k)
        const s4 = source.slice(i + j + k)
        const octets = [s1, s2, s3, s4]
        let isValid = true
        for (const octet of octets) {
          if ((parseInt(octet) > 255) || (octet.length > 1 && octet[0] == "0")) {
            isValid = false
            break
          }
        }

        if (isValid) {
          result.push(`${s1}.${s2}.${s3}.${s4}`)
        }
      }
    }
  }
  return JSON.stringify(result)
}

function MinPathSumTriangle(source: number[][]) {
  const options = godown(0, 0, [])
  const result = options
    .toSorted((a, b) => a.reduce((t, i) => t + i, 0) - b.reduce((t, i) => t + i, 0))
    .find(a => true)!.reduce((t, i) => t + i, 0)
  return JSON.stringify(result)

  function godown(lvl: number, idx: number, path: number[]): number[][] {
    const pathplus = path.concat(source[lvl][idx])
    if (lvl + 1 in source) {
      return godown(lvl + 1, idx, pathplus).concat(godown(lvl + 1, idx + 1, pathplus))
    } else {
      return [pathplus]
    }
  }
}

function OverlapInterval(source: number[][]) {
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
  return JSON.stringify(merged)
}

function SpiralMatrix(source: number[][]) {
  const depth = source.length
  const width = source[0].length
  const result: number[] = []
  for (let d = 0; d < depth; d++) {
    const mright = source[d].slice(d, width - d)
    if (mright.length < 1) break
    result.push(...mright)

    const mdown = source.slice(d + 1, depth - d).map(r => r[width - d - 1])
    if (mdown.length < 1) break
    result.push(...mdown)

    const mleft = source[depth - d - 1].slice(d, width - d - 1).toReversed()
    if (mleft.length < 1) break
    result.push(...mleft)

    const mup = source.slice(d + 1, depth - d - 1).map(r => r[d]).toReversed()
    if (mup.length < 1) break
    result.push(...mup)
  }
  return JSON.stringify(result)
}

function SquareRoot(source: bigint) {
  if (source < 2n) return source.toString()
  let x = source
  let y = (x + source / x) / 2n
  let diff = source
  let counter = 0
  while (counter < 1000) {
    if (y == x) break
    x = y
    y = (x + source / x) / 2n
    diff = source - (x * x)
    diff = (diff < 0n) ? (diff * -1n) : diff
    counter += 1
  }
  let diff2 = source - ((x + 1n) * (x + 1n))
  diff2 = (diff2 < 0n) ? (diff2 * -1n) : diff2
  if (diff2 < diff) x = x + 1n
  return x.toString()
}

function StockTrader1(source: number[]) {
  let calculations: number[][] = []
  for (let i = 0; i < source.length - 1; i++) {
    const buy = source[i]
    const sell = source.slice(i + 1).toSorted((a, b) => b - a).find(a => true) ?? 0
    calculations.push([buy, sell, sell - buy])
  }
  const result = calculations.toSorted((a, b) => b[2] - a[2]).find(a => true)![2]
  return JSON.stringify(result)
}

function SubarrayMaxSum(source: number[]) {
  let results: number[][] = []
  for (let i = 0; i < source.length; i++) {
    for (let j = i + 1; j <= source.length; j++) {
      const sub = source.slice(i, j)
      results.push(sub)
    }
  }
  const result = results
    .map(n => n.reduce((t, i) => t + i, 0))
    .toSorted((a, b) => b - a)
    .find(a => true)!
  return JSON.stringify(result)
}

function VigenereCipher(source: [string, string]) {
  const offset = "A".charCodeAt(0)
  const shifters = source[1].split('').map(s => s.charCodeAt(0) - offset)
  let sequences: string[] = []
  for (let i = 0; i < source[0].length; i++) {
    const shifted = String.fromCharCode(((source[0].charCodeAt(i) - offset + shifters[i % shifters.length])
      % 26) + offset)
    sequences.push(shifted)
  }
  const encrypted = sequences.join('')
  return encrypted
}

function RectangleInMatrix(source: number[][]) {
  return ""
}
