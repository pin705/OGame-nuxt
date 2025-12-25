import { requireAuth } from '~~/server/utils/auth'

// Type for planet document
interface PlanetDoc {
  _id: string
  owner: { toString(): string }
  resources: { tinhThach: number; nangLuongVuTru: number; honThach: number; dienNang: number }
  save(): Promise<void>
}

// Type for queue document
interface QueueDoc {
  _id: string
  planet: { toString(): string }
  status: string
  queuePosition: number
  cost?: { tinhThach?: number; nangLuongVuTru?: number; honThach?: number }
  durationSeconds?: number
  startTime?: Date
  endTime?: Date
  save(): Promise<void>
}

export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const body = await readBody(event)
  const { queueId, planetId } = body

  if (!queueId || !planetId) {
    throw createError({
      statusCode: 400,
      message: 'Queue ID and Planet ID are required',
    })
  }

  try {
    const planet = await PlanetSchema.findById(planetId) as PlanetDoc | null
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

    const queueItem = await BuildQueueSchema.findById(queueId) as QueueDoc | null
    if (!queueItem) {
      throw createError({
        statusCode: 404,
        message: 'Queue item not found',
      })
    }

    if (queueItem.planet.toString() !== planetId) {
      throw createError({
        statusCode: 403,
        message: 'Access denied',
      })
    }

    if (queueItem.status === 'COMPLETED' || queueItem.status === 'CANCELLED') {
      throw createError({
        statusCode: 400,
        message: 'Cannot cancel completed or already cancelled item',
      })
    }

    const wasInProgress = queueItem.status === 'IN_PROGRESS'
    const cancelledPosition = queueItem.queuePosition

    // Refund resources (80% refund for in-progress, 100% for pending)
    const refundRate = wasInProgress ? 0.8 : 1.0
    if (queueItem.cost) {
      planet.resources.tinhThach += Math.floor((queueItem.cost.tinhThach || 0) * refundRate)
      planet.resources.nangLuongVuTru += Math.floor((queueItem.cost.nangLuongVuTru || 0) * refundRate)
      planet.resources.honThach += Math.floor((queueItem.cost.honThach || 0) * refundRate)
      await planet.save()
    }

    // Update queue item
    queueItem.status = 'CANCELLED'
    await queueItem.save()

    // Update positions of remaining items
    await BuildQueueSchema.updateMany(
      {
        planet: planetId,
        queueType: 'BUILDING',
        status: { $in: ['PENDING', 'IN_PROGRESS'] },
        queuePosition: { $gt: cancelledPosition },
      },
      { $inc: { queuePosition: -1 } }
    )

    // If we cancelled an in-progress item, start the next one
    if (wasInProgress) {
      const nextPending = await BuildQueueSchema.findOne({
        planet: planetId,
        queueType: 'BUILDING',
        status: 'PENDING',
      }).sort({ queuePosition: 1 }) as QueueDoc | null

      if (nextPending) {
        const now = new Date()
        nextPending.status = 'IN_PROGRESS'
        nextPending.startTime = now
        nextPending.endTime = new Date(now.getTime() + (nextPending.durationSeconds || 60) * 1000)
        await nextPending.save()
      }
    }

    return {
      success: true,
      message: `Đã hủy công trình, hoàn lại ${Math.floor(refundRate * 100)}% tài nguyên`,
      data: {
        refunded: {
          tinhThach: Math.floor((queueItem.cost?.tinhThach || 0) * refundRate),
          nangLuongVuTru: Math.floor((queueItem.cost?.nangLuongVuTru || 0) * refundRate),
          honThach: Math.floor((queueItem.cost?.honThach || 0) * refundRate),
        },
        newResources: {
          tinhThach: Math.floor(planet.resources.tinhThach),
          nangLuongVuTru: Math.floor(planet.resources.nangLuongVuTru),
          honThach: Math.floor(planet.resources.honThach),
        },
      },
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('Cancel building error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to cancel building',
    })
  }
})
