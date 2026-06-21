export async function main(ns: NS) {
  const source = "243170213191"
  const result: string[] = []

  for (let i = 1; i <= 3 && i < source.length; i++) {
    for (let j = 1; j <= 3 && i + j < source.length; j++) {
      for (let k = 1; k <= 3 && i + j + k < source.length; k++) {
        //ns.tprintf(`i ${i} j ${j} k ${k}`)
        const s1 = source.slice(0, i)
        const s2 = source.slice(i, i + j)
        const s3 = source.slice(i + j, i + j + k)
        const s4 = source.slice(i + j + k)
        const octets = [s1, s2, s3, s4]
        //ns.tprintf("%j", octets)
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
  ns.tprintf("%j", result)
}
