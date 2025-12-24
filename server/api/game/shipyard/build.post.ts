import { requireAuth } from '~~/server/utils/auth'

// Ship types and costs
const ShipType = {
  TIEU_CHIEN_HAM: 'TIEU_CHIEN_HAM',
  TRUNG_CHIEN_HAM: 'TRUNG_CHIEN_HAM',
  TUAN_DUONG_HAM: 'TUAN_DUONG_HAM',
  THIET_GIAP_HAM: 'THIET_GIAP_HAM',
  HAC_LONG_HAM: 'HAC_LONG_HAM',
  VAN_TAI_NHO: 'VAN_TAI_NHO',
  VAN_TAI_LON: 'VAN_TAI_LON',
  TAU_THUOC_DIA: 'TAU_THUOC_DIA',
  TAU_DO_THAM: 'TAU_DO_THAM',
  TAU_TAI_CHE: 'TAU_TAI_CHE',
  MAU_HAM: 'MAU_HAM',
  DA_DE_HAM: 'DA_DE_HAM',
  TU_THAN_TINH: 'TU_THAN_TINH',
} as const

const SHIP_CONFIG: Record<string, { 
  cost: { metal: number; crystal: number; deut: number };
  buildTime: number; // base seconds per unit
  requirements?: { shipyard?: number; research?: Record<string, number> };
}> = {
  [ShipType.TIEU_CHIEN_HAM]: { 
    cost: { metal: 3000, crystal: 1000, deut: 0 }, 
    buildTime: 300,
    requirements: { shipyard: 1 }
  },
  [ShipType.TRUNG_CHIEN_HAM]: { 
    cost: { metal: 6000, crystal: 4000, deut: 0 }, 
    buildTime: 600,
    requirements: { shipyard: 3, research: { CONG_NGHE_GIAP: 2 } }
  },
  [ShipType.TUAN_DUONG_HAM]: { 
    cost: { metal: 20000, crystal: 7000, deut: 2000 }, 
    buildTime: 1200,
    requirements: { shipyard: 5, research: { DONG_CO_XUNG: 4, CONG_NGHE_VU_KHI: 2 } }
  },
  [ShipType.THIET_GIAP_HAM]: { 
    cost: { metal: 45000, crystal: 15000, deut: 0 }, 
    buildTime: 3600,
    requirements: { shipyard: 7, research: { DONG_CO_SIEU_KHONG_GIAN: 4 } }
  },
  [ShipType.HAC_LONG_HAM]: { 
    cost: { metal: 30000, crystal: 40000, deut: 15000 }, 
    buildTime: 7200,
    requirements: { shipyard: 8, research: { DONG_CO_SIEU_KHONG_GIAN: 5, CONG_NGHE_VU_KHI: 12 } }
  },
  [ShipType.VAN_TAI_NHO]: { 
    cost: { metal: 2000, crystal: 2000, deut: 0 }, 
    buildTime: 180,
    requirements: { shipyard: 2 }
  },
  [ShipType.VAN_TAI_LON]: { 
    cost: { metal: 6000, crystal: 6000, deut: 0 }, 
    buildTime: 360,
    requirements: { shipyard: 4 }
  },
  [ShipType.TAU_THUOC_DIA]: { 
    cost: { metal: 10000, crystal: 20000, deut: 10000 }, 
    buildTime: 14400,
    requirements: { shipyard: 4, research: { DONG_CO_XUNG: 3 } }
  },
  [ShipType.TAU_DO_THAM]: { 
    cost: { metal: 0, crystal: 1000, deut: 0 }, 
    buildTime: 30,
    requirements: { shipyard: 3, research: { CONG_NGHE_GIAN_DIEP: 2 } }
  },
  [ShipType.TAU_TAI_CHE]: { 
    cost: { metal: 10000, crystal: 6000, deut: 2000 }, 
    buildTime: 600,
    requirements: { shipyard: 4, research: { DONG_CO_DOT_CHAY: 6 } }
  },
  [ShipType.MAU_HAM]: { 
    cost: { metal: 60000, crystal: 50000, deut: 15000 }, 
    buildTime: 10800,
    requirements: { shipyard: 9, research: { DONG_CO_SIEU_KHONG_GIAN: 6 } }
  },
  [ShipType.DA_DE_HAM]: { 
    cost: { metal: 60000, crystal: 50000, deut: 15000 }, 
    buildTime: 21600,
    requirements: { shipyard: 9, research: { DONG_CO_SIEU_KHONG_GIAN: 5, CONG_NGHE_VU_KHI: 10 } }
  },
  [ShipType.TU_THAN_TINH]: { 
    cost: { metal: 5000000, crystal: 4000000, deut: 1000000 }, 
    buildTime: 604800, // 1 week
    requirements: { shipyard: 12, research: { DONG_CO_SIEU_KHONG_GIAN: 8, CONG_NGHE_VU_KHI: 15 } }
  },
}

