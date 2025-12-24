import { BuildingType } from '~/types/game'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { planetId, buildingType, playerId } = body

  // Validate input
  if (!planetId || !buildingType || !playerId) {
    throw createError({
      statusCode: 400,
      message: 'Planet ID, building type, and player ID are required',
    })
  }

  // Validate building type
  if (!Object.values(BuildingType).includes(buildingType)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid building type',
    })
  }

  try {
    // Get planet
    const planet = await PlanetSchema.findById(planetId)
    if (!planet) {
      throw createError({
        statusCode: 404,
        message: 'Planet not found',
      })
    }

    // Verify ownership
    if (planet.owner.toString() !== playerId) {
      throw createError({
        statusCode: 403,
        message: 'You do not own this planet',
      })
    }

    // Check if there's already a building in progress
    const existingBuild = await BuildQueueSchema.findOne({
      planet: planetId,
      queueType: 'BUILDING',
      status: 'IN_PROGRESS',
    })

    if (existingBuild) {
      throw createError({
        statusCode: 409,
        message: 'A building upgrade is already in progress',
      })
    }

    // Get current building level
    const buildingIndex = planet.buildings.findIndex((b: any) => b.type === buildingType)
    const currentLevel = buildingIndex >= 0 ? planet.buildings[buildingIndex].level : 0
    const targetLevel = currentLevel + 1

    // Calculate cost
    const cost = calculateBuildingCost(buildingType, targetLevel)

    // Check resources
    if (
      planet.resources.tinhThach < cost.tinhThach ||
      planet.resources.nangLuongVuTru < cost.nangLuongVuTru ||
      planet.resources.honThach < cost.honThach
    ) {
      throw createError({
        statusCode: 400,
        message: 'Insufficient resources',
      })
    }

    // Check fields
    if (planet.usedFields >= planet.maxFields) {
      throw createError({
        statusCode: 400,
        message: 'No available building slots',
      })
    }

    // Get robotics level for build time
    const roboticsBuilding = planet.buildings.find(
      (b: any) => b.type === BuildingType.NHA_MAY_ROBOT
    )
    const roboticsLevel = roboticsBuilding?.level || 0

    // Calculate build time
    const buildTimeSeconds = calculateBuildingTime(
      cost.tinhThach,
      cost.nangLuongVuTru,
      roboticsLevel
    )

    // Deduct resources
    planet.resources.tinhThach -= cost.tinhThach
    planet.resources.nangLuongVuTru -= cost.nangLuongVuTru
    planet.resources.honThach -= cost.honThach

    // Update building status
    if (buildingIndex >= 0) {
      planet.buildings[buildingIndex].isUpgrading = true
      planet.buildings[buildingIndex].upgradeEndTime = new Date(
        Date.now() + buildTimeSeconds * 1000
      )
    } else {
      planet.buildings.push({
        type: buildingType,
        level: 0,
        isUpgrading: true,
        upgradeEndTime: new Date(Date.now() + buildTimeSeconds * 1000),
      })
    }

    await planet.save()

    // Create build queue entry
    const buildQueue = await BuildQueueSchema.create({
      planet: planetId,
      player: playerId,
      queueType: 'BUILDING',
      itemType: buildingType,
      targetLevel,
      startTime: new Date(),
      endTime: new Date(Date.now() + buildTimeSeconds * 1000),
      status: 'IN_PROGRESS',
    })

    return {
      success: true,
      message: `Started upgrading to level ${targetLevel}`,
      data: {
        buildQueue: {
          id: buildQueue._id,
          buildingType,
          targetLevel,
          startTime: buildQueue.startTime,
          endTime: buildQueue.endTime,
          buildTimeSeconds,
        },
        remainingResources: {
          tinhThach: planet.resources.tinhThach,
          nangLuongVuTru: planet.resources.nangLuongVuTru,
          honThach: planet.resources.honThach,
        },
      },
    }
  } catch (error: any) {
    if (error.statusCode) throw error

    console.error('Building upgrade error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to start building upgrade',
    })
  }
})
