export async function main(ns: NS) {
  const withContract = queryBase(ns)
    .filter(s => ns.ls(s, ".cct").length > 0)
    .flatMap(s => ns.ls(s, ".cct").map(c => [
      s,
      c,
      ns.codingcontract.getContractType(c, s),
    ]))
  ns.tprintf("%j", withContract)
}

function queryBase(ns: NS) {
  const serverInfoFile = "zserverinfo.json"
  const allservers = (JSON.parse(ns.read(serverInfoFile)) as { Svr: Server }[])
    .map(s => s.Svr.hostname)
  return allservers
}
