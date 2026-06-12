export async function main(ns: NS) {
  const [target1, dryrun, hostname1] = ns.args

  ns.disableLog("ALL")

  const weakenScriptName = "qoweaken.ts"
  const weakenScriptSize = 1.75
  const growScriptName = "qogrow.ts"
  const growScriptSize = 1.75
  const linkScript = "qlink.ts"
  const batchScriptName = ns.getScriptName()

  const target = ns.getServer(target1 as string)
  const person = ns.getPlayer()
  const scriptHost = ns.getServer(hostname1 as string)

  if ((target.moneyAvailable ?? 0) >= (0.9 * (target.moneyMax ?? 0))) {
    const msg = `Available ${target.moneyAvailable} Max ${target.moneyMax}`
    ns.printf(msg)
    ns.toast(msg)
    return
  }

  const weakenTim = ns.formulas.hacking.weakenTime(target, person)
  const growTim = ns.formulas.hacking.growTime(target, person)
  const growDelay = weakenTim - growTim

  globalThis.bitburnerPortCounter = globalThis.bitburnerPortCounter ?? 0

  let threadCount = 0
  // @ignore-infinite
  while (true) {
    const batchSize = calculateBatchSize(ns, scriptHost, threadCount + 1, growScriptSize, weakenScriptSize)
    ns.printf("%j", batchSize)
    if (batchSize.batchSize > scriptHost.maxRam) break
    threadCount++
  }

  if (threadCount < 1) return

  const batchSize = calculateBatchSize(ns, scriptHost, threadCount, growScriptSize, weakenScriptSize)
  ns.printf(`Grow delay: ${growDelay}`)
  ns.printf("%j", batchSize)

  if (dryrun) {
    ns.ui.openTail()
    return
  }

  globalThis.bitburnerPortCounter += 1
  const batchFinishedPort = globalThis.bitburnerPortCounter

  if (scriptHost.hostname != "home")
    ns.scp([weakenScriptName, growScriptName], scriptHost.hostname)

  const batchArgs = [target.hostname, false, scriptHost.hostname]
  const linkArgs = [batchFinishedPort, batchScriptName, "home", 1, ...batchArgs]
  ns.exec(linkScript, "home", 1, ...linkArgs)
  await ns.sleep(1)  // wait for port listener to be ready

  ns.exec(growScriptName, scriptHost.hostname, batchSize.growThread, target.hostname, growDelay)
  ns.exec(weakenScriptName, scriptHost.hostname, batchSize.weakenThread, target.hostname, 1, batchFinishedPort)
}

type BatchSize = {
  growThread: number
  growEffect: number
  weakenThread: number
  weakenEff: number
  batchSize: number
}

function calculateBatchSize(ns: NS, host: Server, threadCount: number, growScriptSize: number, weakenScriptSize: number)
  : BatchSize {
  const growEffect = ns.growthAnalyzeSecurity(threadCount, undefined, host.cpuCores)
  const weakenEff = ns.formulas.hacking.weakenEffect(1, host.cpuCores)
  const weakenThread = Math.ceil(growEffect / weakenEff)
  return {
    growThread: threadCount,
    growEffect: growEffect,
    weakenThread: weakenThread,
    weakenEff: weakenEff,
    batchSize: threadCount * growScriptSize + weakenThread * weakenScriptSize,
  }
}
