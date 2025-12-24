import { BuildingType } from '~/types/game'

export default defineEventHandler(async (event) => {
  const planetId = getRouterParam(event, 'id')

  if (!planetId) {
    throw createError({
      statusCode: 400,
      message: 'Planet ID is required',
    })
  }

  try {
    const planet = await PlanetSchema.findById(planetId)

    if (!planet) {
      throw createError({
        statusCode: 404,
        message: 'Planet not found',
      })
    }

    // Calculate and update resources based on time passed
    const now = new Date()
    const lastUpdate = new Date(planet.lastResourceUpdate)
    const hoursPassed = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60)

    if (hoursPassed > 0.01) { // At least ~36 seconds
      // Get building levels
      const getBuildingLevel = (type: BuildingType) => {
        const building = planet.buildings.find((b: any) => b.type === type)
        return building?.level || 0
      }

      const metalMineLevel = getBuildingLevel(BuildingType.MO_TINH_THACH)
      const crystalMineLevel = getBuildingLevel(BuildingType.MAY_HAP_THU_NANG_LUONG)
      const deutMineLevel = getBuildingLevel(BuildingType.DEN_HON_THACH)
      const solarPlantLevel = getBuildingLevel(BuildingType.LO_NANG_LUONG)

      // Calculate production rates (per hour)
      const metalProduction = calculateMetalProduction(metalMineLevel)
      const crystalProduction = calculateCrystalProduction(crystalMineLevel)
      const deuteriumProduction = calculateDeuteriumProduction(deutMineLevel, planet.temperature)
      
      // Calculate energy
      const energyProduction = calculateEnergyProduction(solarPlantLevel)
      const energyConsumption = 
        calculateEnergyConsumption(BuildingType.MO_TINH_THACH, metalMineLevel) +
        calculateEnergyConsumption(BuildingType.MAY_HAP_THU_NANG_LUONG, crystalMineLevel) +
        calculateEnergyConsumption(BuildingType.DEN_HON_THACH, deutMineLevel)

      // Energy efficiency factor (if not enough energy, production is reduced)
      const energyFactor = energyConsumption > 0 
        ? Math.min(1, energyProduction / energyConsumption)
        : 1

      // Add produced resources
      planet.resources.tinhThach += Math.floor(metalProduction * hoursPassed * energyFactor)
      planet.resources.nangLuongVuTru += Math.floor(crystalProduction * hoursPassed * energyFactor)
      planet.resources.honThach += Math.floor(deuteriumProduction * hoursPassed * energyFactor)
      planet.resources.dienNang = energyProduction - energyConsumption

      planet.lastResourceUpdate = now
      await planet.save()
    }

    // Calculate current production for response
    const getBuildingLevel = (type: BuildingType) => {
      const building = planet.buildings.find((b: any) => b.type === type)
      return building?.level || 0
    }

    const production = {
      tinhThach: calculateMetalProduction(getBuildingLevel(BuildingType.MO_TINH_THACH)),
      nangLuongVuTru: calculateCrystalProduction(getBuildingLevel(BuildingType.MAY_HAP_THU_NANG_LUONG)),
      honThach: calculateDeuteriumProduction(
        getBuildingLevel(BuildingType.DEN_HON_THACH),
        planet.temperature
      ),
      dienNang: calculateEnergyProduction(getBuildingLevel(BuildingType.LO_NANG_LUONG)),
    }

    return {
      success: true,
      data: {
        planet: {
          id: planet._id,
          name: planet.name,
          coordinates: planet.coordinates,
          resources: planet.resources,
          buildings: planet.buildings,
          ships: planet.ships,
          defenses: planet.defenses,
          temperature: planet.temperature,
          diameter: planet.diameter,
          maxFields: planet.maxFields,
          usedFields: planet.usedFields,
          isHomePlanet: planet.isHomePlanet,
        },
        production,
      },
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    
    console.error('Get planet error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to fetch planet data',
    })
  }
})
