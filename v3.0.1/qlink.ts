export async function main(ns: NS) {
  const [portNumber, scriptToRun, scriptHost, scriptThread, ...scriptParameters] = ns.args
  await ns.nextPortWrite(portNumber as number)
  const portMessage = ns.readPort(portNumber as number)
  ns.printf("link message: %j", portMessage)
  ns.exec(scriptToRun as string, scriptHost as string, scriptThread as number, ...scriptParameters)
}