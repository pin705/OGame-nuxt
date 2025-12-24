// Server utilities for game calculations
import { BuildingType, ResearchType, ShipType, PlayerRank } from '~/types/game'

// ============ Game Config Constants ============
// Game Speed Multiplier - 5x faster gameplay
export const GAME_SPEED = 5

export const GAME_CONFIG = {
  GALAXIES: 9,
  SYSTEMS_PER_GALAXY: 499,
  PLANETS_PER_SYSTEM: 15,
  
  STARTING_RESOURCES: {
    tinhThach: 2000,
    nangLuongVuTru: 1500,
    honThach: 500,
    dienNang: 0,
  },
  
  // Base production 5x faster
  BASE_PRODUCTION: {
    tinhThach: 150,
    nangLuongVuTru: 75,
    honThach: 0,
    dienNang: 0,
  },
  
  BUILD_SPEED_BASE: 5000,
  
  XP_PER_BUILD: 10,
  XP_PER_RESEARCH: 25,
  
  LEVEL_XP_BASE: 1000,
  LEVEL_XP_FACTOR: 1.5,
}

// ============ Building Base Costs ============
export const BUILDING_COSTS: Record<BuildingType, {
  baseCost: { tinhThach: number; nangLuongVuTru: number; honThach: number };
  costFactor: number;
  energyConsumption?: number;
  energyProduction?: number;
}> = {
  [BuildingType.MO_TINH_THACH]: {
    baseCost: { tinhThach: 60, nangLuongVuTru: 15, honThach: 0 },
    costFactor: 1.5,
    energyConsumption: 10,
  },
  [BuildingType.MAY_HAP_THU_NANG_LUONG]: {
    baseCost: { tinhThach: 48, nangLuongVuTru: 24, honThach: 0 },
    costFactor: 1.6,
    energyConsumption: 10,
  },
  [BuildingType.DEN_HON_THACH]: {
    baseCost: { tinhThach: 225, nangLuongVuTru: 75, honThach: 0 },
    costFactor: 1.5,
    energyConsumption: 20,
  },
  [BuildingType.LO_NANG_LUONG]: {
    baseCost: { tinhThach: 75, nangLuongVuTru: 30, honThach: 0 },
    costFactor: 1.5,
    energyProduction: 20,
  },
  [BuildingType.KHO_TINH_THACH]: {
    baseCost: { tinhThach: 1000, nangLuongVuTru: 0, honThach: 0 },
    costFactor: 2,
  },
  [BuildingType.KHO_NANG_LUONG_VU_TRU]: {
    baseCost: { tinhThach: 1000, nangLuongVuTru: 500, honThach: 0 },
    costFactor: 2,
  },
  [BuildingType.KHO_HON_THACH]: {
    baseCost: { tinhThach: 1000, nangLuongVuTru: 1000, honThach: 0 },
    costFactor: 2,
  },
  [BuildingType.TRUNG_TAM_CHI_HUY]: {
    baseCost: { tinhThach: 400, nangLuongVuTru: 200, honThach: 100 },
    costFactor: 2,
  },
  [BuildingType.XUONG_DONG_TAU]: {
    baseCost: { tinhThach: 400, nangLuongVuTru: 200, honThach: 100 },
    costFactor: 2,
  },
  [BuildingType.VIEN_NGHIEN_CUU]: {
    baseCost: { tinhThach: 200, nangLuongVuTru: 400, honThach: 200 },
    costFactor: 2,
  },
  [BuildingType.NHA_MAY_ROBOT]: {
    baseCost: { tinhThach: 400, nangLuongVuTru: 120, honThach: 200 },
    costFactor: 2,
  },
  [BuildingType.PHAO_DAI_PHONG_THU]: {
    baseCost: { tinhThach: 1000, nangLuongVuTru: 500, honThach: 0 },
    costFactor: 2,
  },
}

// ============ Calculation Functions ============

export function calculateBuildingCost(buildingType: BuildingType, targetLevel: number) {
  const config = BUILDING_COSTS[buildingType]
  const factor = Math.pow(config.costFactor, targetLevel - 1)
  
  return {
    tinhThach: Math.floor(config.baseCost.tinhThach * factor),
    nangLuongVuTru: Math.floor(config.baseCost.nangLuongVuTru * factor),
    honThach: Math.floor(config.baseCost.honThach * factor),
  }
}

export function calculateBuildingTime(
  metalCost: number,
  crystalCost: number,
  roboticsLevel: number
): number {
  // Divided by game speed for faster builds
  const time = (metalCost + crystalCost) / (GAME_CONFIG.BUILD_SPEED_BASE * (1 + roboticsLevel)) * 3600 / GAME_SPEED
  return Math.max(Math.floor(time), 1)
}

export function calculateMetalProduction(level: number): number {
  if (level === 0) return GAME_CONFIG.BASE_PRODUCTION.tinhThach
  // 5x speed multiplier
  return Math.floor(30 * level * Math.pow(1.1, level) * GAME_SPEED)
}

export function calculateCrystalProduction(level: number): number {
  if (level === 0) return GAME_CONFIG.BASE_PRODUCTION.nangLuongVuTru
  // 5x speed multiplier
  return Math.floor(20 * level * Math.pow(1.1, level) * GAME_SPEED)
}

export function calculateDeuteriumProduction(level: number, temperature: number): number {
  if (level === 0) return 0
  // 5x speed multiplier
  return Math.floor(10 * level * Math.pow(1.1, level) * (1.36 - 0.004 * temperature) * GAME_SPEED)
}

export function calculateEnergyProduction(level: number): number {
  if (level === 0) return 0
  // Energy doesn't scale with speed
  return Math.floor(20 * level * Math.pow(1.1, level))
}

export function calculateEnergyConsumption(buildingType: BuildingType, level: number): number {
  const config = BUILDING_COSTS[buildingType]
  if (!config.energyConsumption || level === 0) return 0
  return Math.floor(config.energyConsumption * level * Math.pow(1.1, level))
}

export function calculateXPForLevel(level: number): number {
  return Math.floor(GAME_CONFIG.LEVEL_XP_BASE * Math.pow(GAME_CONFIG.LEVEL_XP_FACTOR, level - 1))
}

export function getPlayerRank(level: number): PlayerRank {
  if (level >= 51) return PlayerRank.VU_TRU_CAP
  if (level >= 41) return PlayerRank.DAI_DE
  if (level >= 31) return PlayerRank.NGUYEN_SOAI
  if (level >= 21) return PlayerRank.DAI_TUONG
  if (level >= 11) return PlayerRank.CHIEN_TUONG
  return PlayerRank.CHIEN_BINH_SO_CAP
}

export function generateCoordinates(): { galaxy: number; system: number; position: number } {
  return {
    galaxy: Math.floor(Math.random() * GAME_CONFIG.GALAXIES) + 1,
    system: Math.floor(Math.random() * GAME_CONFIG.SYSTEMS_PER_GALAXY) + 1,
    position: Math.floor(Math.random() * GAME_CONFIG.PLANETS_PER_SYSTEM) + 1,
  }
}

export function generatePlanetStats() {
  const diameter = 7000 + Math.floor(Math.random() * 13000)
  const temperature = -40 + Math.floor(Math.random() * 120)
  const maxFields = Math.floor(Math.pow(diameter / 1000, 2))
  
  return { diameter, temperature, maxFields }
}
