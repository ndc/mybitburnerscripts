export async function main(ns: NS) {
  const a = ns.gang.getMemberNames().map(n => ns.gang.getMemberInformation(n))
  const b = ns.gang.getTaskNames().map(t => ns.gang.getTaskStats(t))
  ns.tprintf("%j", b)
}

function sortSelf() {
  const result = selfCrimeInfo.map(c => ({
    name: c.type,
    time: c.time,
    ipt: c.agility_exp / c.time,
  }))
    .toSorted((a, b) => b.ipt - a.ipt)

  return result
}

function sortGang() {
  const result = gangCrimeInfo.map(c => ({
    name: c.name,
    ipt: c.baseRespect / c.difficulty,
  }))
    .toSorted((a, b) => b.ipt - a.ipt)

  return result
}

const selfCrimeInfo = [
  {
    "time": 2000,
    "hacking_success_weight": 0,
    "strength_success_weight": 0,
    "defense_success_weight": 0,
    "dexterity_success_weight": 1,
    "agility_success_weight": 1,
    "charisma_success_weight": 0,
    "hacking_exp": 0,
    "strength_exp": 0,
    "defense_exp": 0,
    "dexterity_exp": 1.37902121725368,
    "agility_exp": 1.37902121725368,
    "charisma_exp": 0,
    "intelligence_exp": 0,
    "workName": "to shoplift",
    "tooltipText": "Attempt to shoplift from a low-end retailer",
    "type": "Shoplift",
    "money": 5114.915060359103,
    "difficulty": 0.05,
    "karma": 0.1,
    "kills": 0,
    "reputation": 0
  },
  {
    "time": 60000,
    "hacking_success_weight": 0.5,
    "strength_success_weight": 0,
    "defense_success_weight": 0,
    "dexterity_success_weight": 2,
    "agility_success_weight": 1,
    "charisma_success_weight": 0,
    "hacking_exp": 22.34014371950962,
    "strength_exp": 0,
    "defense_exp": 0,
    "dexterity_exp": 31.0279773882078,
    "agility_exp": 31.0279773882078,
    "charisma_exp": 0,
    "intelligence_exp": 0.1875,
    "workName": "to rob a store",
    "tooltipText": "Attempt to commit armed robbery on a high-end store",
    "type": "Rob Store",
    "money": 136397.73494290945,
    "difficulty": 0.2,
    "karma": 0.5,
    "kills": 0,
    "reputation": 0
  },
  {
    "time": 4000,
    "hacking_success_weight": 0,
    "strength_success_weight": 1.5,
    "defense_success_weight": 0.5,
    "dexterity_success_weight": 1.5,
    "agility_success_weight": 0.5,
    "charisma_success_weight": 0,
    "hacking_exp": 0,
    "strength_exp": 2.06853182588052,
    "defense_exp": 2.06853182588052,
    "dexterity_exp": 2.06853182588052,
    "agility_exp": 2.06853182588052,
    "charisma_exp": 0,
    "intelligence_exp": 0,
    "workName": "to mug",
    "tooltipText": "Attempt to mug a random person on the street",
    "type": "Mug",
    "money": 12275.796144861848,
    "difficulty": 0.2,
    "karma": 0.25,
    "kills": 0,
    "reputation": 0
  },
  {
    "time": 90000,
    "hacking_success_weight": 0.5,
    "strength_success_weight": 0,
    "defense_success_weight": 0,
    "dexterity_success_weight": 1,
    "agility_success_weight": 1,
    "charisma_success_weight": 0,
    "hacking_exp": 33.510215579264425,
    "strength_exp": 0,
    "defense_exp": 0,
    "dexterity_exp": 41.3706365176104,
    "agility_exp": 41.3706365176104,
    "charisma_exp": 0,
    "intelligence_exp": 0.375,
    "workName": "larceny",
    "tooltipText": "Attempt to rob property from someone's house",
    "type": "Larceny",
    "money": 272795.4698858189,
    "difficulty": 0.3333333333333333,
    "karma": 1.5,
    "kills": 0,
    "reputation": 0
  },
  {
    "time": 10000,
    "hacking_success_weight": 0,
    "strength_success_weight": 0,
    "defense_success_weight": 0,
    "dexterity_success_weight": 2,
    "agility_success_weight": 1,
    "charisma_success_weight": 3,
    "hacking_exp": 0,
    "strength_exp": 0,
    "defense_exp": 0,
    "dexterity_exp": 3.4475530431342,
    "agility_exp": 3.4475530431342,
    "charisma_exp": 6.8951060862684,
    "intelligence_exp": 0,
    "workName": "to deal drugs",
    "tooltipText": "Attempt to deal drugs",
    "type": "Deal Drugs",
    "money": 40919.32048287283,
    "difficulty": 1,
    "karma": 0.5,
    "kills": 0,
    "reputation": 0
  },
  {
    "time": 300000,
    "hacking_success_weight": 0.05,
    "strength_success_weight": 0,
    "defense_success_weight": 0,
    "dexterity_success_weight": 1.25,
    "agility_success_weight": 0,
    "charisma_success_weight": 0,
    "hacking_exp": 74.46714573169872,
    "strength_exp": 0,
    "defense_exp": 0,
    "dexterity_exp": 103.426591294026,
    "agility_exp": 0,
    "charisma_exp": 10.3426591294026,
    "intelligence_exp": 1.5,
    "workName": "to forge bonds",
    "tooltipText": "Attempt to forge corporate bonds",
    "type": "Bond Forgery",
    "money": 1534474.5181077311,
    "difficulty": 0.5,
    "karma": 0.1,
    "kills": 0,
    "reputation": 0
  },
  {
    "time": 40000,
    "hacking_success_weight": 0,
    "strength_success_weight": 1,
    "defense_success_weight": 1,
    "dexterity_success_weight": 1,
    "agility_success_weight": 1,
    "charisma_success_weight": 1,
    "hacking_exp": 0,
    "strength_exp": 13.7902121725368,
    "defense_exp": 13.7902121725368,
    "dexterity_exp": 13.7902121725368,
    "agility_exp": 13.7902121725368,
    "charisma_exp": 27.5804243450736,
    "intelligence_exp": 0,
    "workName": "to traffic arms",
    "tooltipText": "Attempt to smuggle illegal arms into the city",
    "type": "Traffick Arms",
    "money": 204596.60241436414,
    "difficulty": 2,
    "karma": 1,
    "kills": 0,
    "reputation": 0
  },
  {
    "time": 3000,
    "hacking_success_weight": 0,
    "strength_success_weight": 2,
    "defense_success_weight": 2,
    "dexterity_success_weight": 0.5,
    "agility_success_weight": 0.5,
    "charisma_success_weight": 0,
    "hacking_exp": 0,
    "strength_exp": 1.37902121725368,
    "defense_exp": 1.37902121725368,
    "dexterity_exp": 1.37902121725368,
    "agility_exp": 1.37902121725368,
    "charisma_exp": 0,
    "intelligence_exp": 0,
    "workName": "homicide",
    "tooltipText": "Attempt to murder a random person on the street",
    "type": "Homicide",
    "money": 15344.745181077311,
    "difficulty": 1,
    "karma": 3,
    "kills": 1,
    "reputation": 0
  },
  {
    "time": 80000,
    "hacking_success_weight": 1,
    "strength_success_weight": 1,
    "defense_success_weight": 0,
    "dexterity_success_weight": 4,
    "agility_success_weight": 2,
    "charisma_success_weight": 2,
    "hacking_exp": 0,
    "strength_exp": 13.7902121725368,
    "defense_exp": 13.7902121725368,
    "dexterity_exp": 13.7902121725368,
    "agility_exp": 55.1608486901472,
    "charisma_exp": 27.5804243450736,
    "intelligence_exp": 0.4,
    "workName": "grand theft auto",
    "tooltipText": "Attempt to commit grand theft auto",
    "type": "Grand Theft Auto",
    "money": 545590.9397716378,
    "difficulty": 8,
    "karma": 5,
    "kills": 0,
    "reputation": 0
  },
  {
    "time": 120000,
    "hacking_success_weight": 0,
    "strength_success_weight": 1,
    "defense_success_weight": 0,
    "dexterity_success_weight": 1,
    "agility_success_weight": 1,
    "charisma_success_weight": 1,
    "hacking_exp": 0,
    "strength_exp": 55.1608486901472,
    "defense_exp": 55.1608486901472,
    "dexterity_exp": 55.1608486901472,
    "agility_exp": 55.1608486901472,
    "charisma_exp": 55.1608486901472,
    "intelligence_exp": 0.65,
    "workName": "to kidnap",
    "tooltipText": "Attempt to kidnap and ransom a high-profile-target",
    "type": "Kidnap",
    "money": 1227579.614486185,
    "difficulty": 5,
    "karma": 6,
    "kills": 0,
    "reputation": 0
  },
  {
    "time": 600000,
    "hacking_success_weight": 1,
    "strength_success_weight": 1,
    "defense_success_weight": 1,
    "dexterity_success_weight": 1,
    "agility_success_weight": 1,
    "charisma_success_weight": 1,
    "hacking_exp": 335.1021557926443,
    "strength_exp": 310.279773882078,
    "defense_exp": 310.279773882078,
    "dexterity_exp": 310.279773882078,
    "agility_exp": 310.279773882078,
    "charisma_exp": 310.279773882078,
    "intelligence_exp": 3.25,
    "workName": "a heist",
    "tooltipText": "Attempt to pull off the ultimate heist",
    "type": "Heist",
    "money": 40919320.48287283,
    "difficulty": 18,
    "karma": 15,
    "kills": 0,
    "reputation": 0
  },
  {
    "time": 300000,
    "hacking_success_weight": 0,
    "strength_success_weight": 1,
    "defense_success_weight": 0,
    "dexterity_success_weight": 2,
    "agility_success_weight": 1,
    "charisma_success_weight": 0,
    "hacking_exp": 0,
    "strength_exp": 206.853182588052,
    "defense_exp": 206.853182588052,
    "dexterity_exp": 206.853182588052,
    "agility_exp": 206.853182588052,
    "charisma_exp": 0,
    "intelligence_exp": 1.625,
    "workName": "to assassinate",
    "tooltipText": "Attempt to assassinate a high-profile target",
    "type": "Assassination",
    "money": 4091932.048287283,
    "difficulty": 8,
    "karma": 10,
    "kills": 1,
    "reputation": 0
  },
]

