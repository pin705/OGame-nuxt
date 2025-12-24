// ========================================
// THÔN PHỆ TINH KHÔNG - Combat System
// ========================================

// Ship combat stats
export const SHIP_STATS: Record<string, {
  attack: number
  defense: number
  shield: number
  hull: number
  rapidFire?: Record<string, number>
}> = {
  TIEU_CHIEN_HAM: { 
    attack: 50, defense: 10, shield: 10, hull: 400,
    rapidFire: { TAU_DO_THAM: 5, VAN_TAI_NHO: 3 }
  },
  TRUNG_CHIEN_HAM: { 
    attack: 150, defense: 25, shield: 25, hull: 1000,
    rapidFire: { TIEU_CHIEN_HAM: 4, TAU_DO_THAM: 5 }
  },
  TUAN_DUONG_HAM: { 
    attack: 400, defense: 50, shield: 50, hull: 2700,
    rapidFire: { TIEU_CHIEN_HAM: 6, TRUNG_CHIEN_HAM: 4, TAU_DO_THAM: 5 }
  },
  THIET_GIAP_HAM: { 
    attack: 1000, defense: 200, shield: 200, hull: 6000,
    rapidFire: { TAU_DO_THAM: 5 }
  },
  HAC_LONG_HAM: { 
    attack: 700, defense: 400, shield: 400, hull: 7000,
    rapidFire: { TIEU_CHIEN_HAM: 4, TRUNG_CHIEN_HAM: 3, TUAN_DUONG_HAM: 2, TAU_DO_THAM: 5 }
  },
  VAN_TAI_NHO: { attack: 5, defense: 5, shield: 10, hull: 400 },
  VAN_TAI_LON: { attack: 5, defense: 25, shield: 25, hull: 1200 },
  TAU_THUOC_DIA: { attack: 50, defense: 100, shield: 100, hull: 3000 },
  TAU_DO_THAM: { attack: 0, defense: 0, shield: 0, hull: 100 },
  TAU_TAI_CHE: { attack: 1, defense: 10, shield: 10, hull: 1600 },
  MAU_HAM: { attack: 200, defense: 100, shield: 100, hull: 14000 },
  DA_DE_HAM: { 
    attack: 2000, defense: 500, shield: 500, hull: 11000,
    rapidFire: { TIEU_CHIEN_HAM: 8, TRUNG_CHIEN_HAM: 6, TUAN_DUONG_HAM: 5, HAC_LONG_HAM: 4, TAU_DO_THAM: 5 }
  },
  TU_THAN_TINH: { 
    attack: 200000, defense: 50000, shield: 50000, hull: 900000,
    rapidFire: {
      TIEU_CHIEN_HAM: 200, TRUNG_CHIEN_HAM: 100, TUAN_DUONG_HAM: 33,
      THIET_GIAP_HAM: 30, HAC_LONG_HAM: 15, DA_DE_HAM: 5,
      VAN_TAI_NHO: 250, VAN_TAI_LON: 250, TAU_TAI_CHE: 250,
      TAU_DO_THAM: 1250, TAU_THUOC_DIA: 250
    }
  },
}

// Defense stats
export const DEFENSE_STATS: Record<string, {
  attack: number
  defense: number
  shield: number
  hull: number
}> = {
  TEN_LUA: { attack: 80, defense: 20, shield: 20, hull: 200 },
  PHAO_LASER_NHE: { attack: 100, defense: 25, shield: 25, hull: 200 },
  PHAO_LASER_NANG: { attack: 250, defense: 100, shield: 100, hull: 800 },
  PHAO_GAUSS: { attack: 1100, defense: 200, shield: 200, hull: 3500 },
  PHAO_ION: { attack: 150, defense: 500, shield: 500, hull: 800 },
  PHAO_PLASMA: { attack: 3000, defense: 300, shield: 300, hull: 10000 },
  KHIEN_NHO: { attack: 1, defense: 2000, shield: 2000, hull: 2000 },
  KHIEN_LON: { attack: 1, defense: 10000, shield: 10000, hull: 10000 },
}

export interface CombatUnit {
  type: string
  count: number
  attack: number
  defense: number
  shield: number
  hull: number
  isDefense?: boolean
}

