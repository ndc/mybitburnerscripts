export async function main(ns: NS) {
  const source = ["VIRUSTABLESHELLPRINTENTER", "BLOGGER"]
  const offset = "A".charCodeAt(0)
  const shifters = source[1].split('').map(s => s.charCodeAt(0) - offset)
  let sequences: string[] = []
  for (let i = 0; i < source[0].length; i++) {
    const shifted = String.fromCharCode(((source[0].charCodeAt(i) - offset + shifters[i % shifters.length]) % 26) + offset)
    sequences.push(shifted)
    ns.tprintf("%s %s", String.fromCharCode(source[0].charCodeAt(i)), shifted)
  }
  const encrypted = sequences.join('')
  ns.tprintf(encrypted)
}