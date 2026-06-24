import * as GLBL from "sharedvalues.ts"

export async function main(ns: NS) {
  ns.disableLog("ALL")

  const portHandler = ns.getPortHandle(GLBL.BATCHENDPORT)
  portHandler.clear()
  portHandler.write("Hello from postmaster")
  ns.tprintf("%j", portHandler.read())

  while (true) {
    await portHandler.nextWrite()

    let rawMsg = portHandler.read()
    //ns.tprintf("nextWrite %j", rawMsg)

    while (rawMsg != "NULL PORT DATA") {
      //ns.tprintf("read %j", rawMsg)
      if (Array.isArray(rawMsg)) {
        handleHWGW(ns, rawMsg)
      }
      else
        ns.tprintf(`Invalid message format: %j`, rawMsg)

      rawMsg = portHandler.read()
    }
  }
}

async function handleHWGW(ns: NS, msgs: string[]) {
  const [scriptName, ...parm] = msgs
  switch (scriptName) {
    case GLBL.ACTWEAKEN:
      weakenHandler(ns, parm[0], parm[1])
      break
    case GLBL.ACTGROW:
      growHandler(ns, parm[0], parm[1])
      break
    case GLBL.ACTHACK:
      hackHandler(ns, parm[0], parm[1])
      break
    default:
      ns.tprintf(`Invalid message format: %j`, msgs)
  }
}

async function weakenHandler(ns: NS, target1: string, hostname1: string) {
  //ns.tprintf("weakenHandler %s %s", target1, hostname1)
  const weakenScriptName = "qoweaken.ts"
  const weakenScriptSize = 1.75

  const target = ns.getServer(target1)
  const scriptHost = ns.getServer(hostname1)

  const secLvlDelta = (target.hackDifficulty ?? 0) - (target.minDifficulty ?? 0)

  const portHandler = ns.getPortHandle(GLBL.BATCHENDPORT)

  if (secLvlDelta < 0.1) {
    const msg = `Sec lvl ${target1} is already minimal ${target.hackDifficulty}`
    ns.tprintf(msg)
    ns.toast(msg, undefined, 20000)
    const portmsg = [GLBL.ACTGROW, target1, hostname1]
    portHandler.write(portmsg)
    return
  }

  const weakenEff = ns.formulas.hacking.weakenEffect(1, scriptHost.cpuCores)
  let weakenThread = Math.ceil(secLvlDelta / weakenEff)
  const buffer = (hostname1 == "home") ? GLBL.BUFFERHOME : 0
  const weakenMemory = weakenThread * weakenScriptSize
  const availableMemory = scriptHost.maxRam - scriptHost.ramUsed - buffer
  if (weakenMemory > availableMemory) {
    weakenThread = Math.floor(availableMemory / weakenScriptSize)
  }

  if (weakenThread < 1) {
    ns.tprintf(`${GLBL.ACTWEAKEN}: not enough memory in ${hostname1} ${availableMemory}`)
    return
  }

  ns.printf(`Using ${weakenThread} weaken threads`)

  if (hostname1 != "home")
    ns.scp([weakenScriptName], hostname1)

  const apid = ns.exec(weakenScriptName, hostname1, { threads: weakenThread, temporary: true },
    target1, 0, GLBL.BATCHENDPORT, GLBL.ACTWEAKEN, hostname1)
  if (apid == 0) ns.tprintf(`Failed to run ${weakenScriptName}`)
}

