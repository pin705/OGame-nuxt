// Server route that processes completed build queues
// This can be called by a cron job or periodically by clients

import { notifyBuildingComplete, notifyResearchComplete, notifyShipComplete, notifyFleetUpdate } from '~~/server/routes/_ws'
import { calculatePlayerPoints } from '~~/server/utils/points'

export default defineEventHandler(async (event) => {
  const now = new Date()

  try {
    // Find all completed builds
    const completedBuilds = await BuildQueueSchema.find({
      status: 'IN_PROGRESS',
      endTime: { $lte: now },
    })

    const results = {
      buildings: 0,
      researches: 0,
      ships: 0,
      defenses: 0,
    }

    for (const build of completedBuilds) {
      try {
        switch (build.queueType) {
          case 'BUILDING':
            await completeBuildingUpgrade(build)
            results.buildings++
            break
          case 'RESEARCH':
            await completeResearch(build)
            results.researches++
            break
          case 'SHIP':
            await completeShipBuild(build)
            results.ships++
            break
          case 'DEFENSE':
            await completeDefenseBuild(build)
            results.defenses++
            break
        }
      } catch (error) {
        console.error(`Failed to process build ${build._id}:`, error)
      }
    }

    // Process fleet arrivals
    const arrivingFleets = await FleetSchema.find({
      status: 'DEPARTING',
      arrivalTime: { $lte: now },
      isReturning: false,
    })

    // Note: Fleet arrival processing is complex and should be handled
    // by the fleet/arrive endpoint for now

    // Process returning fleets
    const returningFleets = await FleetSchema.find({
      status: 'RETURNING',
      returnTime: { $lte: now },
      isReturning: true,
    })

    let fleetsReturned = 0
    for (const fleet of returningFleets) {
      try {
        await processFleetReturn(fleet)
        fleetsReturned++
      } catch (error) {
        console.error(`Failed to process returning fleet ${fleet._id}:`, error)
      }
    }

    return {
      success: true,
      processed: {
        ...results,
        fleetsArriving: arrivingFleets.length,
        fleetsReturned,
      },
    }
  } catch (error: any) {
    console.error('Queue processor error:', error)
    throw createError({
      statusCode: 500,
      message: 'Queue processing failed',
    })
  }
})

async function completeBuildingUpgrade(build: any) {
  const planet = await PlanetSchema.findById(build.planet)
  if (!planet) return

  const buildingIndex = planet.buildings.findIndex(
    (b: any) => b.type === build.itemType
  )

  if (buildingIndex >= 0) {
    planet.buildings[buildingIndex].level = build.targetLevel
  } else {
    planet.buildings.push({
      type: build.itemType,
      level: build.targetLevel,
    })
  }

  if (build.targetLevel === 1) {
    planet.usedFields = (planet.usedFields || 0) + 1
  }

  await planet.save()
  build.status = 'COMPLETED'
  await build.save()

  // Send WebSocket notification
  notifyBuildingComplete(planet.owner.toString(), {
    buildingType: build.itemType,
    level: build.targetLevel,
    planetId: planet._id,
    planetName: planet.name,
  })

  // Update points
  await calculatePlayerPoints(planet.owner.toString())

  // Start next building in queue if any
  await startNextPendingBuild(build.planet)
}

// Start the next pending building in queue
async function startNextPendingBuild(planetId: string) {
  const nextPending = await BuildQueueSchema.findOne({
    planet: planetId,
    queueType: 'BUILDING',
    status: 'PENDING',
  }).sort({ queuePosition: 1 })

  if (nextPending) {
    const now = new Date()
    nextPending.status = 'IN_PROGRESS'
    nextPending.startTime = now
    nextPending.endTime = new Date(now.getTime() + (nextPending.durationSeconds || 60) * 1000)
    await nextPending.save()

    // Update queue positions for remaining items
    await BuildQueueSchema.updateMany(
      {
        planet: planetId,
        queueType: 'BUILDING',
        status: { $in: ['PENDING', 'IN_PROGRESS'] },
        queuePosition: { $gt: 1 },
      },
      { $inc: { queuePosition: -1 } }
    )
  }
}

async function completeResearch(build: any) {
  const player = await PlayerSchema.findById(build.player)
  if (!player) return

  if (!player.researches) player.researches = []

  const researchIndex = player.researches.findIndex(
    (r: any) => r.type === build.itemType
  )

  if (researchIndex >= 0) {
    player.researches[researchIndex].level = build.targetLevel
  } else {
    player.researches.push({
      type: build.itemType,
      level: build.targetLevel,
    })
  }

  await player.save()
  build.status = 'COMPLETED'
  await build.save()

  // Send WebSocket notification
  notifyResearchComplete(player._id.toString(), {
    researchType: build.itemType,
    level: build.targetLevel,
  })

  // Update points
  await calculatePlayerPoints(player._id.toString())
}

async function completeShipBuild(build: any) {
  const planet = await PlanetSchema.findById(build.planet)
  if (!planet) return

  if (!planet.ships) planet.ships = []

  const shipIndex = planet.ships.findIndex(
    (s: any) => s.type === build.itemType
  )

  if (shipIndex >= 0) {
    planet.ships[shipIndex].count += build.count || 1
  } else {
    planet.ships.push({
      type: build.itemType,
      count: build.count || 1,
    })
  }

  await planet.save()
  build.status = 'COMPLETED'
  await build.save()

  // Send WebSocket notification
  notifyShipComplete(planet.owner.toString(), {
    shipType: build.itemType,
    count: build.count || 1,
    planetId: planet._id,
    planetName: planet.name,
  })

  // Update points
  await calculatePlayerPoints(planet.owner.toString())
}

async function completeDefenseBuild(build: any) {
  const planet = await PlanetSchema.findById(build.planet)
  if (!planet) return

  if (!planet.defenses) planet.defenses = []

  const defenseIndex = planet.defenses.findIndex(
    (d: any) => d.type === build.itemType
  )

  if (defenseIndex >= 0) {
    planet.defenses[defenseIndex].count += build.count || 1
  } else {
    planet.defenses.push({
      type: build.itemType,
      count: build.count || 1,
    })
  }

  await planet.save()
  build.status = 'COMPLETED'
  await build.save()

  // Update points
  await calculatePlayerPoints(planet.owner.toString())
}

async function processFleetReturn(fleet: any) {
  const originPlanet = await PlanetSchema.findOne({
    'coordinates.galaxy': fleet.origin.galaxy,
    'coordinates.system': fleet.origin.system,
    'coordinates.position': fleet.origin.position,
  })

  if (originPlanet) {
    if (!originPlanet.ships) originPlanet.ships = []

    for (const ship of fleet.ships) {
      const existingShip = originPlanet.ships.find((s: any) => s.type === ship.type)
      if (existingShip) {
        existingShip.count += ship.count
      } else {
        originPlanet.ships.push({ type: ship.type, count: ship.count })
      }
    }

    originPlanet.resources.tinhThach += fleet.resources.tinhThach || 0
    originPlanet.resources.nangLuongVuTru += fleet.resources.nangLuongVuTru || 0
    originPlanet.resources.honThach += fleet.resources.honThach || 0

    await originPlanet.save()

    // Send WebSocket notification
    notifyFleetUpdate(fleet.owner.toString(), {
      type: 'returned',
      fleetId: fleet._id,
      mission: fleet.mission,
      origin: fleet.origin,
      destination: fleet.destination,
      resources: fleet.resources,
    })
  }

  fleet.status = 'COMPLETED'
  await fleet.save()
}