const gangCrimeInfo = [
  {
    "name": "Unassigned",
    "desc": "This gang member is currently idle",
    "isHacking": true,
    "isCombat": true,
    "baseRespect": 0,
    "baseWanted": 0,
    "baseMoney": 0,
    "hackWeight": 100,
    "strWeight": 0,
    "defWeight": 0,
    "dexWeight": 0,
    "agiWeight": 0,
    "chaWeight": 0,
    "difficulty": 1,
    "territory": {
      "money": 1,
      "respect": 1,
      "wanted": 1
    }
  },
  {
    "name": "Mug People",
    "desc": "Assign this gang member to mug random people on the streets<br><br>Earns money - Slightly increases respect - Very slightly increases wanted level",
    "isHacking": false,
    "isCombat": true,
    "baseRespect": 0.00005,
    "baseWanted": 0.00005,
    "baseMoney": 3.6,
    "hackWeight": 0,
    "strWeight": 25,
    "defWeight": 25,
    "dexWeight": 25,
    "agiWeight": 10,
    "chaWeight": 15,
    "difficulty": 1,
    "territory": {
      "money": 1,
      "respect": 1,
      "wanted": 1
    }
  },
  {
    "name": "Deal Drugs",
    "desc": "Assign this gang member to sell drugs<br><br>Earns money - Slightly increases respect - Slightly increases wanted level - Scales slightly with territory",
    "isHacking": false,
    "isCombat": true,
    "baseRespect": 0.00006,
    "baseWanted": 0.002,
    "baseMoney": 15,
    "hackWeight": 0,
    "strWeight": 0,
    "defWeight": 0,
    "dexWeight": 20,
    "agiWeight": 20,
    "chaWeight": 60,
    "difficulty": 3.5,
    "territory": {
      "money": 1.2,
      "respect": 1,
      "wanted": 1.15
    }
  },
  {
    "name": "Strongarm Civilians",
    "desc": "Assign this gang member to extort civilians in your territory<br><br>Earns money - Slightly increases respect - Increases wanted - Scales heavily with territory",
    "isHacking": false,
    "isCombat": true,
    "baseRespect": 0.00004,
    "baseWanted": 0.02,
    "baseMoney": 7.5,
    "hackWeight": 10,
    "strWeight": 25,
    "defWeight": 25,
    "dexWeight": 20,
    "agiWeight": 10,
    "chaWeight": 10,
    "difficulty": 5,
    "territory": {
      "money": 1.6,
      "respect": 1.1,
      "wanted": 1.5
    }
  },
  {
    "name": "Run a Con",
    "desc": "Assign this gang member to run cons<br><br>Earns money - Increases respect - Increases wanted level",
    "isHacking": false,
    "isCombat": true,
    "baseRespect": 0.00012,
    "baseWanted": 0.05,
    "baseMoney": 45,
    "hackWeight": 0,
    "strWeight": 5,
    "defWeight": 5,
    "dexWeight": 25,
    "agiWeight": 25,
    "chaWeight": 40,
    "difficulty": 14,
    "territory": {
      "money": 1,
      "respect": 1,
      "wanted": 1
    }
  },
  {
    "name": "Armed Robbery",
    "desc": "Assign this gang member to commit armed robbery on stores, banks and armored cars<br><br>Earns money - Increases respect - Increases wanted level",
    "isHacking": false,
    "isCombat": true,
    "baseRespect": 0.00014,
    "baseWanted": 0.1,
    "baseMoney": 114,
    "hackWeight": 20,
    "strWeight": 15,
    "defWeight": 15,
    "dexWeight": 20,
    "agiWeight": 10,
    "chaWeight": 20,
    "difficulty": 20,
    "territory": {
      "money": 1,
      "respect": 1,
      "wanted": 1
    }
  },
  {
    "name": "Traffick Illegal Arms",
    "desc": "Assign this gang member to traffick illegal arms<br><br>Earns money - Increases respect - Increases wanted level - Scales heavily with territory",
    "isHacking": false,
    "isCombat": true,
    "baseRespect": 0.0002,
    "baseWanted": 0.24,
    "baseMoney": 174,
    "hackWeight": 15,
    "strWeight": 20,
    "defWeight": 20,
    "dexWeight": 20,
    "agiWeight": 0,
    "chaWeight": 25,
    "difficulty": 32,
    "territory": {
      "money": 1.4,
      "respect": 1.3,
      "wanted": 1.25
    }
  },
  {
    "name": "Threaten & Blackmail",
    "desc": "Assign this gang member to threaten and blackmail high-profile targets<br><br>Earns money - Slightly increases respect - Slightly increases wanted level",
    "isHacking": false,
    "isCombat": true,
    "baseRespect": 0.0002,
    "baseWanted": 0.125,
    "baseMoney": 72,
    "hackWeight": 25,
    "strWeight": 25,
    "defWeight": 0,
    "dexWeight": 25,
    "agiWeight": 0,
    "chaWeight": 25,
    "difficulty": 28,
    "territory": {
      "money": 1,
      "respect": 1,
      "wanted": 1
    }
  },
  {
    "name": "Human Trafficking",
    "desc": "Assign this gang member to engage in human trafficking operations<br><br>Earns money - Increases respect - Increases wanted level - Scales heavily with territory",
    "isHacking": false,
    "isCombat": true,
    "baseRespect": 0.004,
    "baseWanted": 1.25,
    "baseMoney": 360,
    "hackWeight": 30,
    "strWeight": 5,
    "defWeight": 5,
    "dexWeight": 30,
    "agiWeight": 0,
    "chaWeight": 30,
    "difficulty": 36,
    "territory": {
      "money": 1.5,
      "respect": 1.5,
      "wanted": 1.6
    }
  },
  {
    "name": "Terrorism",
    "desc": "Assign this gang member to commit acts of terrorism<br><br>Greatly increases respect - Greatly increases wanted level - Scales heavily with territory",
    "isHacking": false,
    "isCombat": true,
    "baseRespect": 0.01,
    "baseWanted": 6,
    "baseMoney": 0,
    "hackWeight": 20,
    "strWeight": 20,
    "defWeight": 20,
    "dexWeight": 20,
    "agiWeight": 0,
    "chaWeight": 20,
    "difficulty": 36,
    "territory": {
      "money": 1,
      "respect": 2,
      "wanted": 2
    }
  },
  {
    "name": "Vigilante Justice",
    "desc": "Assign this gang member to be a vigilante and protect the city from criminals<br><br>Decreases wanted level",
    "isHacking": true,
    "isCombat": true,
    "baseRespect": 0,
    "baseWanted": -0.001,
    "baseMoney": 0,
    "hackWeight": 20,
    "strWeight": 20,
    "defWeight": 20,
    "dexWeight": 20,
    "agiWeight": 20,
    "chaWeight": 0,
    "difficulty": 1,
    "territory": {
      "money": 1,
      "respect": 1,
      "wanted": 0.9
    }
  },
  {
    "name": "Train Combat",
    "desc": "Assign this gang member to increase their combat stats (str, def, dex, agi)",
    "isHacking": true,
    "isCombat": true,
    "baseRespect": 0,
    "baseWanted": 0,
    "baseMoney": 0,
    "hackWeight": 0,
    "strWeight": 25,
    "defWeight": 25,
    "dexWeight": 25,
    "agiWeight": 25,
    "chaWeight": 0,
    "difficulty": 100,
    "territory": {
      "money": 1,
      "respect": 1,
      "wanted": 1
    }
  },
  {
    "name": "Train Hacking",
    "desc": "Assign this gang member to train their hacking skills",
    "isHacking": true,
    "isCombat": true,
    "baseRespect": 0,
    "baseWanted": 0,
    "baseMoney": 0,
    "hackWeight": 100,
    "strWeight": 0,
    "defWeight": 0,
    "dexWeight": 0,
    "agiWeight": 0,
    "chaWeight": 0,
    "difficulty": 45,
    "territory": {
      "money": 1,
      "respect": 1,
      "wanted": 1
    }
  },
  {
    "name": "Train Charisma",
    "desc": "Assign this gang member to train their charisma",
    "isHacking": true,
    "isCombat": true,
    "baseRespect": 0,
    "baseWanted": 0,
    "baseMoney": 0,
    "hackWeight": 0,
    "strWeight": 0,
    "defWeight": 0,
    "dexWeight": 0,
    "agiWeight": 0,
    "chaWeight": 100,
    "difficulty": 8,
    "territory": {
      "money": 1,
      "respect": 1,
      "wanted": 1
    }
  },
  {
    "name": "Territory Warfare",
    "desc": "Members assigned to this task increase your gang's power. They will also fight for territory if 'Territory Clashes' are enabled.<br /><br />Gang members performing this task can be killed during clashes.",
    "isHacking": true,
    "isCombat": true,
    "baseRespect": 0,
    "baseWanted": 0,
    "baseMoney": 0,
    "hackWeight": 15,
    "strWeight": 20,
    "defWeight": 20,
    "dexWeight": 20,
    "agiWeight": 20,
    "chaWeight": 5,
    "difficulty": 5,
    "territory": {
      "money": 1,
      "respect": 1,
      "wanted": 1
    }
  }
]

