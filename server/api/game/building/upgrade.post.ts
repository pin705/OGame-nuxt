import { requireAuth } from '~~/server/utils/auth'
import { BUILDINGS } from '~/config/gameConfig'
import { checkRequirements } from '~~/server/utils/techTree'
import { BuildingType } from '~/types/game'

export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const body = await readBody(event)
  const { planetId, buildingType } = body

  if (!planetId || !buildingType) {
    throw createError({
      statusCode: 400,
      message: 'Planet ID and building type are required',
    })
  }

  if (!BUILDINGS[buildingType as BuildingType]) {
    throw createError({
      statusCode: 400,
      message: 'Invalid building type',
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

    if (planet.owner.toString() !== auth.playerId) {
      throw createError({
        statusCode: 403,
        message: 'Access denied',
      })
    }

    // Fetch player for requirements check
    const player = await PlayerSchema.findById(auth.playerId)
    if (!player) {
      throw createError({
        statusCode: 404,
        message: 'Player not found',
      })
    }

    // Check requirements
    const config = BUILDINGS[buildingType as BuildingType]
    const reqCheck = checkRequirements(config.requirements, planet, player)
    if (!reqCheck.met) {
      throw createError({
        statusCode: 400,
        message: `Chưa đủ điều kiện: ${reqCheck.missing.join(', ')}`,
      })
    }

    // Check if already building
    const existingBuild = await BuildQueueSchema.findOne({
      planet: planetId,
      queueType: 'BUILDING',
      status: 'IN_PROGRESS',
    })

    if (existingBuild) {
      throw createError({
        statusCode: 409,
        message: 'A building is already being upgraded',
      })
    }

    // Get current level
    const buildingIndex = planet.buildings.findIndex((b: any) => b.type === buildingType)
    const currentLevel = buildingIndex >= 0 ? planet.buildings[buildingIndex].level : 0
    const targetLevel = currentLevel + 1

    // Calculate cost
    const cost = {
      tinhThach: Math.floor(config.baseCost.tinhThach * Math.pow(config.costFactor, targetLevel - 1)),
      nangLuongVuTru: Math.floor(config.baseCost.nangLuongVuTru * Math.pow(config.costFactor, targetLevel - 1)),
      honThach: Math.floor(config.baseCost.honThach * Math.pow(config.costFactor, targetLevel - 1)),
    }

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

    // Calculate build time
    const roboticsLevel = planet.buildings.find((b: any) => b.type === BuildingType.NHA_MAY_ROBOT)?.level || 0
    const buildTimeSeconds = Math.floor(
      ((cost.tinhThach + cost.nangLuongVuTru) / (2500 * (1 + roboticsLevel))) * 3600
    )

    // Deduct resources
    planet.resources.tinhThach -= cost.tinhThach
    planet.resources.nangLuongVuTru -= cost.nangLuongVuTru
    planet.resources.honThach -= cost.honThach
    await planet.save()

    // Create build queue entry
    const now = new Date()
    const endTime = new Date(now.getTime() + buildTimeSeconds * 1000)

    const buildQueue = await BuildQueueSchema.create({
      planet: planetId,
      player: auth.playerId,
      queueType: 'BUILDING',
      itemType: buildingType,
      targetLevel: targetLevel,
      startTime: now,
      endTime,
      status: 'IN_PROGRESS',
    })

    return {
      success: true,
      message: 'Building upgrade started',
      data: {
        buildQueue: {
          id: buildQueue._id,
          buildingType,
          level: targetLevel,
          startTime: now,
          endTime,
          remainingSeconds: buildTimeSeconds,
        },
        cost,
        newResources: {
          tinhThach: Math.floor(planet.resources.tinhThach),
          nangLuongVuTru: Math.floor(planet.resources.nangLuongVuTru),
          honThach: Math.floor(planet.resources.honThach),
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
