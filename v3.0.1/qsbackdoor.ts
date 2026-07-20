export async function main(ns: NS) {
  const traces = ns.args.map(a => a as string)
  for (let trace of traces) {
    ns.singularity.connect(trace)
  }
  await ns.singularity.installBackdoor()
  ns.singularity.connect("home")
}
