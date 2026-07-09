import * as GLBL from "sharedvalues.ts"

export async function main(ns: NS) {
  const msgs = ns.args.map(a => a as string)
  ns.tprintf("sending %j", msgs)
  ns.writePort(GLBL.BATCHENDPORT, msgs)
}