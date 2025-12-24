import { requireAuth } from '~~/server/utils/auth'
import { simulateBattle } from '~~/server/utils/combat'

// Process fleet arrival and execute mission
export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const body = await readBody(event)
  const { fleetId } = body

  if (!fleetId) {
    throw createError({
      statusCode: 400,
      message: 'Fleet ID is required',
    })
  }

  try {
    const fleet = await FleetSchema.findById(fleetId)
    
    if (!fleet) {
      throw createError({
        statusCode: 404,
        message: 'Fleet not found',
      })
    }

    if (fleet.owner.toString() !== auth.playerId) {
      throw createError({
        statusCode: 403,
        message: 'Access denied',
      })
    }

    const now = new Date()

    // Check if fleet has arrived
    if (!fleet.isReturning) {
      if (now < new Date(fleet.arrivalTime)) {
        throw createError({
          statusCode: 400,
          message: 'Fleet has not arrived yet',
        })
      }

      // Process mission at destination
      await processMissionArrival(fleet, auth.playerId)
    } else {
      // Fleet is returning
      if (fleet.returnTime && now < new Date(fleet.returnTime)) {
        throw createError({
          statusCode: 400,
          message: 'Fleet has not returned yet',
        })
      }

      // Process return home
      await processFleetReturn(fleet)
    }

    return {
      success: true,
      message: 'Fleet arrival processed',
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('Fleet arrival error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to process fleet arrival',
    })
  }
})

async function processMissionArrival(fleet: any, attackerId: string) {
  const destination = fleet.destination
  
  // Find target planet
  const targetPlanet = await PlanetSchema.findOne({
    'coordinates.galaxy': destination.galaxy,
    'coordinates.system': destination.system,
    'coordinates.position': destination.position,
  })

  switch (fleet.mission) {
    case 'TAN_CONG':
      await processAttack(fleet, targetPlanet, attackerId)
      break
    case 'VAN_CHUYEN':
      await processTransport(fleet, targetPlanet)
      break
    case 'TRIEN_KHAI':
      await processDeploy(fleet, targetPlanet)
      break
    case 'DO_THAM':
      await processEspionage(fleet, targetPlanet)
      break
    case 'TAI_CHE':
      await processRecycle(fleet, destination)
      break
    case 'THUOC_DIA':
      await processColonize(fleet, destination, attackerId)
      break
    default:
      // Mark as returning
      fleet.isReturning = true
      fleet.status = 'RETURNING'
      await fleet.save()
  }
}

