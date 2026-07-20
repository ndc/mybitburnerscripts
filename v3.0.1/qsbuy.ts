export async function main(ns: NS) {
  const program = ns.args[0] as ProgramName
  ns.singularity.purchaseProgram(program)
}