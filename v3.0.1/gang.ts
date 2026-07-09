export async function main(ns: NS) {
  ns.disableLog("ALL")
  await whatChanged(ns)
}

async function whatChanged(ns: NS) {
  while (true) {
    await ns.gang.nextUpdate()

    recruit(ns)
    ascendTrainees(ns)
  }
}

function recruit(ns: NS) {
  const recruitCount = ns.gang.getRecruitsAvailable()
  let existingMembers = ns.gang.getMemberNames()
  const lastName = existingMembers.map(n => Number(n) || 0).toSorted((a, b) => b - a).find(a => true)
  for (let i = 0; i < recruitCount; i++) {
    const newName = (lastName! + i + 1).toString()
    let successful = ns.gang.recruitMember(newName)
    successful = ns.gang.setMemberTask(newName, "Train Combat")
  }
}

function ascendTrainees(ns: NS) {
  const members = ns.gang.getMemberNames().map(n => ns.gang.getMemberInformation(n))
  for (let member of members) {
    if (member.task != "Train Combat") continue
    if (member.earnedRespect > 0) continue
    //if (member.def > 10000) continue
    const dAscPoint = ns.formulas.gang.ascensionPointsGain(member.def_exp)
    const newMultiplier = ns.formulas.gang.ascensionMultiplier(member.def_asc_points + dAscPoint)
    const increasePct = newMultiplier / member.def_asc_mult
    if (increasePct < 1.2) continue
    const ascendlog = `\r\n${new Date().toLocaleTimeString()} ascending ${member.name} def ${member.def} mult ${newMultiplier}`
    ns.printf(ascendlog)
    ns.write("zascendlog.txt", ascendlog, "a")
    const successful = ns.gang.ascendMember(member.name)
  }
}