async function processAttack(fleet: any, targetPlanet: any, attackerId: string) {
  if (!targetPlanet) {
    // Empty planet - just return
    fleet.isReturning = true
    fleet.status = 'RETURNING'
    await fleet.save()
    return
  }

  const defender = await PlayerSchema.findById(targetPlanet.owner)
  const attacker = await PlayerSchema.findById(attackerId)

  // Get tech levels
  const attackerTech = {
    weapon: attacker?.researches?.find((r: any) => r.type === 'CONG_NGHE_VU_KHI')?.level || 0,
    armor: attacker?.researches?.find((r: any) => r.type === 'CONG_NGHE_GIAP')?.level || 0,
    shield: attacker?.researches?.find((r: any) => r.type === 'CONG_NGHE_KHIEN')?.level || 0,
  }

  const defenderTech = {
    weapon: defender?.researches?.find((r: any) => r.type === 'CONG_NGHE_VU_KHI')?.level || 0,
    armor: defender?.researches?.find((r: any) => r.type === 'CONG_NGHE_GIAP')?.level || 0,
    shield: defender?.researches?.find((r: any) => r.type === 'CONG_NGHE_KHIEN')?.level || 0,
  }

  // Run battle simulation
  const battleResult = simulateBattle(
    fleet.ships,
    targetPlanet.ships || [],
    targetPlanet.defenses || [],
    attackerTech,
    defenderTech,
    {
      tinhThach: targetPlanet.resources.tinhThach,
      nangLuongVuTru: targetPlanet.resources.nangLuongVuTru,
      honThach: targetPlanet.resources.honThach,
    }
  )

  // Update defender's planet
  if (battleResult.attackerWins) {
    // Remove loot from defender
    targetPlanet.resources.tinhThach -= battleResult.loot.tinhThach
    targetPlanet.resources.nangLuongVuTru -= battleResult.loot.nangLuongVuTru
    targetPlanet.resources.honThach -= battleResult.loot.honThach
    
    // Add loot to fleet's cargo
    fleet.resources.tinhThach = (fleet.resources.tinhThach || 0) + battleResult.loot.tinhThach
    fleet.resources.nangLuongVuTru = (fleet.resources.nangLuongVuTru || 0) + battleResult.loot.nangLuongVuTru
    fleet.resources.honThach = (fleet.resources.honThach || 0) + battleResult.loot.honThach
  }

  // Update remaining ships
  fleet.ships = battleResult.attackerLosses
    .filter(s => s.remaining > 0)
    .map(s => ({ type: s.type, count: s.remaining }))

  // Update defender's remaining ships and defenses
  targetPlanet.ships = battleResult.defenderLosses
    .filter(s => s.remaining > 0 && !s.type.startsWith('PHAO_') && !s.type.startsWith('TEN_') && !s.type.startsWith('KHIEN_'))
    .map(s => ({ type: s.type, count: s.remaining }))

  targetPlanet.defenses = battleResult.defenderLosses
    .filter(s => s.remaining > 0 && (s.type.startsWith('PHAO_') || s.type.startsWith('TEN_') || s.type.startsWith('KHIEN_')))
    .map(s => ({ type: s.type, count: s.remaining }))

  await targetPlanet.save()

  // Create battle report
  await BattleReportSchema.create({
    attacker: attackerId,
    defender: targetPlanet.owner,
    attackerPlanet: fleet.origin,
    defenderPlanet: targetPlanet.coordinates,
    result: {
      attackerWins: battleResult.attackerWins,
      defenderWins: battleResult.defenderWins,
      draw: battleResult.draw,
      rounds: battleResult.rounds,
    },
    attackerFleet: fleet.ships.map((s: any, i: number) => ({
      type: s.type,
      initial: s.count,
      lost: battleResult.attackerLosses[i]?.lost || 0,
      remaining: battleResult.attackerLosses[i]?.remaining || 0,
    })),
    defenderFleet: battleResult.defenderLosses,
    loot: battleResult.loot,
    debrisField: battleResult.debrisField,
    battleTime: new Date(),
  })

  // Set fleet to return
  if (fleet.ships.length > 0) {
    fleet.isReturning = true
    fleet.status = 'RETURNING'
    await fleet.save()
  } else {
    // All ships destroyed
    fleet.status = 'COMPLETED'
    await fleet.save()
  }
}

async function processTransport(fleet: any, targetPlanet: any) {
  if (targetPlanet) {
    // Deliver resources
    targetPlanet.resources.tinhThach += fleet.resources.tinhThach || 0
    targetPlanet.resources.nangLuongVuTru += fleet.resources.nangLuongVuTru || 0
    targetPlanet.resources.honThach += fleet.resources.honThach || 0
    await targetPlanet.save()

    // Clear fleet resources
    fleet.resources = { tinhThach: 0, nangLuongVuTru: 0, honThach: 0 }
  }

  fleet.isReturning = true
  fleet.status = 'RETURNING'
  await fleet.save()
}

async function processDeploy(fleet: any, targetPlanet: any) {
  if (targetPlanet && targetPlanet.owner.toString() === fleet.owner.toString()) {
    // Add ships to target planet
    for (const ship of fleet.ships) {
      const existingShip = targetPlanet.ships?.find((s: any) => s.type === ship.type)
      if (existingShip) {
        existingShip.count += ship.count
      } else {
        if (!targetPlanet.ships) targetPlanet.ships = []
        targetPlanet.ships.push({ type: ship.type, count: ship.count })
      }
    }

    // Add resources
    targetPlanet.resources.tinhThach += fleet.resources.tinhThach || 0
    targetPlanet.resources.nangLuongVuTru += fleet.resources.nangLuongVuTru || 0
    targetPlanet.resources.honThach += fleet.resources.honThach || 0
    
    await targetPlanet.save()

    // Fleet deployment complete - no return
    fleet.status = 'COMPLETED'
    await fleet.save()
  } else {
    // Can't deploy to enemy planet - return
    fleet.isReturning = true
    fleet.status = 'RETURNING'
    await fleet.save()
  }
}