async function growHandler(ns: NS, target1: string, hostname1: string) {
  //ns.tprintf("growHandler %s %s", target1, hostname1)
  const weakenScriptName = "qoweaken.ts"
  const weakenScriptSize = 1.75
  const growScriptName = "qogrow.ts"
  const growScriptSize = 1.75

  const target = ns.getServer(target1 as string)
  const person = ns.getPlayer()
  const scriptHost = ns.getServer(hostname1 as string)

  const portHandler = ns.getPortHandle(GLBL.BATCHENDPORT)

  if ((target.moneyAvailable ?? 0) / (target.moneyMax ?? 1) > 0.999999) {
    const msg = `Money in ${target1} is ${target.moneyAvailable} max ${target.moneyMax}`
    ns.tprintf(msg)
    ns.toast(msg, undefined, 20000)
    const portmsg = [GLBL.ACTHACK, target1, hostname1]
    portHandler.write(portmsg)
    return
  }

  const weakenTim = ns.formulas.hacking.weakenTime(target, person)
  const growTim = ns.formulas.hacking.growTime(target, person)
  const growDelay = weakenTim - growTim

  let threadCount = 1
  const buffer = (hostname1 == "home") ? GLBL.BUFFERHOME : 0
  const availMemory = scriptHost.maxRam - scriptHost.ramUsed - buffer
  let batch = calculateGrowSize(ns, scriptHost, target, person,
    threadCount, growScriptSize, weakenScriptSize)
  if (batch.batchSize > availMemory) {
    ns.tprintf(`${GLBL.ACTGROW}: not enough memory in ${hostname1} ${availMemory}`)
    ns.tprintf("%j", batch)
    return
  }

  let hitMaxOnce = batch.growAmt >= target.moneyMax!
  // @ignore-infinite
  while (true) {
    const tryThread = threadCount + 1
    const tryBatch = calculateGrowSize(ns, scriptHost, target, person,
      tryThread, growScriptSize, weakenScriptSize)

    if (tryBatch.batchSize > availMemory) break
    if (tryBatch.growAmt >= target.moneyMax!) {
      if (hitMaxOnce) break
      hitMaxOnce = true
    }

    batch = tryBatch
    threadCount = tryThread
  }

  ns.printf(`Using ${threadCount} grow threads`)
  ns.printf("%j", batch)

  if (hostname1 != "home")
    ns.scp([weakenScriptName, growScriptName], hostname1)

  let apid = ns.exec(growScriptName, hostname1, { threads: batch.growThread, temporary: true },
    target1, growDelay)
  if (apid == 0) ns.tprintf(`Failed to run ${growScriptName}`)

  apid = ns.exec(weakenScriptName, hostname1, { threads: batch.weakenThread, temporary: true },
    target1, 0, GLBL.BATCHENDPORT, GLBL.ACTGROW, hostname1)
  if (apid == 0) ns.tprintf(`Failed to run ${weakenScriptName}`)
}

type GrowCalc = {
  growThread: number
  growSLE: number
  growAmt: number
  weakenThread: number
  weakenSLE: number
  batchSize: number
}

function calculateGrowSize(ns: NS, host: Server, target: Server, person: Player,
  threadCount: number, growScriptSize: number, weakenScriptSize: number)
  : GrowCalc {
  const growSLE = ns.growthAnalyzeSecurity(threadCount, undefined, host.cpuCores)
  const growAmt = ns.formulas.hacking.growAmount(target, person, threadCount, host.cpuCores)
  const weakenSLE = ns.formulas.hacking.weakenEffect(1, host.cpuCores)
  const weakenThread = Math.ceil(growSLE / weakenSLE)
  return {
    growThread: threadCount,
    growSLE: growSLE,
    growAmt: growAmt,
    weakenThread: weakenThread,
    weakenSLE: weakenSLE,
    batchSize: threadCount * growScriptSize + weakenThread * weakenScriptSize,
  }
}

