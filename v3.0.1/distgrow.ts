export async function main(ns: NS) {
  const [target1, dryrun, hostname1] = ns.args

  ns.disableLog("ALL")

  await ns.sleep(1)

  const weakenScriptName = "qoweaken.ts"
  const weakenScriptSize = 1.75
  const growScriptName = "qogrow.ts"
  const growScriptSize = 1.75
  const linkScript = "qlink.ts"
  const linkScriptSize = 2.9
  const batchScriptName = ns.getScriptName()

  const target = ns.getServer(target1 as string)
  const person = ns.getPlayer()
  const scriptHost = ns.getServer(hostname1 as string)

  const batchHackScriptName = "enhack.ts"
  if ((target.moneyAvailable ?? 0) / (target.moneyMax ?? 1) > 0.99) {
    const msg = `Money in ${target.hostname} is ${target.moneyAvailable} max ${target.moneyMax}`
    ns.printf(msg)
    ns.toast(msg, undefined, 20000)
    ns.exec(batchHackScriptName, "home", 1, target.hostname, false, scriptHost.hostname)
    return
  }

  const weakenTim = ns.formulas.hacking.weakenTime(target, person)
  const growTim = ns.formulas.hacking.growTime(target, person)
  const growDelay = weakenTim - growTim

  globalThis.bitburnerPortCounter = globalThis.bitburnerPortCounter ?? 0

  let threadCount = 1
  const buffer = (scriptHost.hostname == "home") ? 64 : 0
  const availMemory = () => (scriptHost.maxRam - scriptHost.ramUsed - buffer)
  let batch = calculateBatchSize(ns, scriptHost, target, person,
    threadCount, growScriptSize, weakenScriptSize, linkScriptSize)
  if (batch.batchSize > availMemory()) {
    ns.tprintf(`${batchScriptName}: not enough memory in ${hostname1} ${availMemory()}`)
    ns.tprintf("%j", batch)
    return
  }

  // @ignore-infinite
  while (true) {
    const tryThread = threadCount + 1
    const tryBatch = calculateBatchSize(ns, scriptHost, target, person,
      threadCount + 1, growScriptSize, weakenScriptSize, linkScriptSize)

    if (tryBatch.batchSize > availMemory()) break

    batch = tryBatch
    threadCount = tryThread
  }

  ns.printf(`Using ${threadCount} grow threads`)
  ns.printf("%j", batch)

  if (dryrun) {
    ns.ui.openTail()
    return
  }

  globalThis.bitburnerPortCounter += 1
  const batchFinishedPort = globalThis.bitburnerPortCounter

  if (scriptHost.hostname != "home")
    ns.scp([weakenScriptName, growScriptName, linkScript], scriptHost.hostname)

  const batchArgs = [target.hostname, false, scriptHost.hostname]
  const linkArgs = [batchFinishedPort, batchScriptName, "home", 1, ...batchArgs]
  let apid = ns.exec(linkScript, scriptHost.hostname, 1, ...linkArgs)
  if (apid == 0) ns.tprintf(`Failed to run ${linkScript}`)

  await ns.sleep(1)  // wait for port listener to be ready

  apid = ns.exec(growScriptName, scriptHost.hostname, batch.growThread, target.hostname, growDelay)
  if (apid == 0) ns.tprintf(`Failed to run ${growScriptName}`)
  apid = ns.exec(weakenScriptName, scriptHost.hostname, batch.weakenThread, target.hostname, 0, batchFinishedPort)
  if (apid == 0) ns.tprintf(`Failed to run ${weakenScriptName}`)
}

type BatchSize = {
  growThread: number
  growEffect: number
  growAmt: number
  weakenThread: number
  weakenEff: number
  batchSize: number
}

function calculateBatchSize(ns: NS, host: Server, target: Server, person: Player,
  threadCount: number, growScriptSize: number, weakenScriptSize: number, linkScriptSize: number)
  : BatchSize {
  const growEffect = ns.growthAnalyzeSecurity(threadCount, undefined, host.cpuCores)
  const growAmt = ns.formulas.hacking.growAmount(target, person, threadCount, host.cpuCores)
  const weakenEff = ns.formulas.hacking.weakenEffect(1, host.cpuCores)
  const weakenThread = Math.ceil(growEffect / weakenEff)
  return {
    growThread: threadCount,
    growEffect: growEffect,
    growAmt: growAmt,
    weakenThread: weakenThread,
    weakenEff: weakenEff,
    batchSize: linkScriptSize + threadCount * growScriptSize + weakenThread * weakenScriptSize,
  }
}
