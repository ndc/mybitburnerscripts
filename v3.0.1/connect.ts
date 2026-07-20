export async function main(ns: NS) {
  const target = ns.args[0] as string
  const allservers = (JSON.parse(ns.read("zserverinfo.json")) as { Svr: Server, Parent: string }[])
    .map(i => [i.Svr.hostname, i.Parent])
  const paths = traceServer(target, allservers)
  for (const path of paths) {
    ns.singularity.connect(path)
  }
}

function traceServer(endserver: string, allservers: string[][]) {
  let trace: string[] = []
  let server = allservers.find(s => s[0] == endserver)
  while (!!server) {
    trace.unshift(server[0])
    server = allservers.find(s => s[0] == server![1])
  }
  return trace
}
