import { requireAuth } from '~~/server/utils/auth'
import { DEFENSES } from '~/config/gameConfig'
import { checkRequirements } from '~~/server/utils/techTree'
import { DefenseType } from '~/types/game'

export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const body = await readBody(event)
  const { planetId, defenseType, count = 1 } = body

  if (!planetId || !defenseType) {
    throw createError({
      statusCode: 400,
      message: 'Planet ID and defense type are required',
    })
  }

  if (!DEFENSES[defenseType as DefenseType]) {
    throw createError({
      statusCode: 400,
      message: 'Invalid defense type',
    })
  }

  if (count < 1 || count > 9999) {
    throw createError({
      statusCode: 400,
      message: 'Invalid defense count (1-9999)',
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

    // Check shipyard requirement (Defenses are built in Shipyard)
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
    const config = DEFENSES[defenseType as DefenseType]
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
    
    // Formula: (Metal + Crystal) / (2500 * (1 + ShipyardLevel) * 2^NaniteLevel) * 3600
    // Simplified: (Metal + Crystal) / (2500 * (1 + ShipyardLevel)) * 3600
    const baseTime = (config.cost.tinhThach + config.cost.nangLuongVuTru) / 2500
    const timeReduction = (1 + shipyardLevel) * (1 + robotLevel * 0.5) // Simplified robot bonus
    const buildTimeSeconds = Math.max(1, Math.floor((baseTime / timeReduction) * 3600))

    // Deduct resources
    planet.resources.tinhThach -= totalCost.tinhThach
    planet.resources.nangLuongVuTru -= totalCost.nangLuongVuTru
    planet.resources.honThach -= totalCost.honThach
    await planet.save()

    // Add to build queue
    // If there are existing items in queue, start time is after the last one
    const lastQueueItem = await BuildQueueSchema.findOne({
      planet: planetId,
      status: 'IN_PROGRESS',
    }).sort({ endTime: -1 })

    const startTime = lastQueueItem ? lastQueueItem.endTime : new Date()
    const endTime = new Date(startTime.getTime() + buildTimeSeconds * 1000 * count)

    // Create queue item (one item for the batch)
    // Note: In a real game, we might want to split this into individual items or handle partial completion
    // For MVP, we'll treat the batch as one queue item but with total duration
    // Actually, OGame processes ships one by one. Let's create one queue item with count.
    // The process-queue script should handle decrementing count or completing the batch.
    // Our process-queue implementation seems to handle the whole batch at once for simplicity?
    // Let's check process-queue again. It calls completeDefenseBuild(build).
    // completeDefenseBuild adds build.count to planet.defenses.
    // So yes, it completes the whole batch at once at the end of the total duration.
    
    const queueItem = await BuildQueueSchema.create({
      planet: planetId,
      queueType: 'DEFENSE',
      itemType: defenseType,
      level: 0, // Not used for defenses
      count: count,
      startTime,
      endTime,
      status: 'IN_PROGRESS',
    })

    return {
      success: true,
      data: {
        queueItem,
        resources: planet.resources,
      },
    }
  } catch (error: any) {
    console.error('Build defense error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to build defense',
    })
  }
})
