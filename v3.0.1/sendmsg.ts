import * as GLBL from "sharedvalues.ts"

export async function main(ns: NS) {
  const [scriptName, targetName, hostName] = ns.args
  const msg = [scriptName as string, targetName as string, hostName as string]
  ns.tprintf("sending %j", msg)
  ns.writePort(GLBL.BATCHENDPORT, msg)
}