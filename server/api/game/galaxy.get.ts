import { requireAuth } from '~~/server/utils/auth'

// Get galaxy view - all planets in a system
export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const query = getQuery(event)
  
  const galaxy = parseInt(query.galaxy as string) || 1
  const system = parseInt(query.system as string) || 1

  // Validate range
  if (galaxy < 1 || galaxy > 9) {
    throw createError({
      statusCode: 400,
      message: 'Galaxy must be between 1 and 9',
    })
  }

  if (system < 1 || system > 499) {
    throw createError({
      statusCode: 400,
      message: 'System must be between 1 and 499',
    })
  }

  try {
    // Get all planets in this system
    const planets = await PlanetSchema.find({
      'coordinates.galaxy': galaxy,
      'coordinates.system': system,
    })
      .populate('owner', 'username level rank')
      .sort({ 'coordinates.position': 1 })

    // Create 15-slot system view
    const systemView = []
    for (let position = 1; position <= 15; position++) {
      const planet = planets.find((p: any) => p.coordinates.position === position)
      
      if (planet) {
        systemView.push({
          position,
          planet: {
            id: planet._id,
            name: planet.name,
            coordinates: planet.coordinates,
            diameter: planet.diameter,
            temperature: planet.temperature,
          },
          owner: planet.owner ? {
            id: planet.owner._id,
            username: planet.owner.username,
            level: planet.owner.level,
            rank: planet.owner.rank,
          } : null,
          hasMoon: false, // TODO: Implement moons
          hasDebris: false, // TODO: Implement debris fields
        })
      } else {
        systemView.push({
          position,
          planet: null,
          owner: null,
          hasMoon: false,
          hasDebris: false,
        })
      }
    }

    return {
      success: true,
      data: {
        galaxy,
        system,
        positions: systemView,
      },
    }
  } catch (error: any) {
    console.error('Galaxy view error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to load galaxy view',
    })
  }
})
