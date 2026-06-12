export async function main(ns: NS) {
  ns.disableLog("ALL")
  const growScript = "qgrowtomax.ts"
  const launchScript = "launchgrow.ts"

  while (true) {
    if (!ns.scriptRunning(growScript)) {
      ns.tprint(`Relaunch ${growScript}`)
      ns.exec(launchScript, "home", 1)
    }

    await ns.sleep(10000)
  }
}