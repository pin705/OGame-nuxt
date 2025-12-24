import { requireAuth } from '~~/server/utils/auth'
import { SHIPS } from '~/config/gameConfig'
import { checkRequirements } from '~~/server/utils/techTree'
import { ShipType } from '~/types/game'



export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const body = await readBody(event)
  const { planetId, shipType, count = 1 } = body

  if (!planetId || !shipType) {
    throw createError({
      statusCode: 400,
      message: 'Planet ID and ship type are required',
    })
  }

  if (!SHIPS[shipType as ShipType]) {
    throw createError({
      statusCode: 400,
      message: 'Invalid ship type',
    })
  }

  if (count < 1 || count > 9999) {
    throw createError({
      statusCode: 400,
      message: 'Invalid ship count (1-9999)',
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

    // Check shipyard requirement
    const shipyard = planet.buildings.find((b: any) => b.type === 'XUONG_DONG_TAU')
    const shipyardLevel = shipyard?.level || 0
    if (!shipyard || shipyardLevel < 1) {
      throw createError({
        statusCode: 400,
        message: 'Shipyard is required',
      })
    }

    // Get player for requirements check
    const player = await PlayerSchema.findById(auth.playerId)
    if (!player) {
      throw createError({
        statusCode: 404,
        message: 'Player not found',
      })
    }

    // Check requirements
    const config = SHIPS[shipType as ShipType]
    const reqCheck = checkRequirements(config.requirements, planet, player)
    if (!reqCheck.met) {
      throw createError({
        statusCode: 400,
        message: `Chưa đủ điều kiện: ${reqCheck.missing.join(', ')}`,
      })
    }

    // Calculate total cost
    const totalCost = {
      tinhThach: config.cost.tinhThach * count,
      nangLuongVuTru: config.cost.nangLuongVuTru * count,
      honThach: config.cost.honThach * count,
    }

    // Check resources
    if (
      planet.resources.tinhThach < totalCost.tinhThach ||
      planet.resources.nangLuongVuTru < totalCost.nangLuongVuTru ||
      planet.resources.honThach < totalCost.honThach
    ) {
      throw createError({
        statusCode: 400,
        message: 'Insufficient resources',
      })
    }

    // Calculate build time (reduced by shipyard and robot factory levels)
    const robotFactory = planet.buildings.find((b: any) => b.type === 'NHA_MAY_ROBOT')
    const robotLevel = robotFactory?.level || 0
    
    const buildTimePerUnit = Math.floor(
      config.buildTime / (1 + shipyardLevel) / (1 + robotLevel)
    )
    const totalBuildTime = buildTimePerUnit * count

    // Deduct resources
    planet.resources.tinhThach -= totalCost.tinhThach
    planet.resources.nangLuongVuTru -= totalCost.nangLuongVuTru
    planet.resources.honThach -= totalCost.honThach
    await planet.save()

    // Create build queue entry
    const now = new Date()
    const endTime = new Date(now.getTime() + totalBuildTime * 1000)

    const buildQueue = await BuildQueueSchema.create({
      planet: planetId,
      player: auth.playerId,
      queueType: 'SHIP',
      itemType: shipType,
      count,
      startTime: now,
      endTime,
      status: 'IN_PROGRESS',
    })

    return {
      success: true,
      message: `Building ${count} ${shipType}`,
      data: {
        buildQueue: {
          id: buildQueue._id,
          shipType,
          count,
          startTime: now,
          endTime,
          remainingSeconds: totalBuildTime,
        },
        cost: totalCost,
        newResources: {
          tinhThach: Math.floor(planet.resources.tinhThach),
          nangLuongVuTru: Math.floor(planet.resources.nangLuongVuTru),
          honThach: Math.floor(planet.resources.honThach),
        },
      },
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('Shipyard build error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to start ship construction',
    })
  }
})