export interface BattleResult {
  attackerWins: boolean
  defenderWins: boolean
  draw: boolean
  attackerLosses: { type: string; lost: number; remaining: number }[]
  defenderLosses: { type: string; lost: number; remaining: number }[]
  debrisField: { tinhThach: number; nangLuongVuTru: number }
  rounds: number
  loot: { tinhThach: number; nangLuongVuTru: number; honThach: number }
}

// Calculate technology bonuses
export function applyTechBonuses(
  units: CombatUnit[],
  weaponTech: number,
  armorTech: number,
  shieldTech: number
): CombatUnit[] {
  return units.map(unit => ({
    ...unit,
    attack: Math.floor(unit.attack * (1 + weaponTech * 0.1)),
    defense: Math.floor(unit.defense * (1 + armorTech * 0.1)),
    shield: Math.floor(unit.shield * (1 + shieldTech * 0.1)),
  }))
}

// Simulate one round of combat
function simulateRound(
  attackers: CombatUnit[],
  defenders: CombatUnit[]
): { attackers: CombatUnit[]; defenders: CombatUnit[] } {
  // Attackers fire at defenders
  let remainingDefenders = [...defenders]
  for (const attacker of attackers) {
    if (attacker.count <= 0) continue
    
    for (let i = 0; i < attacker.count; i++) {
      // Pick random target
      const aliveDefenders = remainingDefenders.filter(d => d.count > 0)
      if (aliveDefenders.length === 0) break
      
      const targetIdx = Math.floor(Math.random() * aliveDefenders.length)
      const target = aliveDefenders[targetIdx]
      
      // Calculate damage
      const damage = attacker.attack
      const shieldAbsorb = Math.min(damage, target.shield)
      const hullDamage = Math.max(0, damage - shieldAbsorb)
      
      // Chance to destroy based on hull damage
      if (hullDamage >= target.hull * 0.3) {
        const destroyChance = hullDamage / target.hull
        if (Math.random() < destroyChance) {
          target.count--
        }
      }
      
      // Check for rapid fire
      const rapidFire = SHIP_STATS[attacker.type]?.rapidFire?.[target.type]
      if (rapidFire && Math.random() < (1 - 1/rapidFire)) {
        i-- // Fire again
      }
    }
  }
  
  // Defenders fire at attackers
  let remainingAttackers = [...attackers]
  for (const defender of remainingDefenders) {
    if (defender.count <= 0) continue
    
    for (let i = 0; i < defender.count; i++) {
      const aliveAttackers = remainingAttackers.filter(a => a.count > 0)
      if (aliveAttackers.length === 0) break
      
      const targetIdx = Math.floor(Math.random() * aliveAttackers.length)
      const target = aliveAttackers[targetIdx]
      
      const damage = defender.attack
      const shieldAbsorb = Math.min(damage, target.shield)
      const hullDamage = Math.max(0, damage - shieldAbsorb)
      
      if (hullDamage >= target.hull * 0.3) {
        const destroyChance = hullDamage / target.hull
        if (Math.random() < destroyChance) {
          target.count--
        }
      }
    }
  }
  
  return {
    attackers: remainingAttackers,
    defenders: remainingDefenders,
  }
}

