import { requireAuth } from '~~/server/utils/auth'
import { notifyAttackIncoming, notifyFleetUpdate } from '~~/server/routes/_ws'

// Fleet mission types
const FleetMission = {
  TAN_CONG: 'TAN_CONG',
  VAN_CHUYEN: 'VAN_CHUYEN',
  TRIEN_KHAI: 'TRIEN_KHAI',
  THUOC_DIA: 'THUOC_DIA',
  DO_THAM: 'DO_THAM',
  TAI_CHE: 'TAI_CHE',
} as const

// Ship speeds
const SHIP_SPEEDS: Record<string, number> = {
  TIEU_CHIEN_HAM: 12500,
  TRUNG_CHIEN_HAM: 10000,
  TUAN_DUONG_HAM: 15000,
  THIET_GIAP_HAM: 10000,
  HAC_LONG_HAM: 10000,
  VAN_TAI_NHO: 5000,
  VAN_TAI_LON: 7500,
  TAU_THUOC_DIA: 2500,
  TAU_DO_THAM: 100000000, // Very fast
  TAU_TAI_CHE: 2000,
  MAU_HAM: 10000,
  DA_DE_HAM: 5000,
  TU_THAN_TINH: 100,
}

// Fuel consumption per unit
const SHIP_FUEL: Record<string, number> = {
  TIEU_CHIEN_HAM: 20,
  TRUNG_CHIEN_HAM: 75,
  TUAN_DUONG_HAM: 300,
  THIET_GIAP_HAM: 500,
  HAC_LONG_HAM: 250,
  VAN_TAI_NHO: 10,
  VAN_TAI_LON: 50,
  TAU_THUOC_DIA: 1000,
  TAU_DO_THAM: 1,
  TAU_TAI_CHE: 300,
  MAU_HAM: 1000,
  DA_DE_HAM: 1000,
  TU_THAN_TINH: 1,
}

// Calculate distance between coordinates
function calculateDistance(
  origin: { galaxy: number; system: number; position: number },
  destination: { galaxy: number; system: number; position: number }
): number {
  if (origin.galaxy !== destination.galaxy) {
    return 20000 * Math.abs(origin.galaxy - destination.galaxy)
  }
  if (origin.system !== destination.system) {
    return 2700 + 95 * Math.abs(origin.system - destination.system)
  }
  return 1000 + 5 * Math.abs(origin.position - destination.position)
}

// Calculate flight time
function calculateFlightTime(distance: number, fleetSpeed: number): number {
  // 10 + 3500 / speed * sqrt(distance * 10 / fleetSpeed)
  return Math.round(10 + (3500 / 1) * Math.sqrt(distance * 10 / fleetSpeed))
}

// Calculate fuel consumption
function calculateFuel(distance: number, ships: { type: string; count: number }[]): number {
  let totalFuel = 0
  for (const ship of ships) {
    const consumption = SHIP_FUEL[ship.type] || 0
    totalFuel += consumption * ship.count * (distance / 35000)
  }
  return Math.ceil(totalFuel)
}

