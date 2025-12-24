import { requireAuth } from '~~/server/utils/auth'

// Get all build queues for a planet
export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const query = getQuery(event)
  const planetId = query.planetId as string

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

    if (planet.owner.toString() !== auth.playerId) {
      throw createError({
        statusCode: 403,
        message: 'Access denied',
      })
    }

    const now = new Date()

    // Get building queue
    const buildingQueue = await BuildQueueSchema.findOne({
      planet: planetId,
      queueType: 'BUILDING',
      status: 'IN_PROGRESS',
    })

    // Get research queue (player-wide, not planet-specific for research)
    const researchQueue = await BuildQueueSchema.findOne({
      player: auth.playerId,
      queueType: 'RESEARCH',
      status: 'IN_PROGRESS',
    })

    // Get ship queue
    const shipQueue = await BuildQueueSchema.find({
      planet: planetId,
      queueType: 'SHIP',
      status: 'IN_PROGRESS',
    }).sort({ startTime: 1 })

    // Get defense queue
    const defenseQueue = await BuildQueueSchema.find({
      planet: planetId,
      queueType: 'DEFENSE',
      status: 'IN_PROGRESS',
    }).sort({ startTime: 1 })

    const formatQueue = (q: any) => {
      if (!q) return null
      const endTime = new Date(q.endTime)
      const remainingSeconds = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000))
      
      return {
        id: q._id,
        type: q.itemType,
        level: q.targetLevel,
        count: q.count,
        startTime: q.startTime,
        endTime: q.endTime,
        remainingSeconds,
        isComplete: remainingSeconds <= 0,
      }
    }

    return {
      success: true,
      data: {
        building: formatQueue(buildingQueue),
        research: formatQueue(researchQueue),
        ships: shipQueue.map(formatQueue),
        defenses: defenseQueue.map(formatQueue),
      },
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('Get queue error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to get build queue',
    })
  }
})
