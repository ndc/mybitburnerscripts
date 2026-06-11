export async function main(ns: NS) {
  //ns.disableLog("ALL")
  const growScript = "growtomax.ts"
  const launchScript = "launchgrow.ts"
  let lastLaunchAt: number | null = null

  while (true) {
    while (ns.scriptRunning(growScript)) {
      await ns.sleep(60000)
    }

    const launchedAt = Date.now()
    if (!!lastLaunchAt && (launchedAt - lastLaunchAt < 1000)) return

    lastLaunchAt = launchedAt
    ns.tprint(`Relaunch grow script ${launchedAt}`)
    ns.exec(launchScript, "home", 1)
    await ns.sleep(10)
  }
}