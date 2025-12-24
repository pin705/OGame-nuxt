import { requireAuth } from '~~/server/utils/auth'
import { BuildingType, ResearchType } from '~/types/game'

export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const planetId = getRouterParam(event, 'id')

  if (!planetId) {
    throw createError({
      statusCode: 400,
      message: 'Planet ID is required',
    })
  }

  try {
    const planet = await PlanetSchema.findById(planetId)
    const player = await PlayerSchema.findById(auth.playerId)

    if (!planet) {
      throw createError({
        statusCode: 404,
        message: 'Planet not found',
      })
    }

    // Verify ownership
    if (planet.owner.toString() !== auth.playerId) {
      throw createError({
        statusCode: 403,
        message: 'Access denied',
      })
    }

    // Update resources based on time passed
    const now = new Date()
    const lastUpdate = planet.lastResourceUpdate || planet.createdAt
    const hoursPassed = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60)

    if (hoursPassed > 0) {
      // Calculate production rates
      const metalMine = planet.buildings.find((b: any) => b.type === BuildingType.MO_TINH_THACH)?.level || 0
      const crystalMine = planet.buildings.find((b: any) => b.type === BuildingType.MAY_HAP_THU_NANG_LUONG)?.level || 0
      const deutMine = planet.buildings.find((b: any) => b.type === BuildingType.DEN_HON_THACH)?.level || 0

      const metalProduction = 30 * metalMine * Math.pow(1.1, metalMine)
      const crystalProduction = 20 * crystalMine * Math.pow(1.1, crystalMine)
      const deutProduction = 10 * deutMine * Math.pow(1.1, deutMine) * (1.36 - 0.004 * planet.temperature)

      // Add resources
      planet.resources.tinhThach += metalProduction * hoursPassed
      planet.resources.nangLuongVuTru += crystalProduction * hoursPassed
      planet.resources.honThach += deutProduction * hoursPassed
      planet.lastResourceUpdate = now

      await planet.save()
    }

    // Get active build queue
    const buildQueue = await BuildQueueSchema.find({
      planet: planetId,
      status: 'IN_PROGRESS',
    }).sort({ endTime: 1 })

    // Calculate production for response
    const metalMine = planet.buildings.find((b: any) => b.type === BuildingType.MO_TINH_THACH)?.level || 0
    const crystalMine = planet.buildings.find((b: any) => b.type === BuildingType.MAY_HAP_THU_NANG_LUONG)?.level || 0
    const deutMine = planet.buildings.find((b: any) => b.type === BuildingType.DEN_HON_THACH)?.level || 0
    const solarPlant = planet.buildings.find((b: any) => b.type === BuildingType.LO_NANG_LUONG)?.level || 0

    const production = {
      tinhThach: Math.floor(30 * metalMine * Math.pow(1.1, metalMine)),
      nangLuongVuTru: Math.floor(20 * crystalMine * Math.pow(1.1, crystalMine)),
      honThach: Math.floor(10 * deutMine * Math.pow(1.1, deutMine) * (1.36 - 0.004 * planet.temperature)),
    }

    const energyProduction = Math.floor(20 * solarPlant * Math.pow(1.1, solarPlant))
    const energyConsumption = Math.floor(
      10 * metalMine * Math.pow(1.1, metalMine) +
      10 * crystalMine * Math.pow(1.1, crystalMine) +
      20 * deutMine * Math.pow(1.1, deutMine)
    )

    return {
      success: true,
      data: {
        planet: {
          id: planet._id,
          name: planet.name,
          coordinates: planet.coordinates,
          resources: {
            tinhThach: Math.floor(planet.resources.tinhThach),
            nangLuongVuTru: Math.floor(planet.resources.nangLuongVuTru),
            honThach: Math.floor(planet.resources.honThach),
            dienNang: energyProduction - energyConsumption,
            dienNangMax: energyProduction,
          },
          buildings: planet.buildings,
          ships: planet.ships,
          defenses: planet.defenses,
          temperature: planet.temperature,
          diameter: planet.diameter,
          maxFields: planet.maxFields,
          usedFields: planet.usedFields,
          isHomePlanet: planet.isHomePlanet,
        },
        // Include research from player (research is player-wide, not planet-specific)
        researches: player?.researches || [],
        production,
        energyBalance: energyProduction - energyConsumption,
        buildQueue,
      },
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('Get planet error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to get planet data',
    })
  }
})
