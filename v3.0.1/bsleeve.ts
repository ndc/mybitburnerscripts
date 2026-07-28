export async function main(ns: NS) {
  const crimeTypeRaw = ns.args[0] as string
  const dopCount = ns.sleeve.getNumSleeves()
  for (let dopIdx = 0; dopIdx < dopCount; dopIdx++) {
    const dop = ns.sleeve.getSleeve(dopIdx)
    if (dop.shock > 95) continue

    let crimeType: CrimeType = "Mug"
    switch (crimeTypeRaw?.toLowerCase()) {
      case "shoplift":
        crimeType = "Shoplift"
        break
      case "homicide":
        crimeType = "Homicide"
        break
      default:
        crimeType = "Mug"
    }
    const crimeSucc = ns.sleeve.setToCommitCrime(dopIdx, crimeType)
  }
}