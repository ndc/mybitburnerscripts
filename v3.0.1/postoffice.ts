import * as GLBL from "sharedvalues.ts"

export async function main(ns: NS) {
  ns.disableLog("ALL")

  ns.clearPort(GLBL.BATCHENDPORT)
  ns.writePort(GLBL.BATCHENDPORT, "Hello from postmaster")
  ns.tprintf("%j", ns.readPort(GLBL.BATCHENDPORT))

  while (true) {
    await ns.nextPortWrite(GLBL.BATCHENDPORT)

    let rawMsg = ns.readPort(GLBL.BATCHENDPORT)
    //ns.tprintf("nextWrite %j", rawMsg)

    while (rawMsg != "NULL PORT DATA") {
      //ns.tprintf("read %j", rawMsg)
      if (Array.isArray(rawMsg)) {
        handleHWGW(ns, rawMsg)
      }
      else
        ns.tprintf(`Invalid message format: %j`, rawMsg)

      rawMsg = ns.readPort(GLBL.BATCHENDPORT)
    }
  }
}

async function handleHWGW(ns: NS, msgs: string[]) {
  const [commandName, ...parm] = msgs
  switch (commandName) {
    case GLBL.ACTWEAKEN:
      weakenHandler(ns, parm[0], parm[1])
      break
    case GLBL.ACTGROW:
      growHandler(ns, parm[0], parm[1])
      break
    case GLBL.ACTHACK:
      hackHandler(ns, parm[0], parm[1])
      break
    case GLBL.ACTPREP:
      prepHandler(ns, parm[0], parm[1])
      break
    case GLBL.ACTSHARE:
      shareHandler(ns, parm[0])
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

  if (secLvlDelta < 0.1) {
    const msg = `Sec lvl ${target1} is already minimal ${target.hackDifficulty}`
    ns.tprintf(msg)
    ns.toast(msg, undefined, 20000)
    const portmsg = [GLBL.ACTGROW, target1, hostname1]
    ns.writePort(GLBL.BATCHENDPORT, portmsg)
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

  const weakenTim = ns.formulas.hacking.weakenTime(target, ns.getPlayer())

  ns.printf(`${new Date().toLocaleTimeString()} Weaken ${target1} for ${weakenTim} using ${weakenThread} threads`)

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

  if ((target.moneyAvailable ?? 0) / (target.moneyMax ?? 1) > 0.999999) {
    const msg = `Money in ${target1} is ${target.moneyAvailable} max ${target.moneyMax}`
    ns.tprintf(msg)
    ns.toast(msg, undefined, 20000)
    const portmsg = [GLBL.ACTHACK, target1, hostname1]
    ns.writePort(GLBL.BATCHENDPORT, portmsg)
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

  ns.printf(`${new Date().toLocaleTimeString()} Grow ${target1} for ${weakenTim} using ${threadCount} threads`)

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

  ns.printf(`${new Date().toLocaleTimeString()} Hack ${target1} for ${weakenTim} using ${threadCount} threads, ${parallelBatch} in parallel`)

  if (hostname1 != "home")
    ns.scp([hackScriptName, weakenScriptName, growScriptName], hostname1)

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
      else {
        //ns.writePort(GLBL.BATCHENDPORT, [GLBL.ACTHACK, target1, hostname1])
      }
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

export async function prepHandler(ns: NS, targetName: string, scriptHostName: string) {
  const target = ns.getServer(targetName)
  const scriptHost = ns.getServer(scriptHostName)
  const person = ns.getPlayer()

  const weakenScriptName = "qoweaken.ts"
  const weakenScriptSize = 1.75
  const growScriptName = "qogrow.ts"
  const growScriptSize = 1.75

  const data = calculatePrepSize(ns, target, scriptHost, person, weakenScriptSize, growScriptSize)

  const buffer = (scriptHostName == "home") ? GLBL.BUFFERHOME : 0
  let remainingRam = scriptHost.maxRam - scriptHost.ramUsed - buffer
  if (remainingRam < data.batchMemory) {
    ns.tprintf(`${ns.getScriptName()}: not enough memory in ${scriptHostName}, ${data.batchMemory} needed ${remainingRam} available`)
    return
  }

  if (data.prepWeakenThread < 1 && data.growThr < 1) {
    const msg = `${targetName} sec lvl is ${target.hackDifficulty} money is ${target.moneyAvailable}`
    ns.tprintf(msg)
    ns.toast(msg, undefined, 20000)
    const portmsg = [GLBL.ACTHACK, targetName, scriptHostName]
    ns.writePort(GLBL.BATCHENDPORT, portmsg)
    return
  }

  const weakenTim = ns.formulas.hacking.weakenTime(target, person)

  ns.printf(`${new Date().toLocaleTimeString()} Prep ${targetName} for ${weakenTim}`)

  if (scriptHostName != "home")
    ns.scp([weakenScriptName, growScriptName], scriptHostName)

  let apid = 0
  if (data.prepWeakenThread > 0) {
    apid = ns.exec(weakenScriptName, scriptHostName, { threads: data.prepWeakenThread, temporary: true },
      targetName, 0)
    if (apid == 0) ns.tprintf(`Failed to run ${weakenScriptName}`)
  }
  if (data.growThr > 0) {
    apid = ns.exec(growScriptName, scriptHostName, { threads: data.growThr, temporary: true },
      targetName, data.growDelay)
    if (apid == 0) ns.tprintf(`Failed to run ${growScriptName}`)
  }
  if (data.growWeakenThread > 0) {
    apid = ns.exec(weakenScriptName, scriptHostName, { threads: data.growWeakenThread, temporary: true },
      targetName, 0, GLBL.BATCHENDPORT, GLBL.ACTPREP, scriptHostName)
    if (apid == 0) ns.tprintf(`Failed to run ${weakenScriptName}`)
  }
}

type PrepSize = {
  prepWeakenThread: number
  growThr: number
  growDelay: number
  growWeakenThread: number
  batchMemory: number
}

function calculatePrepSize(ns: NS, target: Server, hostServer: Server, person: Player,
  weakenScriptSize: number, growScriptSize: number): PrepSize {
  const weakenEff = ns.formulas.hacking.weakenEffect(1, hostServer.cpuCores)
  const prepWeakenThread = Math.ceil(
    ((target.hackDifficulty ?? 0) - (target.minDifficulty ?? 0)) / weakenEff)

  const growThr = ns.formulas.hacking.growThreads(target, person, target.moneyMax ?? 0, hostServer.cpuCores)
  const growEffect = ns.growthAnalyzeSecurity(growThr, undefined, hostServer.cpuCores)
  const growWeakenThread = Math.ceil(growEffect / weakenEff)

  const batchMemory = prepWeakenThread * weakenScriptSize
    + growThr * growScriptSize
    + growWeakenThread * weakenScriptSize

  const weakenTim = ns.formulas.hacking.weakenTime(target, person)
  const growTim = ns.formulas.hacking.growTime(target, person)
  const growDelay = weakenTim - growTim

  return {
    prepWeakenThread: prepWeakenThread,
    growThr: growThr,
    growDelay: growDelay,
    growWeakenThread: growWeakenThread,
    batchMemory: batchMemory,
  }
}

async function shareHandler(ns: NS, hostname: string) {
  const shareScriptName = "qoshare.ts"
  const shareScriptSize = 4

  const scriptHost = ns.getServer(hostname)

  const buffer = (hostname == "home") ? (GLBL.BUFFERHOME + 64) : 0
  const availableMemory = scriptHost.maxRam - scriptHost.ramUsed - buffer
  let shareThread = Math.floor(availableMemory / shareScriptSize)

  if (shareThread < 1) {
    ns.tprintf(`${GLBL.ACTSHARE}: not enough memory in ${hostname} ${availableMemory}`)
    return
  }

  ns.printf(`${new Date().toLocaleTimeString()} Share using ${shareThread} threads`)

  if (hostname != "home")
    ns.scp([shareScriptName], hostname)

  const apid = ns.exec(shareScriptName, hostname, { threads: shareThread, temporary: true },
    GLBL.BATCHENDPORT, GLBL.ACTSHARE, hostname)
  if (apid == 0) ns.tprintf(`Failed to run ${shareScriptName}`)
}