export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const body = await readBody(event)
  const { planetId, shipType, count = 1 } = body

  if (!planetId || !shipType) {
    throw createError({
      statusCode: 400,
      message: 'Planet ID and ship type are required',
    })
  }

  if (!Object.values(ShipType).includes(shipType as any)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid ship type',
    })
  }

  if (count < 1 || count > 9999) {
    throw createError({
      statusCode: 400,
      message: 'Invalid ship count (1-9999)',
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

    // Check shipyard requirement
    const shipyard = planet.buildings.find((b: any) => b.type === 'XUONG_DONG_TAU')
    const shipyardLevel = shipyard?.level || 0
    
    const config = SHIP_CONFIG[shipType]
    if (!config) {
      throw createError({
        statusCode: 400,
        message: 'Unknown ship type',
      })
    }

    if (config.requirements?.shipyard && shipyardLevel < config.requirements.shipyard) {
      throw createError({
        statusCode: 400,
        message: `Shipyard level ${config.requirements.shipyard} required`,
      })
    }

    // Check research requirements
    if (config.requirements?.research) {
      const player = await PlayerSchema.findById(auth.playerId)
      for (const [researchType, requiredLevel] of Object.entries(config.requirements.research)) {
        const research = player?.researches?.find((r: any) => r.type === researchType)
        const currentLevel = research?.level || 0
        if (currentLevel < requiredLevel) {
          throw createError({
            statusCode: 400,
            message: `Research ${researchType} level ${requiredLevel} required`,
          })
        }
      }
    }

    // Calculate total cost
    const totalCost = {
      tinhThach: config.cost.metal * count,
      nangLuongVuTru: config.cost.crystal * count,
      honThach: config.cost.deut * count,
    }

    // Check resources
    if (
      planet.resources.tinhThach < totalCost.tinhThach ||
      planet.resources.nangLuongVuTru < totalCost.nangLuongVuTru ||
      planet.resources.honThach < totalCost.honThach
    ) {
      throw createError({
        statusCode: 400,
        message: 'Insufficient resources',
      })
    }

    // Calculate build time (reduced by shipyard and robot factory levels)
    const robotFactory = planet.buildings.find((b: any) => b.type === 'NHA_MAY_ROBOT')
    const robotLevel = robotFactory?.level || 0
    
    const buildTimePerUnit = Math.floor(
      config.buildTime / (1 + shipyardLevel) / (1 + robotLevel)
    )
    const totalBuildTime = buildTimePerUnit * count

    // Deduct resources
    planet.resources.tinhThach -= totalCost.tinhThach
    planet.resources.nangLuongVuTru -= totalCost.nangLuongVuTru
    planet.resources.honThach -= totalCost.honThach
    await planet.save()

    // Create build queue entry
    const now = new Date()
    const endTime = new Date(now.getTime() + totalBuildTime * 1000)

    const buildQueue = await BuildQueueSchema.create({
      planet: planetId,
      player: auth.playerId,
      queueType: 'SHIP',
      itemType: shipType,
      count,
      startTime: now,
      endTime,
      status: 'IN_PROGRESS',
    })

    return {
      success: true,
      message: `Building ${count} ${shipType}`,
      data: {
        buildQueue: {
          id: buildQueue._id,
          shipType,
          count,
          startTime: now,
          endTime,
          remainingSeconds: totalBuildTime,
        },
        cost: totalCost,
        newResources: {
          tinhThach: Math.floor(planet.resources.tinhThach),
          nangLuongVuTru: Math.floor(planet.resources.nangLuongVuTru),
          honThach: Math.floor(planet.resources.honThach),
        },
      },
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('Shipyard build error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to start ship construction',
    })
  }
})
