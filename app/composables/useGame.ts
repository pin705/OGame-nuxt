// Composable for managing game data across the application
export const useGame = () => {
  const currentPlanetId = useState<string | null>('currentPlanetId', () => null)
  const currentPlanet = useState<any>('currentPlanet', () => null)
  const planets = useState<any[]>('planets', () => [])
  const buildQueue = useState<any>('buildQueue', () => null)
  const isLoading = useState<boolean>('gameLoading', () => false)

  // Fetch all player's planets
  const fetchPlanets = async () => {
    try {
      const { data } = await useFetch('/api/game/planets')
      if (data.value?.success) {
        planets.value = data.value.data.planets
        // Set current planet if not set
        if (!currentPlanetId.value && planets.value.length > 0) {
          currentPlanetId.value = planets.value[0].id
        }
      }
    } catch (error) {
      console.error('Failed to fetch planets:', error)
    }
  }

  // Fetch specific planet details
  const fetchPlanet = async (planetId?: string) => {
    const id = planetId || currentPlanetId.value
    if (!id) return

    isLoading.value = true
    try {
      const { data } = await useFetch(`/api/game/planet/${id}`)
      if (data.value?.success) {
        currentPlanet.value = data.value.data
      }
    } catch (error) {
      console.error('Failed to fetch planet:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Fetch build queue
  const fetchBuildQueue = async (planetId?: string) => {
    const id = planetId || currentPlanetId.value
    if (!id) return

    try {
      const { data } = await useFetch(`/api/game/queue?planetId=${id}`)
      if (data.value?.success) {
        buildQueue.value = data.value.data
      }
    } catch (error) {
      console.error('Failed to fetch build queue:', error)
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

  return {
    // State
    currentPlanetId,
    currentPlanet,
    planets,
    buildQueue,
    isLoading,
    
    // Actions
    fetchPlanets,
    fetchPlanet,
    fetchBuildQueue,
    selectPlanet,
    processQueue,
    upgradeBuilding,
    startResearch,
    buildShips,
  }
}
