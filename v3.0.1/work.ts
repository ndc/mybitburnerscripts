export async function main(ns: NS) {
  const company = ns.args[0] as CompanyName

  const checkpoint: {
    job: CompanyPositionInfo | undefined,
    nextjob: CompanyPositionInfo | undefined,
  } = {
    job: undefined,
    nextjob: undefined
  }
  while (true) {
    const positions = ns.singularity.getCompanyPositions(company)
      .map(p => ns.singularity.getCompanyPositionInfo(company, p))
    const rep = ns.singularity.getCompanyRep(company)
    const person = ns.getPlayer()

    if (rep > 300_000) {
      ns.tprintf(`${new Date().toLocaleTimeString()} 300K`)
      break
    }

    if (!checkpoint.job) {
      const applyResult = ns.singularity.applyToCompany(company, "IT")
      if (!!applyResult) {
        checkpoint.job = positions.find(p => p.name == applyResult)
        checkpoint.nextjob = positions.find(p => p.name == checkpoint.job!.nextPosition)
        ns.tprintf(`${new Date().toLocaleTimeString()} ${applyResult}`)
      }
    }

    if (!checkpoint.nextjob) {
      ns.tprintf(`${new Date().toLocaleTimeString()} no next position`)
      break
    }

    if (rep >= checkpoint.nextjob.requiredReputation
      && person.skills.hacking >= checkpoint.nextjob.requiredSkills.hacking
      && person.skills.charisma >= checkpoint.nextjob.requiredSkills.charisma) {
      const applyResult = ns.singularity.applyToCompany(company, checkpoint.nextjob.field)
      if (!!applyResult) {
        checkpoint.job = positions.find(p => p.name == applyResult)
        checkpoint.nextjob = !!(checkpoint.job!.nextPosition)
          ? positions.find(p => p.name == checkpoint.job!.nextPosition)
          : undefined
        ns.tprintf(`${new Date().toLocaleTimeString()} ${applyResult}`)
      }
    }

    await ns.sleep(10_000)
  }
}