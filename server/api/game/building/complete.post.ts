import { requireAuth } from '~~/server/utils/auth'

// Complete a building upgrade (called when timer expires or by cron)
export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const body = await readBody(event)
  const { queueId } = body

  if (!queueId) {
    throw createError({
      statusCode: 400,
      message: 'Queue ID is required',
    })
  }

  try {
    const buildQueue = await BuildQueueSchema.findById(queueId)

    if (!buildQueue) {
      throw createError({
        statusCode: 404,
        message: 'Build queue not found',
      })
    }

    if (buildQueue.player.toString() !== auth.playerId) {
      throw createError({
        statusCode: 403,
        message: 'Access denied',
      })
    }

    if (buildQueue.status !== 'IN_PROGRESS') {
      throw createError({
        statusCode: 400,
        message: 'Build is not in progress',
      })
    }

    // Check if time has passed
    const now = new Date()
    if (now < buildQueue.endTime) {
      throw createError({
        statusCode: 400,
        message: 'Build not yet complete',
      })
    }

    // Update planet building level
    const planet = await PlanetSchema.findById(buildQueue.planet)
    if (!planet) {
      throw createError({
        statusCode: 404,
        message: 'Planet not found',
      })
    }

    const buildingIndex = planet.buildings.findIndex(
      (b: any) => b.type === buildQueue.itemType
    )

    if (buildingIndex >= 0) {
      planet.buildings[buildingIndex].level = buildQueue.targetLevel
    } else {
      planet.buildings.push({
        type: buildQueue.itemType,
        level: buildQueue.targetLevel,
      })
    }

    // Update used fields
    if (buildQueue.targetLevel === 1) {
      planet.usedFields = (planet.usedFields || 0) + 1
    }

    await planet.save()

    // Mark queue as completed
    buildQueue.status = 'COMPLETED'
    await buildQueue.save()

    return {
      success: true,
      message: 'Building upgrade completed',
      data: {
        building: {
          type: buildQueue.itemType,
          level: buildQueue.targetLevel,
        },
      },
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('Complete building error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to complete building upgrade',
    })
  }
})
