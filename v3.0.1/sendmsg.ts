import * as GLBL from "sharedvalues.ts"

export async function main(ns: NS) {
  const [scriptName, targetName, hostName] = ns.args
  const portHandler = ns.getPortHandle(GLBL.BATCHENDPORT)
  const msg = [scriptName as string, targetName as string, hostName as string]
  ns.tprintf("sending %j", msg)
  portHandler.write(msg)
}