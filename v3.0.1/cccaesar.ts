export async function main(ns: NS) {
  const source = ["MACRO EMAIL FLASH CACHE ENTER", 21]
  const offset = "A".charCodeAt(0)
  const cipher = source[0] as string
  const charShift = source[1] as number
  const encrypted = cipher.split('').map(c => (c == " ") ? " "
    : String.fromCharCode(((c.charCodeAt(0) - offset - charShift + 26) % 26) + offset))
    .join('')
  ns.tprintf(encrypted)
}