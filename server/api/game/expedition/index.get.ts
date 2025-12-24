import { requireAuth } from '~~/server/utils/auth'
import { ExpeditionSchema } from '~~/server/models/expedition.schema'

/**
 * Get player's active and recent expeditions
 * GET /api/game/expedition
 */
export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)

  try {
    // Get active expeditions
    const activeExpeditions = await ExpeditionSchema.find({
      owner: auth.playerId,
      status: { $in: ['TRAVELING', 'EXPLORING', 'RETURNING'] },
    })
      .populate('originPlanet', 'name coordinates')
      .sort({ departureTime: -1 })

    // Get recent completed expeditions (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentExpeditions = await ExpeditionSchema.find({
      owner: auth.playerId,
      status: 'COMPLETED',
      createdAt: { $gte: oneDayAgo },
    })
      .populate('originPlanet', 'name coordinates')
      .sort({ createdAt: -1 })
      .limit(10)

    // Calculate max expeditions
    const player = await PlayerSchema.findById(auth.playerId)
    const astroLevel = player?.researches?.find((r: any) => r.type === 'CONG_NGHE_SIEU_KHONG_GIAN')?.level || 0
    const maxExpeditions = Math.floor(astroLevel / 3) + 1

    return {
      success: true,
      data: {
        active: activeExpeditions,
        recent: recentExpeditions,
        maxExpeditions,
        currentCount: activeExpeditions.length,
      },
    }
  } catch (error: any) {
    console.error('Expedition list error:', error)
    throw createError({
      statusCode: 500,
      message: 'Lỗi khi tải danh sách thám hiểm',
    })
  }
})
