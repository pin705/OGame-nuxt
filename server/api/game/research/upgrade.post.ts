import { requireAuth } from '~~/server/utils/auth'
import { RESEARCHES } from '~/config/gameConfig'
import { checkRequirements } from '~~/server/utils/techTree'
import { ResearchType } from '~/types/game'

export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const body = await readBody(event)
  const { planetId, researchType } = body

  if (!planetId || !researchType) {
    throw createError({
      statusCode: 400,
      message: 'Planet ID and research type are required',
    })
  }

  if (!RESEARCHES[researchType as ResearchType]) {
    throw createError({
      statusCode: 400,
      message: 'Invalid research type',
    })
  }

  try {
    // Check planet has research lab
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

    const researchLab = planet.buildings.find((b: any) => b.type === 'VIEN_NGHIEN_CUU')
    if (!researchLab || researchLab.level < 1) {
      throw createError({
        statusCode: 400,
        message: 'Research Lab is required',
      })
    }

    // Check if already researching
    const existingResearch = await BuildQueueSchema.findOne({
      player: auth.playerId,
      queueType: 'RESEARCH',
      status: 'IN_PROGRESS',
    })

    if (existingResearch) {
      throw createError({
        statusCode: 409,
        message: 'A research is already in progress',
      })
    }

    // Get player's current research level
    const player = await PlayerSchema.findById(auth.playerId)
    if (!player) {
      throw createError({
        statusCode: 404,
        message: 'Player not found',
      })
    }

    // Check requirements
    const config = RESEARCHES[researchType as ResearchType]
    const reqCheck = checkRequirements(config.requirements, planet, player)
    if (!reqCheck.met) {
      throw createError({
        statusCode: 400,
        message: `Chưa đủ điều kiện: ${reqCheck.missing.join(', ')}`,
      })
    }

    const researchIndex = player.researches?.findIndex((r: any) => r.type === researchType) ?? -1
    const currentLevel = researchIndex >= 0 ? player.researches[researchIndex].level : 0
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

    // Calculate research time (reduced by research lab level)
    const researchTimeSeconds = Math.floor(
      ((cost.tinhThach + cost.nangLuongVuTru) / (1000 * (1 + researchLab.level))) * 3600
    )

    // Deduct resources
    planet.resources.tinhThach -= cost.tinhThach
    planet.resources.nangLuongVuTru -= cost.nangLuongVuTru
    planet.resources.honThach -= cost.honThach
    await planet.save()

    // Create research queue entry
    const now = new Date()
    const endTime = new Date(now.getTime() + researchTimeSeconds * 1000)

    const researchQueue = await BuildQueueSchema.create({
      planet: planetId,
      player: auth.playerId,
      queueType: 'RESEARCH',
      itemType: researchType,
      targetLevel,
      startTime: now,
      endTime,
      status: 'IN_PROGRESS',
    })

    return {
      success: true,
      message: 'Research started',
      data: {
        researchQueue: {
          id: researchQueue._id,
          researchType,
          level: targetLevel,
          startTime: now,
          endTime,
          remainingSeconds: researchTimeSeconds,
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
    console.error('Research upgrade error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to start research',
    })
  }
})
