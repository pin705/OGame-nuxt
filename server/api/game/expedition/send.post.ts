import { requireAuth } from '~~/server/utils/auth'
import { ExpeditionSchema, calculateExpeditionResult } from '~~/server/models/expedition.schema'

/**
 * Send fleet on expedition mission
 * POST /api/game/expedition/send
 */
export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const body = await readBody(event)
  const { planetId, ships, destination } = body

  if (!planetId || !ships || ships.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'Planet ID và tàu được yêu cầu',
    })
  }

  if (!destination || !destination.galaxy || !destination.system) {
    throw createError({
      statusCode: 400,
      message: 'Tọa độ đích được yêu cầu',
    })
  }

  try {
    // Get the planet
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
        message: 'Không có quyền truy cập',
      })
    }

    // Check if player has enough ships
    const planetShips = planet.ships as any[] || []
    for (const ship of ships) {
      const available = planetShips.find((s: any) => s.type === ship.type)
      if (!available || available.count < ship.count) {
        throw createError({
          statusCode: 400,
          message: `Không đủ ${ship.type}`,
        })
      }
    }

    // Count active expeditions (limit based on astro research)
    const player = await PlayerSchema.findById(auth.playerId)
    const astroLevel = player?.researches?.find((r: any) => r.type === 'CONG_NGHE_SIEU_KHONG_GIAN')?.level || 0
    const maxExpeditions = Math.floor(astroLevel / 3) + 1 // 1 base + 1 per 3 levels

    const activeExpeditions = await ExpeditionSchema.countDocuments({
      owner: auth.playerId,
      status: { $in: ['TRAVELING', 'EXPLORING', 'RETURNING'] },
    })

    if (activeExpeditions >= maxExpeditions) {
      throw createError({
        statusCode: 400,
        message: `Đã đạt giới hạn thám hiểm (${maxExpeditions}). Nâng cấp Công Nghệ Siêu Không Gian để mở thêm.`,
      })
    }

    // Remove ships from planet
    for (const ship of ships) {
      const planetShip = planetShips.find((s: any) => s.type === ship.type)
      if (planetShip) {
        planetShip.count -= ship.count
      }
    }
    planet.ships = planetShips.filter((s: any) => s.count > 0)
    await planet.save()

    // Calculate travel time based on distance
    const distance = Math.abs(destination.system - planet.coordinates.system) + 
                     Math.abs(destination.galaxy - planet.coordinates.galaxy) * 100
    const travelTime = Math.max(600, distance * 60) // Minimum 10 minutes
    const explorationTime = 3600 // 1 hour exploration

    const now = new Date()
    const arrivalTime = new Date(now.getTime() + travelTime * 1000)
    const explorationEndTime = new Date(arrivalTime.getTime() + explorationTime * 1000)
    const returnTime = new Date(explorationEndTime.getTime() + travelTime * 1000)

    // Create expedition
    const expedition = await ExpeditionSchema.create({
      owner: auth.playerId,
      originPlanet: planetId,
      ships,
      destination: {
        galaxy: destination.galaxy,
        system: destination.system,
        position: 16, // Expedition slot
      },
      status: 'TRAVELING',
      departureTime: now,
      arrivalTime,
      explorationEndTime,
      returnTime,
    })

    return {
      success: true,
      data: {
        expeditionId: expedition._id,
        arrivalTime,
        explorationEndTime,
        returnTime,
      },
    }
  } catch (error: any) {
    console.error('Expedition send error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Lỗi khi gửi thám hiểm',
    })
  }
})
