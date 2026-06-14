export async function main(ns: NS) {
  const endserver = ns.args[0] as string ?? "run4theh111z"

  ns.disableLog("ALL")

  const allservers = scanNames(ns, "home")

  const traceresult = traceserver(allservers, endserver)
  ns.tprintf("%j", traceresult)
}

function traceserver(allservers: Info[], endserver: string): string[] {
  let trace: string[] = []
  let i = allservers.findIndex(s => s.Name == endserver)
  while (i > 0) {
    const server = allservers[i]
    trace.unshift(server.Name)
    i = allservers.findIndex(s => s.Name == server.Parent)
  }
  return trace
}

type Info = {
  Name: string
  Dep: number
  Parent: string
}

function scanNames(ns: NS, server2: string): Info[] {
  const processed: string[] = []
  return scanNames2(server2, 0, "")

  function scanNames2(server: string, depth: number, parent: string): Info[] {
    processed.push(server)
    const links = ns.scan(server).filter(s => !processed.includes(s))
    //ns.printf("scanning %s got %j", server, links)
    const selfinfo = { Name: server, Dep: depth, Parent: parent } as Info
    if (links.length < 1) return [selfinfo]
    return links.reduce(
      (results, link): Info[] => results.concat(...scanNames2(link, depth + 1, server)),
      [selfinfo]
    )
  }
}
