import { BUILDINGS, RESEARCHES, SHIPS, DEFENSES } from '~/config/gameConfig'
import { PlayerSchema } from '~/server/models/player.schema'
import { PlanetSchema } from '~/server/models/planet.schema'

// Calculate total cost of a building/research up to a certain level
function calculateTotalCost(baseCost: { tinhThach: number, nangLuongVuTru: number, honThach: number }, costFactor: number, level: number) {
  if (level <= 0) return 0
  
  // Geometric series sum: a * (1 - r^n) / (1 - r)
  // But the formula for level L cost is base * factor^(L-1)
  // So sum is base * (1 + factor + ... + factor^(L-1))
  // = base * (factor^L - 1) / (factor - 1)
  
  const totalTinhThach = Math.floor(baseCost.tinhThach * (Math.pow(costFactor, level) - 1) / (costFactor - 1))
  const totalNangLuong = Math.floor(baseCost.nangLuongVuTru * (Math.pow(costFactor, level) - 1) / (costFactor - 1))
  const totalHonThach = Math.floor(baseCost.honThach * (Math.pow(costFactor, level) - 1) / (costFactor - 1))
  
  return totalTinhThach + totalNangLuong + totalHonThach
}

export async function calculatePlayerPoints(playerId: string) {
  const player = await PlayerSchema.findById(playerId)
  if (!player) return 0

  let totalResourcesSpent = 0

  // 1. Research Points
  if (player.researches) {
    for (const research of player.researches) {
      const config = RESEARCHES[research.type as keyof typeof RESEARCHES]
      if (config) {
        totalResourcesSpent += calculateTotalCost(config.baseCost, config.costFactor, research.level)
      }
    }
  }

  // 2. Planet Points (Buildings, Ships, Defenses)
  const planets = await PlanetSchema.find({ owner: playerId })
  
  for (const planet of planets) {
    // Buildings
    if (planet.buildings) {
      for (const building of planet.buildings) {
        const config = BUILDINGS[building.type as keyof typeof BUILDINGS]
        if (config) {
          totalResourcesSpent += calculateTotalCost(config.baseCost, config.costFactor, building.level)
        }
      }
    }

    // Ships
    if (planet.ships) {
      for (const ship of planet.ships) {
        const config = SHIPS[ship.type as keyof typeof SHIPS]
        if (config) {
          const unitCost = config.cost.tinhThach + config.cost.nangLuongVuTru + config.cost.honThach
          totalResourcesSpent += unitCost * ship.count
        }
      }
    }

    // Defenses
    if (planet.defenses) {
      for (const defense of planet.defenses) {
        const config = DEFENSES[defense.type as keyof typeof DEFENSES]
        if (config) {
          const unitCost = config.cost.tinhThach + config.cost.nangLuongVuTru + config.cost.honThach
          totalResourcesSpent += unitCost * defense.count
        }
      }
    }
  }

  // 1000 resources = 1 point
  const points = Math.floor(totalResourcesSpent / 1000)
  
  // Update player points
  player.points = points
  await player.save()

  return points
}

export async function updateAllPlayersPoints() {
  const players = await PlayerSchema.find({}, '_id')
  for (const p of players) {
    await calculatePlayerPoints(p._id.toString())
  }
}
