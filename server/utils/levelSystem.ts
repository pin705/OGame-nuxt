/**
 * Player Level System
 * Experience and leveling mechanics for Thôn Phệ Tinh Không
 */

// Experience required for each level (cumulative)
// Level 1: 0 XP, Level 2: 100 XP, Level 3: 250 XP, etc.
// Uses formula: XP_needed = 50 * level^2 + 50 * level

const LEVEL_CAP = 100

export function calculateXpForLevel(level: number): number {
  if (level <= 1) return 0
  return 50 * level * level + 50 * level
}

export function calculateTotalXpForLevel(level: number): number {
  // Sum of XP needed from level 1 to target level
  if (level <= 1) return 0
  let total = 0
  for (let i = 2; i <= level; i++) {
    total += calculateXpForLevel(i)
  }
  return total
}

export function getLevelFromXp(totalXp: number): number {
  let level = 1
  let xpAccum = 0
  
  while (level < LEVEL_CAP) {
    const xpNeeded = calculateXpForLevel(level + 1)
    if (xpAccum + xpNeeded > totalXp) break
    xpAccum += xpNeeded
    level++
  }
  
  return level
}

export function getXpProgress(totalXp: number): { currentLevel: number; xpInLevel: number; xpForNextLevel: number; progress: number } {
  const currentLevel = getLevelFromXp(totalXp)
  const xpForCurrentLevel = calculateTotalXpForLevel(currentLevel)
  const xpForNextLevel = calculateXpForLevel(currentLevel + 1)
  const xpInLevel = totalXp - xpForCurrentLevel
  const progress = xpForNextLevel > 0 ? (xpInLevel / xpForNextLevel) * 100 : 100
  
  return {
    currentLevel,
    xpInLevel,
    xpForNextLevel,
    progress: Math.min(progress, 100),
  }
}

export function getRankFromLevel(level: number): string {
  if (level >= 51) return 'VU_TRU_CAP'
  if (level >= 41) return 'DAI_DE'
  if (level >= 31) return 'NGUYEN_SOAI'
  if (level >= 21) return 'DAI_TUONG'
  if (level >= 11) return 'CHIEN_TUONG'
  return 'CHIEN_BINH_SO_CAP'
}

export function getRankName(rank: string): string {
  const names: Record<string, string> = {
    'CHIEN_BINH_SO_CAP': 'Chiến Binh Sơ Cấp',
    'CHIEN_TUONG': 'Chiến Tướng',
    'DAI_TUONG': 'Đại Tướng',
    'NGUYEN_SOAI': 'Nguyên Soái',
    'DAI_DE': 'Đại Đế',
    'VU_TRU_CAP': 'Vũ Trụ Cấp',
  }
  return names[rank] || rank
}

// XP rewards for different actions
export const XP_REWARDS = {
  // Buildings: base XP * building level
  BUILDING_COMPLETE: (level: number) => Math.floor(10 * level + 5 * level * level),
  
  // Research: slightly more than buildings
  RESEARCH_COMPLETE: (level: number) => Math.floor(15 * level + 8 * level * level),
  
  // Ships: XP per ship based on resource cost
  SHIP_BUILD: (resourceCost: number) => Math.floor(resourceCost / 500),
  
  // Battles: based on combat outcome
  BATTLE_WIN: (fleetStrength: number) => Math.floor(fleetStrength / 100),
  BATTLE_LOSS: () => 10, // Small consolation XP
  
  // Exploration
  EXPEDITION_COMPLETE: () => 50,
  EXPEDITION_DISCOVERY: () => 200,
  
  // Colony
  NEW_COLONY: () => 500,
  
  // Alliance
  JOIN_ALLIANCE: () => 100,
  CREATE_ALLIANCE: () => 300,
}

/**
 * Award experience to a player and handle level up
 */
export async function awardExperience(playerId: string, xpAmount: number): Promise<{
  previousLevel: number
  newLevel: number
  leveledUp: boolean
  totalXp: number
  newRank?: string
}> {
  // Dynamic import to avoid circular dependency
  const player = await PlayerSchema.findById(playerId)
  if (!player) {
    throw new Error('Player not found')
  }
  
  const previousLevel = player.level
  const previousRank = player.rank
  const newTotalXp = (player.experience || 0) + xpAmount
  const newLevel = getLevelFromXp(newTotalXp)
  const newRank = getRankFromLevel(newLevel)
  
  // Update player
  player.experience = newTotalXp
  player.level = newLevel
  
  if (newRank !== previousRank) {
    player.rank = newRank
  }
  
  await player.save()
  
  return {
    previousLevel,
    newLevel,
    leveledUp: newLevel > previousLevel,
    totalXp: newTotalXp,
    newRank: newRank !== previousRank ? newRank : undefined,
  }
}
