import { requireAuth } from '~~/server/utils/auth'

// Recall a fleet that hasn't arrived yet
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

    if (fleet.isReturning) {
      throw createError({
        statusCode: 400,
        message: 'Fleet is already returning',
      })
    }

    if (fleet.status === 'COMPLETED') {
      throw createError({
        statusCode: 400,
        message: 'Fleet has already completed its mission',
      })
    }

    // Calculate how far the fleet has traveled
    const now = new Date()
    const departureTime = new Date(fleet.departureTime)
    const arrivalTime = new Date(fleet.arrivalTime)
    
    const totalFlightTime = arrivalTime.getTime() - departureTime.getTime()
    const elapsedTime = now.getTime() - departureTime.getTime()
    
    // Fleet will return taking the same time it traveled so far
    const returnFlightTime = Math.min(elapsedTime, totalFlightTime)
    const newReturnTime = new Date(now.getTime() + returnFlightTime)

    // Update fleet to returning status
    fleet.isReturning = true
    fleet.status = 'RETURNING'
    fleet.arrivalTime = now // "Arrived" at recall point
    fleet.returnTime = newReturnTime
    await fleet.save()

    return {
      success: true,
      message: 'Fleet recalled',
      data: {
        fleet: {
          id: fleet._id,
          returnTime: newReturnTime,
          remainingSeconds: Math.floor(returnFlightTime / 1000),
        },
      },
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('Recall fleet error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to recall fleet',
    })
  }
})
