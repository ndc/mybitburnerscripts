export async function main(ns: NS) {
  ns.disableLog("ALL")

  const updateAllServers = async () => {
    ns.run("allservers.ts", { threads: 1, preventDuplicates: true })
    await ns.sleep(100)
    return (JSON.parse(ns.read("zserverinfo.json")) as { Svr: Server }[]).map(s => s.Svr)
  }
  let allservers = await updateAllServers()

  const backdoors = JSON.parse(ns.read("zbackdoor.json")) as {
    hostname: string, traces: string[]
  }[]

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
    counter: 0,
  }
  while (true) {
    let person = ns.getPlayer()

    if (!flag.allservers) {
      ns.printf(`${new Date().toLocaleTimeString()} allservers`)
      ns.run("scanprocess.ts", { threads: 1, preventDuplicates: true })
      ns.run("postoffice.ts", { threads: 1, preventDuplicates: true })
      await ns.sleep(100)
      ns.run("sendmsg.ts", { threads: 1 }, "weaken", "n00dles", "home")
      ns.run("runall.ts", { threads: 1, preventDuplicates: true }, "hack", "n00dles")
      await ns.sleep(10)
      ns.tprintf(`${new Date().toLocaleTimeString()} batch start`)
      flag.allservers = true
    }
    if (person.money > 200000 && !flag.tor) {
      ns.printf(`${new Date().toLocaleTimeString()} tor`)
      ns.run("qsbuytor.ts", { threads: 1, preventDuplicates: true })
      await ns.sleep(10)
      person = ns.getPlayer()
      ns.tprintf(`${new Date().toLocaleTimeString()} batch buy tor`)
      flag.tor = true
    }
    if (person.money > 500000 && !flag.ssh) {
      ns.printf(`${new Date().toLocaleTimeString()} ssh`)
      ns.run("qsbuy.ts", { threads: 1, preventDuplicates: true }, "BruteSSH.exe")
      await ns.sleep(10)
      ns.run("scanprocess.ts", { threads: 1, preventDuplicates: true })
      await ns.sleep(10)
      ns.run("runall.ts", { threads: 1, preventDuplicates: true }, "hack", "n00dles")
      person = ns.getPlayer()
      ns.tprintf(`${new Date().toLocaleTimeString()} batch buy ssh`)
      flag.ssh = true
      allservers = await updateAllServers()
    }
    if (person.money > 1500000 && !flag.ftp) {
      ns.printf(`${new Date().toLocaleTimeString()} ftp`)
      ns.run("qsbuy.ts", { threads: 1, preventDuplicates: true }, "FTPCrack.exe")
      await ns.sleep(10)
      ns.run("scanprocess.ts", { threads: 1, preventDuplicates: true })
      await ns.sleep(10)
      ns.run("runall.ts", { threads: 1, preventDuplicates: true }, "hack", "n00dles")
      person = ns.getPlayer()
      ns.tprintf(`${new Date().toLocaleTimeString()} batch buy ftp`)
      flag.ftp = true
      allservers = await updateAllServers()
    }
    if (person.money > 5000000 && !flag.smtp) {
      ns.printf(`${new Date().toLocaleTimeString()} smtp`)
      ns.run("qsbuy.ts", { threads: 1, preventDuplicates: true }, "relaySMTP.exe")
      await ns.sleep(10)
      ns.run("scanprocess.ts", { threads: 1, preventDuplicates: true })
      await ns.sleep(10)
      const target = (flag.target2 != "" && flag.target2prepped) ? flag.target2 : "n00dles"
      ns.run("runall.ts", { threads: 1, preventDuplicates: true }, "hack", target)
      person = ns.getPlayer()
      ns.tprintf(`${new Date().toLocaleTimeString()} batch buy smtp`)
      flag.smtp = true
      allservers = await updateAllServers()
    }
    if (person.money > 30000000 && !flag.http) {
      ns.printf(`${new Date().toLocaleTimeString()} http`)
      ns.run("qsbuy.ts", { threads: 1, preventDuplicates: true }, "HTTPWorm.exe")
      await ns.sleep(10)
      ns.run("scanprocess.ts", { threads: 1, preventDuplicates: true })
      await ns.sleep(10)
      const target = (flag.target2 != "" && flag.target2prepped) ? flag.target2 : "n00dles"
      ns.run("runall.ts", { threads: 1, preventDuplicates: true }, "hack", target)
      person = ns.getPlayer()
      ns.tprintf(`${new Date().toLocaleTimeString()} batch buy http`)
      flag.http = true
      allservers = await updateAllServers()
    }
    if (person.money > 250000000 && !flag.sql) {
      ns.printf(`${new Date().toLocaleTimeString()} sql`)
      ns.run("qsbuy.ts", { threads: 1, preventDuplicates: true }, "SQLInject.exe")
      await ns.sleep(10)
      ns.run("scanprocess.ts", { threads: 1, preventDuplicates: true })
      await ns.sleep(10)
      const target = (flag.target2 != "" && flag.target2prepped) ? flag.target2 : "n00dles"
      ns.run("runall.ts", { threads: 1, preventDuplicates: true }, "hack", target)
      person = ns.getPlayer()
      ns.tprintf(`${new Date().toLocaleTimeString()} batch buy sql`)
      flag.sql = true
      allservers = await updateAllServers()
    }
    if (person.skills.hacking > 210 && flag.target2 == "") {
      allservers = await updateAllServers()
      const nextTarget = allservers
        .filter(s => s.requiredHackingSkill! < person.skills.hacking)
        .filter(s => s.hasAdminRights)
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
      ns.printf(`${new Date().toLocaleTimeString()} target2 ${nextTarget.hostname}`)
      ns.run("killscript.ts", { threads: 1 }, "qohack.ts", "home")
      await ns.sleep(10)
      ns.run("killscript.ts", { threads: 1 }, "qogrow.ts", "home")
      await ns.sleep(10)
      ns.run("killscript.ts", { threads: 1 }, "qoweaken.ts", "home")
      await ns.sleep(1000)
      ns.run("sendmsg.ts", { threads: 1 }, "weaken", nextTarget.hostname, "home")
      await ns.sleep(1000)
      ns.tprintf(`${new Date().toLocaleTimeString()} batch target 2 ${nextTarget.hostname}`)
      flag.target2 = nextTarget.hostname
    }
    if (flag.target2 != "" && !flag.target2prepped) {
      if (ns.scriptRunning("qohack.ts", "home")) {
        ns.printf(`${new Date().toLocaleTimeString()} target2prepped`)
        ns.run("killscript.ts", { threads: 1 }, "qohack.ts")
        await ns.sleep(10)
        ns.run("killscript.ts", { threads: 1 }, "qogrow.ts")
        await ns.sleep(10)
        ns.run("killscript.ts", { threads: 1 }, "qoweaken.ts")
        await ns.sleep(1000)
        ns.run("sendmsg.ts", { threads: 1 }, "hack", flag.target2, "home")
        ns.run("runall.ts", { threads: 1 }, "hack", flag.target2)
        await ns.sleep(10)
        ns.tprintf(`${new Date().toLocaleTimeString()} batch switch to target 2`)
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
            ns.run("qsbackdoor.ts", { threads: 1, preventDuplicates: true }, ...backdoor.traces)
            await ns.sleep(8000)
            flag.csec = true
          }
          break
        case "avmnite-02h":
          if (!flag.avmnite) {
            ns.printf(`${new Date().toLocaleTimeString()} avmnite`)
            ns.run("qsbackdoor.ts", { threads: 1, preventDuplicates: true }, ...backdoor.traces)
            await ns.sleep(8000)
            flag.avmnite = true
          }
          break
        case "I.I.I.I":
          if (!flag.iiii) {
            ns.printf(`${new Date().toLocaleTimeString()} iiii`)
            ns.run("qsbackdoor.ts", { threads: 1, preventDuplicates: true }, ...backdoor.traces)
            await ns.sleep(8000)
            flag.iiii = true
          }
          break
        case "run4theh111z":
          if (!flag.run4) {
            ns.printf(`${new Date().toLocaleTimeString()} run4`)
            ns.run("qsbackdoor.ts", { threads: 1, preventDuplicates: true }, ...backdoor.traces)
            flag.run4 = true
          }
          break
      }
    }

    /*if (flag.http && flag.counter % 6 == 0) {
      ns.run("qcloud.ts", { threads: 1, preventDuplicates: true })
    }*/

    if (flag.sql && flag.target2prepped) break

    flag.counter += 1
    await ns.sleep(10000)
  }
}