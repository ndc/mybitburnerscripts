export async function main(ns: NS) {
  const toGraft = [
    "PC Direct-Neural Interface NeuroNet Injector",
    "PC Direct-Neural Interface Optimization Submodule",    
  ]
  for (const graft of toGraft) {
    await ns.grafting.waitForOngoingGrafting()
    ns.grafting.graftAugmentation(graft)
  }
}

const augmentations = [
  "Graphene Bone Lacings",
  "Graphene Bionic Spine Upgrade",
  "Bionic Legs",
  "Graphene Bionic Legs Upgrade",
  "TITN-41 Gene-Modification Injection",
  "Enhanced Social Interaction Implant",
  "Neuronal Densification",
  "FocusWire",
  "PC Direct-Neural Interface",
  "PC Direct-Neural Interface Optimization Submodule",
  "PC Direct-Neural Interface NeuroNet Injector",
  "ADR-V2 Pheromone Gene",
  "Hacknet Node CPU Architecture Neural-Upload",
  "Hacknet Node Cache Architecture Neural-Upload",
  "Hacknet Node NIC Architecture Neural-Upload",
  "Hacknet Node Kernel Direct-Neural Interface",
  "Hacknet Node Core Direct-Neural Interface",
  "Neurotrainer III",
  "HyperSight Corneal Implant",
  "SPTN-97 Gene Modification",
  "ECorp HVMind Implant",
  "SmartJaw",
  "Neotra",
  "nextSENS Gene Modification",
  "OmniTek InfoLoad",
  "Photosynthetic Cells",
  "Unstable Circadian Modulator",
  "Graphene BrachiBlades Upgrade",
  "Graphene Bionic Arms Upgrade",
  "Hydroflame Left Arm",
  "Golden Tongue Module",
  "The Illustrated Primer",
  "Social Dynamics Processor"
]