/*
ns.gang.nextUpdate()
ns.gang.inGang()
ns.gang.createGang("Slum Snakes")
ns.gang.canRecruitMember()
ns.gang.getRecruitsAvailable()
ns.gang.recruitMember("")

ns.gang.getMemberNames()
ns.gang.getMemberInformation("")
ns.gang.getTaskNames()
ns.gang.getTaskStats("")
ns.gang.setMemberTask("", "")

ns.gang.getEquipmentNames()
ns.gang.getEquipmentCost("")
ns.gang.getEquipmentStats("")
ns.gang.getEquipmentType("")
ns.gang.purchaseEquipment("","")

ns.formulas.gang.ascensionMultiplier(0)
ns.formulas.gang.ascensionPointsGain(0)
ns.formulas.gang.moneyGain(
  ns.gang.getGangInformation(),
  ns.gang.getMemberInformation(""),
  ns.gang.getTaskStats(""))
ns.formulas.gang.respectGain(
  ns.gang.getGangInformation(),
  ns.gang.getMemberInformation(""),
  ns.gang.getTaskStats(""))
ns.formulas.gang.wantedLevelGain(
  ns.gang.getGangInformation(),
  ns.gang.getMemberInformation(""),
  ns.gang.getTaskStats(""))
ns.formulas.gang.wantedPenalty(ns.gang.getGangInformation())

ns.gang.getGangInformation()
ns.gang.getAllGangInformation()

ns.gang.getBonusTime()
ns.gang.renameMember("", "")
ns.gang.respectForNextRecruit()
ns.gang.setTerritoryWarfare(false)
*/



