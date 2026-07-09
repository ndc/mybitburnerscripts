export async function main(ns: NS) {
  ns.disableLog("ALL")

  const updateAllServers = () => {
    ns.run("allservers.ts", { threads: 1, preventDuplicates: true })
    return (JSON.parse(ns.read("zserverinfo.json")) as { Svr: Server }[]).map(s => s.Svr)
  }
  const backdoors = JSON.parse(ns.read("zbackdoor.json")) as {
    hostname: string, traces: string[], hacking: number
  }[]
  let allservers: Server[] = []
  const flag = {
    allservers: false,
    tor: false,
    ssh: false,
    ftp: false,
    smtp: false,
    http: false,
    sql: false,
    target2: "",
    target2prepped: false,
    csec: false,
    avmnite: false,
    iiii: false,
    run4: false,
  }
  while (true) {
    let person = ns.getPlayer()

    if (!flag.allservers) {
      ns.printf(`${new Date().toLocaleTimeString()} allservers`)
      allservers = updateAllServers()
      ns.run("scanprocess.ts", { threads: 1, preventDuplicates: true })
      ns.run("postoffice.ts", { threads: 1, preventDuplicates: true })
      await ns.sleep(10)
      ns.run("sendmsg.ts", { threads: 1, preventDuplicates: true }, "weaken", "n00dles", "home")
      ns.run("runall.ts", { threads: 1, preventDuplicates: true }, "hack", "n00dles")
      flag.allservers = true
    }
    if (person.money > 200000 && !flag.tor) {
      ns.printf(`${new Date().toLocaleTimeString()} tor`)
      ns.singularity.purchaseTor()
      person = ns.getPlayer()
      flag.tor = true
    }
    if (person.money > 500000 && !flag.ssh) {
      if (ns.singularity.purchaseProgram("BruteSSH.exe")) {
        ns.printf(`${new Date().toLocaleTimeString()} ssh`)
        ns.run("scanprocess.ts", { threads: 1, preventDuplicates: true })
        ns.run("runall.ts", { threads: 1, preventDuplicates: true }, "hack", "n00dles")
        person = ns.getPlayer()
        flag.ssh = true
        await ns.sleep(100)
        allservers = updateAllServers()
      }
    }
    if (person.money > 1500000 && !flag.ftp) {
      if (ns.singularity.purchaseProgram("FTPCrack.exe")) {
        ns.printf(`${new Date().toLocaleTimeString()} ftp`)
        ns.run("scanprocess.ts", { threads: 1, preventDuplicates: true })
        ns.run("runall.ts", { threads: 1, preventDuplicates: true }, "hack", "n00dles")
        person = ns.getPlayer()
        flag.ftp = true
        await ns.sleep(100)
        allservers = updateAllServers()
      }
    }
    if (person.money > 5000000 && !flag.smtp) {
      if (ns.singularity.purchaseProgram("relaySMTP.exe")) {
        ns.printf(`${new Date().toLocaleTimeString()} smtp`)
        ns.run("scanprocess.ts", { threads: 1, preventDuplicates: true })
        ns.run("runall.ts", { threads: 1, preventDuplicates: true }, "hack", (flag.target2 == "" ? "n00dles" : flag.target2))
        person = ns.getPlayer()
        flag.smtp = true
        await ns.sleep(100)
        allservers = updateAllServers()
      }
    }
    if (person.money > 30000000 && !flag.http) {
      if (ns.singularity.purchaseProgram("HTTPWorm.exe")) {
        ns.printf(`${new Date().toLocaleTimeString()} http`)
        ns.run("scanprocess.ts", { threads: 1, preventDuplicates: true })
        ns.run("runall.ts", { threads: 1, preventDuplicates: true }, "hack", (flag.target2 == "" ? "n00dles" : flag.target2))
        person = ns.getPlayer()
        flag.http = true
        await ns.sleep(100)
        allservers = updateAllServers()
      }
    }
    if (person.money > 250000000 && !flag.sql) {
      if (ns.singularity.purchaseProgram("SQLInject.exe")) {
        ns.printf(`${new Date().toLocaleTimeString()} sql`)
        ns.run("scanprocess.ts", { threads: 1, preventDuplicates: true })
        ns.run("runall.ts", { threads: 1, preventDuplicates: true }, "hack", (flag.target2 == "" ? "n00dles" : flag.target2))
        person = ns.getPlayer()
        flag.sql = true
        await ns.sleep(100)
        allservers = updateAllServers()
      }
    }
    if (person.skills.hacking > 200 && flag.target2 == "") {
      allservers = updateAllServers()
      const nextTarget = allservers
        .filter(s => s.requiredHackingSkill! < person.skills.hacking / 2)
        .filter(s => s.moneyMax! > 0)
        .map(s => {
          s.hackDifficulty = s.minDifficulty
          return {
            ...s,
            weakenTime: ns.formulas.hacking.weakenTime(s, person),
          }
        })
        .map(s => ({
          ...s,
          ratio: s.moneyMax! / s.weakenTime
        }))
        .filter(s => s.weakenTime / 60000 < 2)
        .toSorted((a, b) => b.ratio - a.ratio)
        .find(a => true)!
      ns.printf(`${new Date().toLocaleTimeString()} target2`)
      ns.run("killscript.ts", { threads: 1 }, "qohack.ts", "home")
      ns.run("killscript.ts", { threads: 1 }, "qogrow.ts", "home")
      ns.run("killscript.ts", { threads: 1 }, "qoweaken.ts", "home")
      await ns.sleep(100)
      ns.run("sendmsg.ts", { threads: 1, preventDuplicates: true }, "weaken", nextTarget.hostname, "home")
      await ns.sleep(10)
      flag.target2 = nextTarget.hostname
    }
    if (flag.target2 != "" && !flag.target2prepped) {
      if (ns.scriptRunning("qohack.ts", "home")) {
        ns.printf(`${new Date().toLocaleTimeString()} target2prepped`)
        ns.run("killscript.ts", { threads: 1 }, "qohack.ts")
        ns.run("killscript.ts", { threads: 1 }, "qogrow.ts")
        ns.run("killscript.ts", { threads: 1 }, "qoweaken.ts")
        await ns.sleep(100)
        ns.run("sendmsg.ts", { threads: 1, preventDuplicates: true }, "hack", flag.target2, "home")
        ns.run("runall.ts", { threads: 1, preventDuplicates: true }, "hack", flag.target2)
        await ns.sleep(10)
        flag.target2prepped = true
      }
    }
    for (let backdoor of backdoors) {
      const server = allservers.find(s => s.hostname == backdoor.hostname)!
      if (server.backdoorInstalled) continue
      if (!server.hasAdminRights) continue
      if (person.skills.hacking < server.requiredHackingSkill!) continue
      switch (backdoor.hostname) {
        case "CSEC":
          if (!flag.csec) {
            ns.printf(`${new Date().toLocaleTimeString()} CSEC`)
            ns.run("qbackdoor.ts", { threads: 1, preventDuplicates: true }, ...backdoor.traces)
            flag.csec = true
            await ns.sleep(100)
          }
          break
        case "avmnite-02h":
          if (!flag.avmnite) {
            ns.printf(`${new Date().toLocaleTimeString()} avmnite`)
            ns.run("qbackdoor.ts", { threads: 1, preventDuplicates: true }, ...backdoor.traces)
            flag.avmnite = true
            await ns.sleep(100)
          }
          break
        case "I.I.I.I":
          if (!flag.iiii) {
            ns.printf(`${new Date().toLocaleTimeString()} iiii`)
            ns.run("qbackdoor.ts", { threads: 1, preventDuplicates: true }, ...backdoor.traces)
            flag.iiii = true
            await ns.sleep(100)
          }
          break
        case "run4theh111z":
          if (!flag.run4) {
            ns.printf(`${new Date().toLocaleTimeString()} run4`)
            ns.run("qbackdoor.ts", { threads: 1, preventDuplicates: true }, ...backdoor.traces)
            flag.run4 = true
            await ns.sleep(100)
          }
          break
      }
    }

    if (flag.sql && flag.target2prepped) break

    await ns.sleep(10000)
  }
}