export async function main(ns: NS) {
  const [portNumber, scriptToRun, scriptHost, scriptThread, ...scriptParameters] = ns.args
  await ns.nextPortWrite(portNumber as number)
  const portMessage = ns.readPort(portNumber as number)
  ns.printf("link message: %j", portMessage)
  let apid = ns.exec(scriptToRun as string, scriptHost as string, scriptThread as number, ...scriptParameters)
  if (apid == 0) ns.tprintf(`${ns.getScriptName()}: failed to run ${scriptToRun} in ${scriptHost} with ${scriptThread} threads with %j`, scriptParameters)
}