/*
ns.gang.getMemberInformation("b")
{
  "name": "a",
  "task": "Human Trafficking",
  "earnedRespect": 760827591.2057276,
  "hack": 8734,
  "str": 434750,
  "def": 222551,
  "dex": 44436,
  "agi": 80769,
  "cha": 5535,
  "hack_exp": 1517501.9769476831,
  "str_exp": 7150002.576323436,
  "def_exp": 5056439.380847773,
  "dex_exp": 9456578.402249217,
  "agi_exp": 1609067.5683720892,
  "cha_exp": 1365112.5476336817,
  "hack_mult": 2.2723515045,
  "str_mult": 29.206517322318344,
  "def_mult": 15.515548794797638,
  "dex_mult": 2.2200750000000005,
  "agi_mult": 7.285657510010879,
  "cha_mult": 1.4592614400000004,
  "hack_asc_mult": 15.047381933485694,
  "str_asc_mult": 48.79714853815486,
  "def_asc_mult": 48.79476296122174,
  "dex_asc_mult": 63.746193974416066,
  "agi_asc_mult": 43.08181707392698,
  "cha_asc_mult": 15.049855205641515,
  "hack_asc_points": 452847.4061043833,
  "str_asc_points": 4762323.410909497,
  "def_asc_points": 4761857.784883635,
  "dex_asc_points": 8127154.492447757,
  "agi_asc_points": 3712085.924782612,
  "cha_asc_points": 452996.28342155,
  "upgrades": [
    "Bulletproof Vest",
    "Full Body Armor",
    "Liquid Body Armor",
    "Graphene Plating Armor",
    "Baseball Bat",
    "Katana",
    "Malorian-3516",
    "Hansen-HA7",
    "Arasaka-HJSH18",
    "Militech-M251s",
    "Nokota-D5",
    "Techtronika-SPT32",
    "Herrera Outlaw GTS",
    "Yaiba ASM-R250 Muramasa",
    "Rayfield Caliburn",
    "Quadra Sport R-7",
    "NUKE Rootkit",
    "Soulstealer Rootkit",
    "Demon Rootkit",
    "Hmap Node",
    "Jack the Ripper"
  ],
  "augmentations": [
    "Bionic Spine",
    "Nanofiber Weave",
    "Synfibril Muscle",
    "BrachiBlades",
    "Graphene Bone Lacings",
    "Bionic Arms",
    "Synthetic Heart",
    "Bionic Legs",
    "BitWire",
    "DataJack",
    "Neuralstimulator"
  ],
  "respectGain": 21911.289324345915,
  "wantedLevelGain": 0.00006924743167187664,
  "moneyGain": 891099646.7651436,
  "expGain": {
    "hack_exp": 9.979471819624523,
    "str_exp": 32.9480118842252,
    "def_exp": 18.940908503234766,
    "dex_exp": 41.85749728828297,
    "agi_exp": 0,
    "cha_exp": 8.441847681270437
  }
}

ns.gang.getGangInformation()
{
  "faction": "Slum Snakes",
  "isHacking": false,
  "moneyGainRate": 300426.13989306067,
  "power": 1,
  "respect": 375126.52694476605,
  "respectGainRate": 44.371473553287295,
  "respectForNextRecruit": 390625,
  "territory": 0.14285714285714515,
  "territoryClashChance": 0,
  "territoryWarfareEngaged": false,
  "wantedLevel": 1,
  "wantedLevelGainRate": -0.032091093109099515,
  "wantedPenalty": 0.9999973342398834,
  "equipmentCostMult": 0.8250979050835257
}

ns.gang.getAllGangInformation()
{
  "Slum Snakes": {
    "power": 1,
    "territory": 0.14285714285714515
  },
  "Tetrads": {
    "power": 36.44457102257599,
    "territory": 0
  },
  "The Syndicate": {
    "power": 20.240880901938223,
    "territory": 0
  },
  "The Dark Army": {
    "power": 22.325944225460937,
    "territory": 0
  },
  "Speakers for the Dead": {
    "power": 471.0798001518366,
    "territory": 0.49423832979777277
  },
  "NiteSec": {
    "power": 23.707413787283514,
    "territory": 0
  },
  "The Black Hand": {
    "power": 100.78743319344923,
    "territory": 0.3629045273450821
  }
}

*/
