import { requireAuth } from '~~/server/utils/auth'

/**
 * Abandon a planet (not the home planet)
 * POST /api/game/planet/abandon
 */
export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const body = await readBody(event)
  const { planetId, confirmName } = body

  if (!planetId) {
    throw createError({
      statusCode: 400,
      message: 'Planet ID được yêu cầu',
    })
  }

  try {
    const player = await PlayerSchema.findById(auth.playerId)
    if (!player) {
      throw createError({
        statusCode: 404,
        message: 'Người chơi không tồn tại',
      })
    }

    const planet = await PlanetSchema.findById(planetId)
    if (!planet) {
      throw createError({
        statusCode: 404,
        message: 'Hành tinh không tồn tại',
      })
    }

    if (planet.owner.toString() !== auth.playerId) {
      throw createError({
        statusCode: 403,
        message: 'Không có quyền bỏ hành tinh này',
      })
    }

    // Check if this is the home planet
    if (planet.isHomePlanet) {
      throw createError({
        statusCode: 400,
        message: 'Không thể bỏ hành tinh mẹ',
      })
    }

    // Confirm by name for safety
    if (confirmName !== planet.name) {
      throw createError({
        statusCode: 400,
        message: 'Xác nhận tên hành tinh không khớp',
      })
    }

    // Check for active fleets from/to this planet
    const activeFleets = await FleetSchema.countDocuments({
      $or: [
        { origin: planetId, status: { $ne: 'COMPLETED' } },
        { 'destination.planetId': planetId, status: { $ne: 'COMPLETED' } },
      ],
    })

    if (activeFleets > 0) {
      throw createError({
        statusCode: 400,
        message: 'Không thể bỏ hành tinh khi có hạm đội đang hoạt động',
      })
    }

    // Remove planet reference from player
    player.planets = player.planets.filter((p: any) => p.toString() !== planetId)
    await player.save()

    // Delete the planet
    await PlanetSchema.findByIdAndDelete(planetId)

    // Delete related build queues
    await BuildQueueSchema.deleteMany({ planet: planetId })

    return {
      success: true,
      message: `Hành tinh ${planet.name} đã bị bỏ hoang`,
    }
  } catch (error: any) {
    console.error('Planet abandon error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Lỗi khi bỏ hành tinh',
    })
  }
})
