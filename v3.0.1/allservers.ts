export async function main(ns: NS) {
  ns.disableLog("ALL")

  const allservers = scanNames(ns)

  const filecontent = JSON.stringify(allservers)
  const filename = "zserverinfo.json"
  ns.write(filename, filecontent, "w")
  ns.tprintf(`Updated ${filename}`)

  const backdoors = ["CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z"]
    .map(b => allservers.find(s => s.Svr.hostname == b)!)
    .map(s => ({
      hostname: s.Svr.hostname,
      traces: traceServer(s.Svr.hostname, allservers),
    }))
  const backdoorfilename = "zbackdoor.json"
  ns.write(backdoorfilename, JSON.stringify(backdoors), "w")
  ns.tprintf(`Updated ${backdoorfilename}`)
}

function traceServer(endserver: string, allservers: Info[]) {
  let trace: string[] = []
  let i = allservers.findIndex(s => s.Svr.hostname == endserver)
  while (i > 0) {
    const server = allservers[i]
    trace.unshift(server.Svr.hostname)
    i = allservers.findIndex(s => s.Svr.hostname == server.Parent)
  }
  return trace
}

type Info = {
  Svr: Server
  Dep: number
  Parent: string
}

function scanNames(ns: NS): Info[] {
  const processed: string[] = []
  return scanNames2("home", 0, "")

  function scanNames2(server: string, depth: number, parent: string): Info[] {
    processed.push(server)
    const links = ns.scan(server).filter(s => !processed.includes(s))
    //ns.printf("scanning %s got %j", server, links)
    const selfinfo = { Svr: ns.getServer(server), Dep: depth, Parent: parent } as Info
    if (links.length < 1) return [selfinfo]
    return links.reduce(
      (results, link): Info[] => results.concat(...scanNames2(link, depth + 1, server)),
      [selfinfo]
    )
  }
}
