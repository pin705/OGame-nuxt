// Composable for managing game data across the application
export const useGame = () => {
  const auth = useAuth()
  const currentPlanetId = useState<string | null>('currentPlanetId', () => null)
  const currentPlanet = useState<any>('currentPlanet', () => null)
  const planets = useState<any[]>('planets', () => [])
  const buildQueue = useState<any>('buildQueue', () => null)
  const isLoading = useState<boolean>('gameLoading', () => false)
  const error = useState<string | null>('gameError', () => null)

  // Initialize game - get player's planets and set current planet
  const initGame = async () => {
    // First ensure auth is initialized
    if (!auth.isAuthenticated.value) {
      await auth.init()
    }

    // Get home planet from auth
    if (auth.homePlanet.value?._id) {
      currentPlanetId.value = auth.homePlanet.value._id.toString()
    }

    // Fetch planets
    await fetchPlanets()

    // Fetch current planet details
    if (currentPlanetId.value) {
      await fetchPlanet()
      await fetchBuildQueue()
    }
  }

  // Fetch all player's planets
  const fetchPlanets = async () => {
    try {
      const response = await $fetch('/api/game/planets')
      if (response?.success) {
        planets.value = response.data.planets
        // Set current planet if not set
        if (!currentPlanetId.value && planets.value.length > 0) {
          currentPlanetId.value = planets.value[0]._id?.toString() || planets.value[0].id
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch planets:', err)
      error.value = err.message || 'Failed to fetch planets'
    }
  }

  // Fetch specific planet details
  const fetchPlanet = async (planetId?: string) => {
    const id = planetId || currentPlanetId.value
    if (!id) {
      error.value = 'No planet ID available'
      return
    }

    isLoading.value = true
    error.value = null
    try {
      const response = await $fetch(`/api/game/planet/${id}`)
      if (response?.success) {
        currentPlanet.value = response.data
      }
    } catch (err: any) {
      console.error('Failed to fetch planet:', err)
      error.value = err.message || 'Failed to fetch planet'
    } finally {
      isLoading.value = false
    }
  }

  // Fetch build queue
  const fetchBuildQueue = async (planetId?: string) => {
    const id = planetId || currentPlanetId.value
    if (!id) return

    try {
      const response = await $fetch(`/api/game/queue?planetId=${id}`)
      if (response?.success) {
        buildQueue.value = response.data
      }
    } catch (err: any) {
      console.error('Failed to fetch build queue:', err)
    }
  }

  // Change current planet
  const selectPlanet = async (planetId: string) => {
    currentPlanetId.value = planetId
    await Promise.all([
      fetchPlanet(planetId),
      fetchBuildQueue(planetId),
    ])
  }

  // Process completed queues
  const processQueue = async () => {
    try {
      await $fetch('/api/game/process-queue', { method: 'POST' })
      // Refresh data
      await Promise.all([
        fetchPlanet(),
        fetchBuildQueue(),
      ])
    } catch (error) {
      console.error('Failed to process queue:', error)
    }
  }

  // Upgrade a building
  const upgradeBuilding = async (buildingType: string) => {
    if (!currentPlanetId.value) return { success: false, error: 'No planet selected' }

    try {
      const response = await $fetch('/api/game/building/upgrade', {
        method: 'POST',
        body: {
          planetId: currentPlanetId.value,
          buildingType,
        },
      })

      if (response.success) {
        await Promise.all([
          fetchPlanet(),
          fetchBuildQueue(),
        ])
      }

      return response
    } catch (error: any) {
      return { success: false, error: error.data?.message || 'Upgrade failed' }
    }
  }

  // Start research
  const startResearch = async (researchType: string) => {
    if (!currentPlanetId.value) return { success: false, error: 'No planet selected' }

    try {
      const response = await $fetch('/api/game/research/upgrade', {
        method: 'POST',
        body: {
          planetId: currentPlanetId.value,
          researchType,
        },
      })

      if (response.success) {
        await Promise.all([
          fetchPlanet(),
          fetchBuildQueue(),
        ])
      }

      return response
    } catch (error: any) {
      return { success: false, error: error.data?.message || 'Research failed' }
    }
  }

  // Build ships
  const buildShips = async (shipType: string, count: number = 1) => {
    if (!currentPlanetId.value) return { success: false, error: 'No planet selected' }

    try {
      const response = await $fetch('/api/game/shipyard/build', {
        method: 'POST',
        body: {
          planetId: currentPlanetId.value,
          shipType,
          count,
        },
      })

      if (response.success) {
        await Promise.all([
          fetchPlanet(),
          fetchBuildQueue(),
        ])
      }

      return response
    } catch (error: any) {
      return { success: false, error: error.data?.message || 'Build failed' }
    }
  }

  // Cancel a building in queue
  const cancelBuilding = async (queueId: string) => {
    if (!currentPlanetId.value) return { success: false, error: 'No planet selected' }

    try {
      const response = await $fetch('/api/game/building/cancel', {
        method: 'POST',
        body: {
          queueId,
          planetId: currentPlanetId.value,
        },
      })

      if (response.success) {
        await Promise.all([
          fetchPlanet(),
          fetchBuildQueue(),
        ])
      }

      return response
    } catch (error: any) {
      return { success: false, error: error.data?.message || 'Cancel failed' }
    }
  }

  return {
    // State
    currentPlanetId,
    currentPlanet,
    planets,
    buildQueue,
    isLoading,
    error,
    
    // Actions
    initGame,
    fetchPlanets,
    fetchPlanet,
    fetchBuildQueue,
    selectPlanet,
    processQueue,
    upgradeBuilding,
    startResearch,
    buildShips,
    cancelBuilding,
  }
}