async function hackHandler(ns: NS, target1: string, hostname1: string) {
  //ns.tprintf("hackHandler %s %s", target1, hostname1)
  const hackScriptName = "qohack.ts"
  const hackScriptSize = 1.7
  const weakenScriptName = "qoweaken.ts"
  const weakenScriptSize = 1.75
  const growScriptName = "qogrow.ts"
  const growScriptSize = 1.75

  const target = ns.getServer(target1 as string)
  const person = ns.getPlayer()
  const scriptHost = ns.getServer(hostname1 as string)

  const hackTim = ns.formulas.hacking.hackTime(target, person)
  const weakenTim = ns.formulas.hacking.weakenTime(target, person)
  const growTim = ns.formulas.hacking.growTime(target, person)
  const hackDelay = weakenTim - hackTim
  const growDelay = weakenTim - growTim

  let threadCount = 1
  const buffer = (hostname1 == "home") ? GLBL.BUFFERHOME : 0
  const availMemory = scriptHost.maxRam - scriptHost.ramUsed - buffer
  let batch = calculateHackSize(ns, target, scriptHost, person,
    threadCount, hackScriptSize, growScriptSize, weakenScriptSize)
  if (batch.batchMemory > availMemory) {
    ns.tprintf(`${GLBL.ACTHACK}: not enough memory in ${hostname1}, ${availMemory} available`)
    ns.tprintf("%j", batch)
    return batch.batchMemory
  }

  let parallelBatch = Math.floor(availMemory / batch.batchMemory)

  // @ignore-infinite
  while (true) {
    const tryThread = threadCount + 1
    const tryBatch = calculateHackSize(ns, target, scriptHost, person,
      tryThread, hackScriptSize, growScriptSize, weakenScriptSize)
    const tryParallelBatch = Math.floor(availMemory / tryBatch.batchMemory)

    if (tryBatch.batchMemory > availMemory) break
    if (tryBatch.hackPct > 0.03) break

    batch = tryBatch
    threadCount = tryThread
    parallelBatch = tryParallelBatch
  }

  ns.printf(`Using ${threadCount} hack threads, ${parallelBatch} in parallel`)
  ns.printf("%j", batch)

  if (hostname1 != "home")
    ns.scp([hackScriptName, weakenScriptName, growScriptName], hostname1)

  const portHandler = ns.getPortHandle(GLBL.BATCHENDPORT)

  let apid = 0
  const startTime = performance.now()
  for (let i = 0; i < parallelBatch; i++) {
    apid = ns.exec(hackScriptName, hostname1, { threads: threadCount, temporary: true },
      target1, hackDelay)
    if (apid == 0) ns.tprintf(`${GLBL.ACTHACK} failed to run ${hackScriptName} on ${hostname1}`)

    apid = ns.exec(weakenScriptName, hostname1, { threads: batch.hackWeakenThread, temporary: true },
      target1, 0)
    if (apid == 0) ns.tprintf(`${GLBL.ACTHACK} failed to run ${weakenScriptName} on ${hostname1}`)

    apid = ns.exec(growScriptName, hostname1, { threads: batch.growThr, temporary: true },
      target1, growDelay + 0)
    if (apid == 0) ns.tprintf(`${GLBL.ACTHACK} failed to run ${growScriptName} on ${hostname1}`)

    // takes too long
    if (performance.now() - startTime > 100) {
      apid = ns.exec(weakenScriptName, hostname1, { threads: batch.growWeakenThread, temporary: true },
        target1, 0, GLBL.BATCHENDPORT, GLBL.ACTHACK, hostname1)
      if (apid == 0)
        ns.tprintf(`${GLBL.ACTHACK} failed to run ${weakenScriptName} on ${hostname1}`)
      else
        portHandler.write([GLBL.ACTHACK, target1, hostname1])
      break
    }

    if (i + 1 == parallelBatch) {
      // last batch
      apid = ns.exec(weakenScriptName, hostname1, { threads: batch.growWeakenThread, temporary: true },
        target1, 0, GLBL.BATCHENDPORT, GLBL.ACTHACK, hostname1)
    } else {
      apid = ns.exec(weakenScriptName, hostname1, { threads: batch.growWeakenThread, temporary: true },
        target1, 0)
    }
    if (apid == 0) ns.tprintf(`${GLBL.ACTHACK} failed to run ${weakenScriptName} on ${hostname1}`)
  }

  return batch.batchMemory
}

type HackSize = {
  hackPct: number
  hackWeakenThread: number
  hackSLE: number
  growThr: number
  growWeakenThread: number
  growSLE: number
  batchMemory: number
}

function calculateHackSize(ns: NS, target: Server, host: Server, person: Player,
  threadCount: number, hackScriptSize: number, growScriptSize: number, weakenScriptSize: number)
  : HackSize {
  const hackPct = threadCount * ns.formulas.hacking.hackPercent(target, person)
  const hackSLE = ns.hackAnalyzeSecurity(threadCount, undefined)
  const weakenSLE = ns.formulas.hacking.weakenEffect(1, host.cpuCores)
  const hackWeakenThread = Math.ceil(hackSLE / weakenSLE)
  const cloneTarget = structuredClone(target)
  cloneTarget.moneyAvailable = (1 - hackPct) * (target.moneyMax ?? 0)
  const growThr = ns.formulas.hacking.growThreads(cloneTarget, person, target.moneyMax ?? 0, host.cpuCores)
  const growSLE = ns.growthAnalyzeSecurity(growThr, undefined, host.cpuCores)
  const growWeakenThread = Math.ceil(growSLE / weakenSLE)
  const batchMemory = hackScriptSize * threadCount
    + weakenScriptSize * hackWeakenThread
    + growScriptSize * growThr
    + weakenScriptSize * growWeakenThread
  return {
    hackPct: hackPct,
    hackWeakenThread: hackWeakenThread,
    hackSLE: hackSLE,
    growThr: growThr,
    growWeakenThread: growWeakenThread,
    growSLE: growSLE,
    batchMemory: batchMemory,
  }
}
