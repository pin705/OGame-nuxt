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

    // Get ALL building queues (both pending and in-progress)
    const buildingQueues = await BuildQueueSchema.find({
      planet: planetId,
      queueType: 'BUILDING',
      status: { $in: ['PENDING', 'IN_PROGRESS'] },
    }).sort({ queuePosition: 1 })

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
      const endTime = q.endTime ? new Date(q.endTime) : null
      const remainingSeconds = endTime 
        ? Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000))
        : null
      
      return {
        id: q._id,
        type: q.itemType,
        level: q.targetLevel,
        count: q.count,
        queuePosition: q.queuePosition,
        durationSeconds: q.durationSeconds,
        startTime: q.startTime,
        endTime: q.endTime,
        remainingSeconds,
        status: q.status,
        isComplete: q.status === 'IN_PROGRESS' && remainingSeconds !== null && remainingSeconds <= 0,
      }
    }

    // Get the first building (currently in progress)
    const currentBuilding = buildingQueues.find(q => q.status === 'IN_PROGRESS')
    const pendingBuildings = buildingQueues.filter(q => q.status === 'PENDING')

    return {
      success: true,
      data: {
        // Currently building (for backwards compatibility)
        building: formatQueue(currentBuilding),
        // All building queue items
        buildingQueue: buildingQueues.map(formatQueue),
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
