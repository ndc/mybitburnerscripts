export async function main(ns: NS) {
  ns.disableLog("ALL")

  let existingMembers = ns.gang.getMemberNames()
  for (let i = 0; i < existingMembers.length; i++) {
    const memberInfo = ns.gang.getMemberInformation(existingMembers[i])
    gangInfo.members.push({
      name: memberInfo.name,
      lastAttr: memberInfo.def,
      lastMult: memberInfo.def_mult,
    })
    if (memberInfo.task == "Vigilante Justice") {
      gangInfo.doVigilante = memberInfo.name
    }
  }

  while (true) {
    await ns.gang.nextUpdate()

    recruit(ns)
    ascendTrainees(ns)
    growTeam(ns)
  }
}

interface gangMetadata {
  members: {
    name: string,
    lastAttr: number,
    lastMult: number,
  }[],
  maxSize: number,
  doMug: string,
  doVigilante: string,
}

const gangInfo: gangMetadata = {
  members: [],
  maxSize: 12,
  doMug: "",
  doVigilante: "",
}

function recruit(ns: NS) {
  const recruitCount = ns.gang.getRecruitsAvailable()
  let existingMembers = ns.gang.getMemberNames()
  const lastName = existingMembers.map(n => Number(n) || 0).toSorted((a, b) => b - a).find(a => true)
  for (let i = 0; i < recruitCount; i++) {
    const newName = ((lastName ?? -1) + i + 1).toString()
    let successful = ns.gang.recruitMember(newName)
    successful = ns.gang.setMemberTask(newName, "Train Combat")
    const newMember = ns.gang.getMemberInformation(newName)
    gangInfo.members.push({
      name: newName,
      lastAttr: newMember.def,
      lastMult: newMember.def_mult,
    })
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
    const nextAscend = calculateNextAscend(member.def_asc_mult)
    //if (increasePct < 1.2) continue
    if (increasePct < nextAscend) continue
    const successful = ns.gang.ascendMember(member.name)
    if (!!successful) {
      const memberInfo = gangInfo.members.find(m => m.name == member.name)!
      memberInfo.lastAttr = member.def
      memberInfo.lastMult = newMultiplier
      const ascendlog = `\r\n${new Date().toLocaleTimeString()} ascending ${member.name} def ${member.def} mult ${newMultiplier}`
      ns.printf(ascendlog)
      ns.write("zascendlog.txt", ascendlog, "a")
    }
  }
}

function calculateNextAscend(currentMultiplier: number) {
  const jeek = 1.66 - 0.62 / Math.exp((2 / currentMultiplier) ** 2.24)
  return jeek
}

const respectThreshold = [5, 25, 125, 625, 3125, 15625, 78125, 390625, 1953125]

const gangTasks = ["Unassigned", "Mug People", "Deal Drugs", "Strongarm Civilians", "Run a Con",
  "Armed Robbery", "Traffick Illegal Arms", "Threaten & Blackmail",
  "Human Trafficking", "Terrorism",
  "Vigilante Justice",
  "Train Combat", "Train Hacking", "Train Charisma",
  "Territory Warfare"]

function growTeam(ns: NS) {
  const members = ns.gang.getMemberNames().map(n => ns.gang.getMemberInformation(n))
  if (members.length >= gangInfo.maxSize) return
  if (gangInfo.members.length == 3) {
    const currentVigilante = members.find(m => m.task == "Vigilante Justice")
    if (!currentVigilante) {
    }
  }
}
