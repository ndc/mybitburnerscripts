export async function main(ns: NS) {
  ns.run("allservers.ts", { threads: 1 })
  const backdoors = JSON.parse(ns.read("zbackdoor.json")) as { hostname: string, traces: string[] }[]
  const allservers = (JSON.parse(ns.read("zserverinfo.json")) as { Svr: Server }[]).map(s => s.Svr)
  const person = ns.getPlayer()
  for (let backdoor of backdoors) {
    const server = allservers.find(s => s.hostname == backdoor.hostname)!
    if (person.skills.hacking >= server.requiredHackingSkill!
      && !server.backdoorInstalled
      && server.hasAdminRights) {
      for (let trace of backdoor.traces) {
        ns.singularity.connect(trace)
      }
      await ns.singularity.installBackdoor()
      ns.singularity.connect("home")
      ns.tprintf(backdoor.hostname)
      ns.run("allservers.ts", { threads: 1 })
    }
  }
}