// Main combat simulation
export function simulateBattle(
  attackerShips: { type: string; count: number }[],
  defenderShips: { type: string; count: number }[],
  defenderDefenses: { type: string; count: number }[],
  attackerTech: { weapon: number; armor: number; shield: number },
  defenderTech: { weapon: number; armor: number; shield: number },
  defenderResources: { tinhThach: number; nangLuongVuTru: number; honThach: number }
): BattleResult {
  // Convert ships to combat units
  let attackers: CombatUnit[] = attackerShips.map(ship => ({
    type: ship.type,
    count: ship.count,
    attack: SHIP_STATS[ship.type]?.attack || 0,
    defense: SHIP_STATS[ship.type]?.defense || 0,
    shield: SHIP_STATS[ship.type]?.shield || 0,
    hull: SHIP_STATS[ship.type]?.hull || 100,
  }))

  let defenders: CombatUnit[] = [
    ...defenderShips.map(ship => ({
      type: ship.type,
      count: ship.count,
      attack: SHIP_STATS[ship.type]?.attack || 0,
      defense: SHIP_STATS[ship.type]?.defense || 0,
      shield: SHIP_STATS[ship.type]?.shield || 0,
      hull: SHIP_STATS[ship.type]?.hull || 100,
    })),
    ...defenderDefenses.map(defense => ({
      type: defense.type,
      count: defense.count,
      attack: DEFENSE_STATS[defense.type]?.attack || 0,
      defense: DEFENSE_STATS[defense.type]?.defense || 0,
      shield: DEFENSE_STATS[defense.type]?.shield || 0,
      hull: DEFENSE_STATS[defense.type]?.hull || 100,
      isDefense: true,
    })),
  ]

  // Apply tech bonuses
  attackers = applyTechBonuses(attackers, attackerTech.weapon, attackerTech.armor, attackerTech.shield)
  defenders = applyTechBonuses(defenders, defenderTech.weapon, defenderTech.armor, defenderTech.shield)

  // Store initial counts
  const initialAttackers = attackers.map(a => ({ type: a.type, count: a.count }))
  const initialDefenders = defenders.map(d => ({ type: d.type, count: d.count }))

  // Run battle (max 6 rounds)
  let rounds = 0
  const maxRounds = 6
  
  while (rounds < maxRounds) {
    rounds++
    
    const result = simulateRound(attackers, defenders)
    attackers = result.attackers
    defenders = result.defenders
    
    // Check if battle is over
    const attackersAlive = attackers.some(a => a.count > 0)
    const defendersAlive = defenders.some(d => d.count > 0)
    
    if (!attackersAlive || !defendersAlive) break
  }

  // Calculate results
  const attackersRemaining = attackers.filter(a => a.count > 0)
  const defendersRemaining = defenders.filter(d => d.count > 0)
  
  const attackerWins = attackersRemaining.length > 0 && defendersRemaining.length === 0
  const defenderWins = defendersRemaining.length > 0 && attackersRemaining.length === 0
  const draw = !attackerWins && !defenderWins

  // Calculate losses
  const attackerLosses = initialAttackers.map(init => {
    const remaining = attackers.find(a => a.type === init.type)?.count || 0
    return {
      type: init.type,
      lost: init.count - remaining,
      remaining,
    }
  })

  const defenderLosses = initialDefenders.map(init => {
    const remaining = defenders.find(d => d.type === init.type)?.count || 0
    return {
      type: init.type,
      lost: init.count - remaining,
      remaining,
    }
  })

  // Calculate debris field (30% of metal/crystal from destroyed ships)
  let debrisField = { tinhThach: 0, nangLuongVuTru: 0 }
  // TODO: Add proper debris calculation based on ship costs

  // Calculate loot (attacker wins = can take up to 50% of resources)
  let loot = { tinhThach: 0, nangLuongVuTru: 0, honThach: 0 }
  if (attackerWins) {
    // Calculate cargo capacity
    let cargoCapacity = 0
    for (const ship of attackersRemaining) {
      if (ship.type === 'VAN_TAI_NHO') cargoCapacity += ship.count * 5000
      else if (ship.type === 'VAN_TAI_LON') cargoCapacity += ship.count * 25000
      else if (ship.type === 'HAC_LONG_HAM') cargoCapacity += ship.count * 750
      // Add other ships' cargo capacity as needed
    }

    const maxLoot = {
      tinhThach: defenderResources.tinhThach * 0.5,
      nangLuongVuTru: defenderResources.nangLuongVuTru * 0.5,
      honThach: defenderResources.honThach * 0.5,
    }

    const totalMaxLoot = maxLoot.tinhThach + maxLoot.nangLuongVuTru + maxLoot.honThach
    const lootRatio = Math.min(1, cargoCapacity / totalMaxLoot)

    loot = {
      tinhThach: Math.floor(maxLoot.tinhThach * lootRatio),
      nangLuongVuTru: Math.floor(maxLoot.nangLuongVuTru * lootRatio),
      honThach: Math.floor(maxLoot.honThach * lootRatio),
    }
  }

  return {
    attackerWins,
    defenderWins,
    draw,
    attackerLosses,
    defenderLosses,
    debrisField,
    rounds,
    loot,
  }
}
