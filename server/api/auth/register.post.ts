import { BuildingType } from '~/types/game'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, email, password } = body

  // Validate input
  if (!username || !email || !password) {
    throw createError({
      statusCode: 400,
      message: 'Username, email, and password are required',
    })
  }

  if (username.length < 3 || username.length > 20) {
    throw createError({
      statusCode: 400,
      message: 'Username must be between 3 and 20 characters',
    })
  }

  if (password.length < 6) {
    throw createError({
      statusCode: 400,
      message: 'Password must be at least 6 characters',
    })
  }

  try {
    // Check if user already exists
    const existingPlayer = await PlayerSchema.findOne({
      $or: [{ email }, { username }],
    })

    if (existingPlayer) {
      throw createError({
        statusCode: 409,
        message: 'User with this email or username already exists',
      })
    }

    // Hash password (in production, use bcrypt)
    const passwordHash = password // TODO: Use bcrypt.hash(password, 10)

    // Generate starting coordinates
    let coordinates = generateCoordinates()
    
    // Make sure the position is not taken
    let attempts = 0
    while (attempts < 100) {
      const existingPlanet = await PlanetSchema.findOne({ coordinates })
      if (!existingPlanet) break
      coordinates = generateCoordinates()
      attempts++
    }

    // Generate planet stats
    const planetStats = generatePlanetStats()

    // Create player
    const player = await PlayerSchema.create({
      username,
      email,
      passwordHash,
      level: 1,
      experience: 0,
      rank: 'CHIEN_BINH_SO_CAP',
      planets: [],
      researches: [],
    })

    // Create home planet
    const planet = await PlanetSchema.create({
      name: `Hành Tinh của ${username}`,
      owner: player._id,
      coordinates,
      resources: GAME_CONFIG.STARTING_RESOURCES,
      buildings: [
        { type: BuildingType.MO_TINH_THACH, level: 0 },
        { type: BuildingType.MAY_HAP_THU_NANG_LUONG, level: 0 },
        { type: BuildingType.DEN_HON_THACH, level: 0 },
        { type: BuildingType.LO_NANG_LUONG, level: 0 },
      ],
      ships: [],
      defenses: [],
      temperature: planetStats.temperature,
      diameter: planetStats.diameter,
      maxFields: planetStats.maxFields,
      usedFields: 0,
      isHomePlanet: true,
    })

    // Update player with planet reference
    player.planets = [planet._id]
    player.homePlanet = planet._id
    await player.save()

    return {
      success: true,
      message: 'Registration successful',
      data: {
        player: {
          id: player._id,
          username: player.username,
          email: player.email,
          level: player.level,
          rank: player.rank,
        },
        planet: {
          id: planet._id,
          name: planet.name,
          coordinates: planet.coordinates,
        },
      },
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    
    console.error('Registration error:', error)
    throw createError({
      statusCode: 500,
      message: 'Registration failed. Please try again.',
    })
  }
})