async function processEspionage(fleet: any, targetPlanet: any) {
  // TODO: Generate espionage report
  // For now, just return
  fleet.isReturning = true
  fleet.status = 'RETURNING'
  await fleet.save()
}

async function processRecycle(fleet: any, destination: any) {
  // TODO: Collect debris field resources
  fleet.isReturning = true
  fleet.status = 'RETURNING'
  await fleet.save()
}

async function processColonize(fleet: any, destination: any, playerId: string) {
  // Check if position is empty
  const existingPlanet = await PlanetSchema.findOne({
    'coordinates.galaxy': destination.galaxy,
    'coordinates.system': destination.system,
    'coordinates.position': destination.position,
  })

  if (existingPlanet) {
    // Position occupied - return
    fleet.isReturning = true
    fleet.status = 'RETURNING'
    await fleet.save()
    return
  }

  // Check if fleet has colony ship
  const colonyShip = fleet.ships.find((s: any) => s.type === 'TAU_THUOC_DIA')
  if (!colonyShip || colonyShip.count < 1) {
    fleet.isReturning = true
    fleet.status = 'RETURNING'
    await fleet.save()
    return
  }

  // Create new planet
  const newPlanet = await PlanetSchema.create({
    name: `Thuộc địa ${destination.galaxy}:${destination.system}:${destination.position}`,
    owner: playerId,
    coordinates: destination,
    resources: {
      tinhThach: 500,
      nangLuongVuTru: 500,
      honThach: 0,
      dienNang: 0,
    },
    buildings: [],
    ships: [],
    defenses: [],
    temperature: Math.floor(Math.random() * 100) - 40,
    diameter: Math.floor(Math.random() * 200) + 100,
    maxFields: Math.floor(Math.random() * 100) + 150,
    usedFields: 0,
    lastResourceUpdate: new Date(),
  })

  // Add remaining ships (minus one colony ship) to new planet
  const remainingShips = fleet.ships
    .map((s: any) => {
      if (s.type === 'TAU_THUOC_DIA') {
        return { type: s.type, count: s.count - 1 }
      }
      return s
    })
    .filter((s: any) => s.count > 0)

  newPlanet.ships = remainingShips
  newPlanet.resources.tinhThach += fleet.resources.tinhThach || 0
  newPlanet.resources.nangLuongVuTru += fleet.resources.nangLuongVuTru || 0
  newPlanet.resources.honThach += fleet.resources.honThach || 0
  await newPlanet.save()

  // Add planet to player
  await PlayerSchema.findByIdAndUpdate(playerId, {
    $push: { planets: newPlanet._id }
  })

  // Fleet mission complete
  fleet.status = 'COMPLETED'
  await fleet.save()
}

async function processFleetReturn(fleet: any) {
  // Return ships and resources to origin planet
  const originPlanet = await PlanetSchema.findOne({
    'coordinates.galaxy': fleet.origin.galaxy,
    'coordinates.system': fleet.origin.system,
    'coordinates.position': fleet.origin.position,
  })

  if (originPlanet) {
    // Return ships
    for (const ship of fleet.ships) {
      const existingShip = originPlanet.ships?.find((s: any) => s.type === ship.type)
      if (existingShip) {
        existingShip.count += ship.count
      } else {
        if (!originPlanet.ships) originPlanet.ships = []
        originPlanet.ships.push({ type: ship.type, count: ship.count })
      }
    }

    // Return resources
    originPlanet.resources.tinhThach += fleet.resources.tinhThach || 0
    originPlanet.resources.nangLuongVuTru += fleet.resources.nangLuongVuTru || 0
    originPlanet.resources.honThach += fleet.resources.honThach || 0

    await originPlanet.save()
  }

  fleet.status = 'COMPLETED'
  await fleet.save()
}
