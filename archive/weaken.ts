export async function main(ns: NS) {
  const [target1, dryrun, hostname1] = ns.args

  ns.disableLog("ALL")

  await ns.sleep(1)

  const weakenScriptName = "qoweaken.ts"
  const weakenScriptSize = 1.75
  const linkScript = "qlink.ts"
  const linkScriptSize = 2.9
  const batchScriptName = ns.getScriptName()

  const target = ns.getServer(target1 as string)
  const scriptHost = ns.getServer(hostname1 as string)

  const secLvlDelta = (target.hackDifficulty ?? 0) - (target.minDifficulty ?? 0)

  const batchGrowScriptName = "distgrow.ts"
  if (secLvlDelta < 0.1) {
    const msg = `Sec lvl ${target.hostname} is already minimal ${target.hackDifficulty}`
    ns.printf(msg)
    ns.toast(msg, undefined, 20000)
    ns.exec(batchGrowScriptName, "home", 1, target.hostname, false, scriptHost.hostname)
    return
  }

  const weakenEff = ns.formulas.hacking.weakenEffect(1, scriptHost.cpuCores)
  let weakenThread = Math.ceil(secLvlDelta / weakenEff)
  const buffer = (scriptHost.hostname == "home") ? 64 : 0
  const weakenMemory = weakenThread * weakenScriptSize + linkScriptSize
  const availableMemory = scriptHost.maxRam - scriptHost.ramUsed - buffer
  if (weakenMemory > availableMemory) {
    weakenThread = Math.floor((availableMemory - linkScriptSize) / weakenScriptSize)
  }

  if (weakenThread < 1) {
    ns.tprintf(`${batchScriptName}: not enough memory in ${hostname1} ${availableMemory}`)
    return
  }

  ns.printf(`Using ${weakenThread} weaken threads`)

  if (dryrun) {
    ns.ui.openTail()
    return
  }

  if (scriptHost.hostname != "home")
    ns.scp([weakenScriptName, linkScript], scriptHost.hostname)

  globalThis.bitburnerPortCounter = globalThis.bitburnerPortCounter ?? 0

  globalThis.bitburnerPortCounter += 1
  const batchFinishedPort = globalThis.bitburnerPortCounter

  const batchArgs = [target.hostname, false, scriptHost.hostname]
  const linkArgs = [batchFinishedPort, batchScriptName, "home", 1, ...batchArgs]
  let apid = ns.exec(linkScript, scriptHost.hostname, 1, ...linkArgs)
  if (apid == 0) ns.tprintf(`Failed to run ${linkScript}`)
  await ns.sleep(1)  // wait for port listener to be ready

  apid = ns.exec(weakenScriptName, scriptHost.hostname, weakenThread, target.hostname, 0, batchFinishedPort)
  if (apid == 0) ns.tprintf(`Failed to run ${weakenScriptName}`)
}
