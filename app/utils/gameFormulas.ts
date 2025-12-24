// ========================================
// THÔN PHỆ TINH KHÔNG - Game Formulas
// ========================================

import { BUILDINGS, RESEARCHES, SHIPS, GAME_CONFIG } from '~/config/gameConfig'
import { BuildingType, ResearchType, ShipType, PlayerRank } from '~/types/game'

// ============ Resource Production ============

/**
 * Calculate metal (Tinh Thạch) production per hour
 */
export function calculateMetalProduction(mineLevel: number): number {
  if (mineLevel === 0) return GAME_CONFIG.BASE_PRODUCTION.tinhThach
  return Math.floor(30 * mineLevel * Math.pow(1.1, mineLevel))
}

/**
 * Calculate crystal (Năng Lượng Vũ Trụ) production per hour
 */
export function calculateCrystalProduction(mineLevel: number): number {
  if (mineLevel === 0) return GAME_CONFIG.BASE_PRODUCTION.nangLuongVuTru
  return Math.floor(20 * mineLevel * Math.pow(1.1, mineLevel))
}

/**
 * Calculate deuterium (Hồn Thạch) production per hour
 */
export function calculateDeuteriumProduction(synthesizerLevel: number, temperature: number): number {
  if (synthesizerLevel === 0) return 0
  return Math.floor(10 * synthesizerLevel * Math.pow(1.1, synthesizerLevel) * (1.36 - 0.004 * temperature))
}

/**
 * Calculate energy (Điện Năng) production
 */
export function calculateEnergyProduction(solarPlantLevel: number): number {
  if (solarPlantLevel === 0) return 0
  return Math.floor(20 * solarPlantLevel * Math.pow(1.1, solarPlantLevel))
}

/**
 * Calculate energy consumption for a building
 */
export function calculateEnergyConsumption(buildingType: BuildingType, level: number): number {
  const config = BUILDINGS[buildingType]
  if (!config.energyConsumption || level === 0) return 0
  return Math.floor(config.energyConsumption * level * Math.pow(1.1, level))
}

// ============ Building Costs ============

/**
 * Calculate building upgrade cost
 */
export function calculateBuildingCost(buildingType: BuildingType, targetLevel: number) {
  const config = BUILDINGS[buildingType]
  const factor = Math.pow(config.costFactor, targetLevel - 1)
  
  return {
    tinhThach: Math.floor(config.baseCost.tinhThach * factor),
    nangLuongVuTru: Math.floor(config.baseCost.nangLuongVuTru * factor),
    honThach: Math.floor(config.baseCost.honThach * factor),
  }
}

/**
 * Calculate building upgrade time in seconds
 */
export function calculateBuildingTime(
  metalCost: number,
  crystalCost: number,
  roboticsLevel: number
): number {
  const time = (metalCost + crystalCost) / (GAME_CONFIG.BUILD_SPEED_BASE * (1 + roboticsLevel)) * 3600
  return Math.max(Math.floor(time), 1) // Minimum 1 second
}

// ============ Research Costs ============

/**
 * Calculate research cost
 */
export function calculateResearchCost(researchType: ResearchType, targetLevel: number) {
  const config = RESEARCHES[researchType]
  const factor = Math.pow(config.costFactor, targetLevel - 1)
  
  return {
    tinhThach: Math.floor(config.baseCost.tinhThach * factor),
    nangLuongVuTru: Math.floor(config.baseCost.nangLuongVuTru * factor),
    honThach: Math.floor(config.baseCost.honThach * factor),
  }
}

/**
 * Calculate research time in seconds
 */
export function calculateResearchTime(
  metalCost: number,
  crystalCost: number,
  labLevel: number
): number {
  const time = (metalCost + crystalCost) / (1000 * (1 + labLevel)) * 3600
  return Math.max(Math.floor(time), 1)
}

// ============ Ship Costs ============

/**
 * Calculate ship build cost (no scaling, fixed per ship)
 */
export function calculateShipCost(shipType: ShipType, count: number = 1) {
  const config = SHIPS[shipType]
  
  return {
    tinhThach: config.cost.tinhThach * count,
    nangLuongVuTru: config.cost.nangLuongVuTru * count,
    honThach: config.cost.honThach * count,
  }
}

/**
 * Calculate ship build time in seconds
 */
