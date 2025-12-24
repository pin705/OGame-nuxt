import { requireAuth } from '~~/server/utils/auth'

// Game configuration - Building types and costs
const BuildingType = {
  MO_TINH_THACH: 'MO_TINH_THACH',
  MAY_HAP_THU_NANG_LUONG: 'MAY_HAP_THU_NANG_LUONG',
  DEN_HON_THACH: 'DEN_HON_THACH',
  LO_NANG_LUONG: 'LO_NANG_LUONG',
  KHO_TINH_THACH: 'KHO_TINH_THACH',
  KHO_NANG_LUONG_VU_TRU: 'KHO_NANG_LUONG_VU_TRU',
  KHO_HON_THACH: 'KHO_HON_THACH',
  TRUNG_TAM_CHI_HUY: 'TRUNG_TAM_CHI_HUY',
  XUONG_DONG_TAU: 'XUONG_DONG_TAU',
  VIEN_NGHIEN_CUU: 'VIEN_NGHIEN_CUU',
  NHA_MAY_ROBOT: 'NHA_MAY_ROBOT',
  PHAO_DAI_PHONG_THU: 'PHAO_DAI_PHONG_THU',
} as const

const BUILDING_CONFIG: Record<string, { baseCost: { metal: number; crystal: number; deut: number }; factor: number }> = {
  [BuildingType.MO_TINH_THACH]: { baseCost: { metal: 60, crystal: 15, deut: 0 }, factor: 1.5 },
  [BuildingType.MAY_HAP_THU_NANG_LUONG]: { baseCost: { metal: 48, crystal: 24, deut: 0 }, factor: 1.6 },
  [BuildingType.DEN_HON_THACH]: { baseCost: { metal: 225, crystal: 75, deut: 0 }, factor: 1.5 },
  [BuildingType.LO_NANG_LUONG]: { baseCost: { metal: 75, crystal: 30, deut: 0 }, factor: 1.5 },
  [BuildingType.NHA_MAY_ROBOT]: { baseCost: { metal: 400, crystal: 120, deut: 200 }, factor: 2 },
  [BuildingType.XUONG_DONG_TAU]: { baseCost: { metal: 400, crystal: 200, deut: 100 }, factor: 2 },
  [BuildingType.VIEN_NGHIEN_CUU]: { baseCost: { metal: 200, crystal: 400, deut: 200 }, factor: 2 },
  [BuildingType.KHO_TINH_THACH]: { baseCost: { metal: 1000, crystal: 0, deut: 0 }, factor: 2 },
  [BuildingType.KHO_NANG_LUONG_VU_TRU]: { baseCost: { metal: 1000, crystal: 500, deut: 0 }, factor: 2 },
  [BuildingType.KHO_HON_THACH]: { baseCost: { metal: 1000, crystal: 1000, deut: 0 }, factor: 2 },
  [BuildingType.TRUNG_TAM_CHI_HUY]: { baseCost: { metal: 20000, crystal: 40000, deut: 0 }, factor: 2 },
  [BuildingType.PHAO_DAI_PHONG_THU]: { baseCost: { metal: 20000, crystal: 20000, deut: 1000 }, factor: 2 },
}

export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const body = await readBody(event)
  const { planetId, buildingType } = body

  if (!planetId || !buildingType) {
    throw createError({
      statusCode: 400,
      message: 'Planet ID and building type are required',
    })
  }

  if (!Object.values(BuildingType).includes(buildingType as any)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid building type',
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

    // Check if already building
    const existingBuild = await BuildQueueSchema.findOne({
      planet: planetId,
      queueType: 'BUILDING',
      status: 'IN_PROGRESS',
    })

    if (existingBuild) {
      throw createError({
        statusCode: 409,
        message: 'A building is already being upgraded',
      })
    }

    // Get current level
    const buildingIndex = planet.buildings.findIndex((b: any) => b.type === buildingType)
    const currentLevel = buildingIndex >= 0 ? planet.buildings[buildingIndex].level : 0
    const targetLevel = currentLevel + 1

    // Calculate cost
    const config = BUILDING_CONFIG[buildingType]
    if (!config) {
      throw createError({
        statusCode: 400,
        message: 'Unknown building type',
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

    // Check fields
    if (planet.usedFields >= planet.maxFields) {
      throw createError({
        statusCode: 400,
        message: 'No available building slots',
      })
    }

    // Calculate build time
    const roboticsLevel = planet.buildings.find((b: any) => b.type === BuildingType.NHA_MAY_ROBOT)?.level || 0
    const buildTimeSeconds = Math.floor(
      ((cost.tinhThach + cost.nangLuongVuTru) / (2500 * (1 + roboticsLevel))) * 3600
    )

    // Deduct resources
    planet.resources.tinhThach -= cost.tinhThach
    planet.resources.nangLuongVuTru -= cost.nangLuongVuTru
    planet.resources.honThach -= cost.honThach
    await planet.save()

    // Create build queue entry
    const now = new Date()
    const endTime = new Date(now.getTime() + buildTimeSeconds * 1000)

    const buildQueue = await BuildQueueSchema.create({
      planet: planetId,
      player: auth.playerId,
      queueType: 'BUILDING',
      itemType: buildingType,
      targetLevel: targetLevel,
      startTime: now,
      endTime,
      status: 'IN_PROGRESS',
    })

    return {
      success: true,
      message: 'Building upgrade started',
      data: {
        buildQueue: {
          id: buildQueue._id,
          buildingType,
          level: targetLevel,
          startTime: now,
          endTime,
          remainingSeconds: buildTimeSeconds,
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
    console.error('Building upgrade error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to start building upgrade',
    })
  }
})
