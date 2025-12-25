import { requireAuth } from '~~/server/utils/auth'
import { BUILDINGS } from '~/config/gameConfig'
import { checkRequirements } from '~~/server/utils/techTree'
import { BuildingType } from '~/types/game'

// Type for planet document
interface PlanetDoc {
  _id: string
  owner: { toString(): string }
  buildings: Array<{ type: string; level: number }>
  resources: { tinhThach: number; nangLuongVuTru: number; honThach: number; dienNang: number }
  usedFields: number
  maxFields: number
  save(): Promise<void>
}

// Type for queue document
interface QueueDoc {
  _id: string
  status: string
  itemType: string
  queuePosition: number
}

// Max 3 in progress at same time + 3 pending = 6 total
const MAX_IN_PROGRESS = 3
const MAX_PENDING = 3
const MAX_QUEUE_SIZE = MAX_IN_PROGRESS + MAX_PENDING

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

  if (!BUILDINGS[buildingType as BuildingType]) {
    throw createError({
      statusCode: 400,
      message: 'Invalid building type',
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

    // Fetch player for requirements check
    const player = await PlayerSchema.findById(auth.playerId)
    if (!player) {
      throw createError({
        statusCode: 404,
        message: 'Player not found',
      })
    }

    // Check requirements
    const config = BUILDINGS[buildingType as BuildingType]
    const reqCheck = checkRequirements(config.requirements, planet, player)
    if (!reqCheck.met) {
      throw createError({
        statusCode: 400,
        message: `Chưa đủ điều kiện: ${reqCheck.missing.join(', ')}`,
      })
    }

    // Get all pending/in-progress building queues for this planet
    const existingQueues = await BuildQueueSchema.find({
      planet: planetId,
      queueType: 'BUILDING',
      status: { $in: ['PENDING', 'IN_PROGRESS'] },
    }).sort({ queuePosition: 1 }) as unknown as QueueDoc[]

    // Count in progress and pending separately
    const inProgressCount = existingQueues.filter(q => q.status === 'IN_PROGRESS').length
    const pendingCount = existingQueues.filter(q => q.status === 'PENDING').length

    // Check max queue size
    if (existingQueues.length >= MAX_QUEUE_SIZE) {
      throw createError({
        statusCode: 409,
        message: `Hàng đợi đã đầy (tối đa ${MAX_IN_PROGRESS} đang xây + ${MAX_PENDING} chờ)`,
      })
    }

    // Calculate effective level (current level + pending upgrades for same building)
    const buildingIndex = planet.buildings.findIndex((b: any) => b.type === buildingType)
    const currentLevel = buildingIndex >= 0 ? planet.buildings[buildingIndex].level : 0
    
    // Count pending upgrades for this building type
    const pendingUpgrades = existingQueues.filter(q => q.itemType === buildingType).length
    const targetLevel = currentLevel + pendingUpgrades + 1

    // Calculate cost for target level
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
        message: 'Không đủ tài nguyên',
      })
    }

    // Check fields
    if (planet.usedFields >= planet.maxFields) {
      throw createError({
        statusCode: 400,
        message: 'Không còn chỗ xây dựng',
      })
    }

    // Calculate build time
    const roboticsLevel = planet.buildings.find((b: any) => b.type === BuildingType.NHA_MAY_ROBOT)?.level || 0
    const buildTimeSeconds = Math.max(
      Math.floor(((cost.tinhThach + cost.nangLuongVuTru) / (2500 * (1 + roboticsLevel))) * 3600 / 5), // /5 for game speed
      1
    )

    // Deduct resources immediately
    planet.resources.tinhThach -= cost.tinhThach
    planet.resources.nangLuongVuTru -= cost.nangLuongVuTru
    planet.resources.honThach -= cost.honThach
    await planet.save()

    // Determine queue position and status
    const queuePosition = existingQueues.length + 1
    // Start immediately if we have less than MAX_IN_PROGRESS in progress
    const shouldStartNow = inProgressCount < MAX_IN_PROGRESS

    const now = new Date()
    
    // Create build queue entry
    const buildQueue = await BuildQueueSchema.create({
      planet: planetId,
      player: auth.playerId,
      queueType: 'BUILDING',
      itemType: buildingType,
      targetLevel: targetLevel,
      queuePosition,
      cost,
      durationSeconds: buildTimeSeconds,
      startTime: shouldStartNow ? now : null,
      endTime: shouldStartNow ? new Date(now.getTime() + buildTimeSeconds * 1000) : null,
      status: shouldStartNow ? 'IN_PROGRESS' : 'PENDING',
    })

    return {
      success: true,
      message: shouldStartNow 
        ? `Đang nâng cấp lên cấp ${targetLevel}` 
        : `Đã thêm vào hàng đợi (vị trí ${queuePosition})`,
      data: {
        buildQueue: {
          id: buildQueue._id,
          buildingType,
          level: targetLevel,
          queuePosition,
          startTime: buildQueue.startTime,
          endTime: buildQueue.endTime,
          remainingSeconds: shouldStartNow ? buildTimeSeconds : null,
          status: buildQueue.status,
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