export function calculateShipBuildTime(
  shipType: ShipType,
  count: number,
  shipyardLevel: number
): number {
  const config = SHIPS[shipType]
  const timePerShip = (config.cost.tinhThach + config.cost.nangLuongVuTru) / (2500 * (1 + shipyardLevel)) * 3600
  return Math.max(Math.floor(timePerShip * count), 1)
}

// ============ Storage Capacity ============

/**
 * Calculate storage capacity
 */
export function calculateStorageCapacity(storageLevel: number): number {
  if (storageLevel === 0) return GAME_CONFIG.BASE_STORAGE.tinhThach
  return Math.floor(5000 * Math.floor(2.5 * Math.exp(20 * storageLevel / 33)))
}

// ============ Player Level & Rank ============

/**
 * Calculate XP needed for next level
 */
export function calculateXPForLevel(level: number): number {
  return Math.floor(GAME_CONFIG.LEVEL_XP_BASE * Math.pow(GAME_CONFIG.LEVEL_XP_FACTOR, level - 1))
}

/**
 * Get player rank based on level
 */
export function getPlayerRank(level: number): PlayerRank {
  if (level >= 51) return PlayerRank.VU_TRU_CAP
  if (level >= 41) return PlayerRank.DAI_DE
  if (level >= 31) return PlayerRank.NGUYEN_SOAI
  if (level >= 21) return PlayerRank.DAI_TUONG
  if (level >= 11) return PlayerRank.CHIEN_TUONG
  return PlayerRank.CHIEN_BINH_SO_CAP
}

// ============ Fleet Calculations ============

/**
 * Calculate fleet travel time
 */
export function calculateFleetTravelTime(
  distance: number,
  slowestSpeed: number,
  speedPercentage: number = 100
): number {
  return Math.round(((35000 / speedPercentage) * Math.sqrt(distance * 10 / slowestSpeed)) + 10)
}

/**
 * Calculate distance between two coordinates
 */
export function calculateDistance(
  origin: { galaxy: number; system: number; position: number },
  destination: { galaxy: number; system: number; position: number }
): number {
  if (origin.galaxy !== destination.galaxy) {
    return Math.abs(origin.galaxy - destination.galaxy) * 20000
  }
  if (origin.system !== destination.system) {
    return Math.abs(origin.system - destination.system) * 95 + 2700
  }
  if (origin.position !== destination.position) {
    return Math.abs(origin.position - destination.position) * 5 + 1000
  }
  return 5
}

/**
 * Calculate fuel consumption for fleet
 */
export function calculateFuelConsumption(
  ships: { type: ShipType; count: number }[],
  distance: number,
  travelTime: number
): number {
  let totalConsumption = 0
  
  for (const ship of ships) {
    const config = SHIPS[ship.type]
    const consumption = config.stats.fuelConsumption * ship.count
    totalConsumption += consumption
  }
  
  return Math.floor(totalConsumption * distance / 35000 + 1)
}

// ============ Combat Calculations ============

/**
 * Calculate total fleet combat power
 */
export function calculateFleetPower(
  ships: { type: ShipType; count: number }[],
  weaponTechLevel: number = 0,
  armorTechLevel: number = 0,
  shieldTechLevel: number = 0
): { attack: number; defense: number; shield: number } {
  let totalAttack = 0
  let totalDefense = 0
  let totalShield = 0
  
  for (const ship of ships) {
    const config = SHIPS[ship.type]
    totalAttack += config.stats.attack * ship.count
    totalDefense += config.stats.defense * ship.count
    totalShield += config.stats.shield * ship.count
  }
  
  // Apply tech bonuses (10% per level)
  totalAttack *= (1 + 0.1 * weaponTechLevel)
  totalDefense *= (1 + 0.1 * armorTechLevel)
  totalShield *= (1 + 0.1 * shieldTechLevel)
  
  return {
    attack: Math.floor(totalAttack),
    defense: Math.floor(totalDefense),
    shield: Math.floor(totalShield),
  }
}

// ============ Utility Functions ============

/**
 * Format number with separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('vi-VN').format(Math.floor(num))
}

/**
 * Format time duration
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  const parts = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`)
  
  return parts.join(' ')
}

/**
 * Format coordinates
 */
export function formatCoordinates(coords: { galaxy: number; system: number; position: number }): string {
  return `[${coords.galaxy}:${coords.system}:${coords.position}]`
}
