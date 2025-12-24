import { requireAuth } from '~~/server/utils/auth'

// Get all active fleets for the player
export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)

  try {
    const fleets = await FleetSchema.find({
      owner: auth.playerId,
      status: { $ne: 'COMPLETED' },
    }).sort({ arrivalTime: 1 })

    const now = new Date()
    const fleetData = fleets.map((fleet: any) => {
      const arrivalTime = new Date(fleet.arrivalTime)
      const returnTime = fleet.returnTime ? new Date(fleet.returnTime) : null
      
      let remainingSeconds: number
      let phase: string
      
      if (fleet.isReturning && returnTime) {
        remainingSeconds = Math.max(0, Math.floor((returnTime.getTime() - now.getTime()) / 1000))
        phase = 'returning'
      } else {
        remainingSeconds = Math.max(0, Math.floor((arrivalTime.getTime() - now.getTime()) / 1000))
        phase = 'arriving'
      }

      return {
        id: fleet._id,
        mission: fleet.mission,
        ships: fleet.ships,
        origin: fleet.origin,
        destination: fleet.destination,
        departureTime: fleet.departureTime,
        arrivalTime: fleet.arrivalTime,
        returnTime: fleet.returnTime,
        resources: fleet.resources,
        status: fleet.status,
        isReturning: fleet.isReturning,
        phase,
        remainingSeconds,
      }
    })

    return {
      success: true,
      data: {
        fleets: fleetData,
        count: fleetData.length,
      },
    }
  } catch (error: any) {
    console.error('Get fleets error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to get fleets',
    })
  }
})
