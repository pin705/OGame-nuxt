// Composable for galaxy view
export const useGalaxy = () => {
  const currentGalaxy = useState<number>('currentGalaxy', () => 1)
  const currentSystem = useState<number>('currentSystem', () => 1)
  const systemView = useState<any[]>('systemView', () => [])
  const isLoading = useState<boolean>('galaxyLoading', () => false)

  // Fetch galaxy system view
  const fetchSystem = async (galaxy?: number, system?: number) => {
    const g = galaxy ?? currentGalaxy.value
    const s = system ?? currentSystem.value

    isLoading.value = true
    try {
      const { data } = await useFetch(`/api/game/galaxy?galaxy=${g}&system=${s}`)
      if (data.value?.success) {
        currentGalaxy.value = g
        currentSystem.value = s
        systemView.value = data.value.data.positions
      }
    } catch (error) {
      console.error('Failed to fetch galaxy view:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Navigate to a different galaxy
  const changeGalaxy = async (delta: number) => {
    const newGalaxy = Math.max(1, Math.min(9, currentGalaxy.value + delta))
    if (newGalaxy !== currentGalaxy.value) {
      await fetchSystem(newGalaxy, currentSystem.value)
    }
  }

  // Navigate to a different system
  const changeSystem = async (delta: number) => {
    const newSystem = Math.max(1, Math.min(499, currentSystem.value + delta))
    if (newSystem !== currentSystem.value) {
      await fetchSystem(currentGalaxy.value, newSystem)
    }
  }

  // Jump to specific coordinates
  const jumpTo = async (galaxy: number, system: number) => {
    const g = Math.max(1, Math.min(9, galaxy))
    const s = Math.max(1, Math.min(499, system))
    await fetchSystem(g, s)
  }

  // Format coordinates for display
  const formatCoords = (coords: { galaxy: number; system: number; position: number }) => {
    return `[${coords.galaxy}:${coords.system}:${coords.position}]`
  }

  return {
    currentGalaxy,
    currentSystem,
    systemView,
    isLoading,
    fetchSystem,
    changeGalaxy,
    changeSystem,
    jumpTo,
    formatCoords,
  }
}
