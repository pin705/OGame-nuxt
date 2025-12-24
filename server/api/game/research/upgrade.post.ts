import { requireAuth } from '~~/server/utils/auth'

// Research types and costs
const ResearchType = {
  CONG_NGHE_NANG_LUONG: 'CONG_NGHE_NANG_LUONG',
  CONG_NGHE_KHAI_THAC: 'CONG_NGHE_KHAI_THAC',
  CONG_NGHE_VU_KHI: 'CONG_NGHE_VU_KHI',
  CONG_NGHE_GIAP: 'CONG_NGHE_GIAP',
  CONG_NGHE_KHIEN: 'CONG_NGHE_KHIEN',
  DONG_CO_DOT_CHAY: 'DONG_CO_DOT_CHAY',
  DONG_CO_XUNG: 'DONG_CO_XUNG',
  DONG_CO_SIEU_KHONG_GIAN: 'DONG_CO_SIEU_KHONG_GIAN',
  CONG_NGHE_GIAN_DIEP: 'CONG_NGHE_GIAN_DIEP',
  CONG_NGHE_MAY_TINH: 'CONG_NGHE_MAY_TINH',
  CONG_NGHE_SIEU_KHONG_GIAN: 'CONG_NGHE_SIEU_KHONG_GIAN',
} as const

const RESEARCH_CONFIG: Record<string, { baseCost: { metal: number; crystal: number; deut: number }; factor: number }> = {
  [ResearchType.CONG_NGHE_NANG_LUONG]: { baseCost: { metal: 0, crystal: 800, deut: 400 }, factor: 2 },
  [ResearchType.CONG_NGHE_KHAI_THAC]: { baseCost: { metal: 800, crystal: 400, deut: 0 }, factor: 2 },
  [ResearchType.CONG_NGHE_VU_KHI]: { baseCost: { metal: 800, crystal: 200, deut: 0 }, factor: 2 },
  [ResearchType.CONG_NGHE_GIAP]: { baseCost: { metal: 1000, crystal: 0, deut: 0 }, factor: 2 },
  [ResearchType.CONG_NGHE_KHIEN]: { baseCost: { metal: 200, crystal: 600, deut: 0 }, factor: 2 },
  [ResearchType.DONG_CO_DOT_CHAY]: { baseCost: { metal: 400, crystal: 0, deut: 600 }, factor: 2 },
  [ResearchType.DONG_CO_XUNG]: { baseCost: { metal: 2000, crystal: 4000, deut: 600 }, factor: 2 },
  [ResearchType.DONG_CO_SIEU_KHONG_GIAN]: { baseCost: { metal: 10000, crystal: 20000, deut: 6000 }, factor: 2 },
  [ResearchType.CONG_NGHE_GIAN_DIEP]: { baseCost: { metal: 200, crystal: 1000, deut: 200 }, factor: 2 },
  [ResearchType.CONG_NGHE_MAY_TINH]: { baseCost: { metal: 0, crystal: 400, deut: 600 }, factor: 2 },
  [ResearchType.CONG_NGHE_SIEU_KHONG_GIAN]: { baseCost: { metal: 0, crystal: 4000, deut: 2000 }, factor: 2 },
}

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

  if (!Object.values(ResearchType).includes(researchType as any)) {
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

    const researchIndex = player.researches?.findIndex((r: any) => r.type === researchType) ?? -1
    const currentLevel = researchIndex >= 0 ? player.researches[researchIndex].level : 0
    const targetLevel = currentLevel + 1

    // Calculate cost
    const config = RESEARCH_CONFIG[researchType]
    if (!config) {
      throw createError({
        statusCode: 400,
        message: 'Unknown research type',
      })
    }

    const cost = {
      tinhThach: Math.floor(config.baseCost.metal * Math.pow(config.factor, targetLevel - 1)),
      nangLuongVuTru: Math.floor(config.baseCost.crystal * Math.pow(config.factor, targetLevel - 1)),
      honThach: Math.floor(config.baseCost.deut * Math.pow(config.factor, targetLevel - 1)),
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
