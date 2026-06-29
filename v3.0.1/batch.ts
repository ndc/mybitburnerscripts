export async function main(ns: NS) {
  const targetname = ns.args[0] as string
  ns.killall("home", true)
  ns.exec("postoffice.ts", "home", 1)
  await ns.sleep(0)
  for (let i = 0; i < 15; i++) {
    await ns.sleep(2000)
    ns.exec("sendmsg.ts", "home", 1, "hack", targetname, "home")
  }
  ns.exec("runall.ts", "home", 1, "hack", targetname)
}