export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const body = await readBody(event)
  const { 
    originPlanetId, 
    destination, 
    ships, 
    mission, 
    resources = { tinhThach: 0, nangLuongVuTru: 0, honThach: 0 } 
  } = body

  // Validate inputs
  if (!originPlanetId || !destination || !ships || !mission) {
    throw createError({
      statusCode: 400,
      message: 'Missing required fields',
    })
  }

  if (!Object.values(FleetMission).includes(mission)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid mission type',
    })
  }

  if (!Array.isArray(ships) || ships.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'No ships selected',
    })
  }

  if (!destination.galaxy || !destination.system || !destination.position) {
    throw createError({
      statusCode: 400,
      message: 'Invalid destination coordinates',
    })
  }

  try {
    // Get origin planet
    const originPlanet = await PlanetSchema.findById(originPlanetId)
    if (!originPlanet) {
      throw createError({
        statusCode: 404,
        message: 'Origin planet not found',
      })
    }

    if (originPlanet.owner.toString() !== auth.playerId) {
      throw createError({
        statusCode: 403,
        message: 'Access denied',
      })
    }

    // Validate ships availability
    for (const ship of ships) {
      const planetShip = originPlanet.ships?.find((s: any) => s.type === ship.type)
      const available = planetShip?.count || 0
      if (available < ship.count) {
        throw createError({
          statusCode: 400,
          message: `Not enough ${ship.type}. Available: ${available}`,
        })
      }
    }

    // Calculate distance and flight time
    const origin = originPlanet.coordinates
    const distance = calculateDistance(origin, destination)
    
    // Get target planet (for notifications)
    const targetPlanet = await PlanetSchema.findOne({
      'coordinates.galaxy': destination.galaxy,
      'coordinates.system': destination.system,
      'coordinates.position': destination.position,
    })
    
    // Get slowest ship speed
    let slowestSpeed = Infinity
    for (const ship of ships) {
      const speed = SHIP_SPEEDS[ship.type] || 1000
      if (speed < slowestSpeed) slowestSpeed = speed
    }
    
    const flightTimeSeconds = calculateFlightTime(distance, slowestSpeed)
    
    // Calculate fuel consumption
    const fuelConsumption = calculateFuel(distance, ships)

    // Check if player has enough deuterium for fuel
    const totalDeutNeeded = fuelConsumption + (resources.honThach || 0)
    if (originPlanet.resources.honThach < totalDeutNeeded) {
      throw createError({
        statusCode: 400,
        message: `Insufficient deuterium. Need ${totalDeutNeeded}, have ${Math.floor(originPlanet.resources.honThach)}`,
      })
    }

    // Check if transporting resources
    if (resources.tinhThach > originPlanet.resources.tinhThach ||
        resources.nangLuongVuTru > originPlanet.resources.nangLuongVuTru) {
      throw createError({
        statusCode: 400,
        message: 'Insufficient resources to transport',
      })
    }

    // Remove ships from planet
    for (const ship of ships) {
      const planetShipIndex = originPlanet.ships.findIndex((s: any) => s.type === ship.type)
      if (planetShipIndex >= 0) {
        originPlanet.ships[planetShipIndex].count -= ship.count
        if (originPlanet.ships[planetShipIndex].count <= 0) {
          originPlanet.ships.splice(planetShipIndex, 1)
        }
      }
    }

    // Deduct resources
    originPlanet.resources.tinhThach -= resources.tinhThach || 0
    originPlanet.resources.nangLuongVuTru -= resources.nangLuongVuTru || 0
    originPlanet.resources.honThach -= totalDeutNeeded
    await originPlanet.save()

    // Create fleet entry
    const now = new Date()
    const arrivalTime = new Date(now.getTime() + flightTimeSeconds * 1000)
    const returnTime = new Date(arrivalTime.getTime() + flightTimeSeconds * 1000)

    const fleet = await FleetSchema.create({
      owner: auth.playerId,
      ships,
      mission,
      origin,
      destination,
      resources: {
        tinhThach: resources.tinhThach || 0,
        nangLuongVuTru: resources.nangLuongVuTru || 0,
        honThach: resources.honThach || 0,
      },
      departureTime: now,
      arrivalTime,
      returnTime: mission !== 'TRIEN_KHAI' ? returnTime : undefined,
      status: 'DEPARTING',
      isReturning: false,
    })

    // Notify target player if this is an attack
    if (mission === FleetMission.TAN_CONG && targetPlanet?.owner) {
      const targetOwnerId = targetPlanet.owner.toString()
      if (targetOwnerId !== auth.playerId) {
        notifyAttackIncoming(targetOwnerId, {
          arrivalTime,
          origin: {
            coordinates: origin,
          },
          destination: {
            planetName: targetPlanet.name,
            coordinates: destination,
          },
          // Don't reveal exact fleet composition
          fleetSize: ships.reduce((sum: number, s: any) => sum + s.count, 0),
        })
      }
    }

    // Notify the sender about fleet dispatch
    notifyFleetUpdate(auth.playerId, {
      type: 'dispatched',
      fleetId: fleet._id,
      mission,
      destination,
      arrivalTime,
    })

    return {
      success: true,
      message: 'Fleet dispatched',
      data: {
        fleet: {
          id: fleet._id,
          mission,
          ships,
          origin,
          destination,
          departureTime: now,
          arrivalTime,
          returnTime: mission !== 'TRIEN_KHAI' ? returnTime : undefined,
          flightTimeSeconds,
          fuelConsumption,
          resources: {
            tinhThach: resources.tinhThach || 0,
            nangLuongVuTru: resources.nangLuongVuTru || 0,
            honThach: resources.honThach || 0,
          },
        },
      },
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('Fleet send error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to send fleet',
    })
  }
})
