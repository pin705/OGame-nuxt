import type { Planet, Resources } from '~/types/game'
import { calculateResourceProduction as calcProduction } from '~/utils/gameFormulas'

export const useResources = () => {
  const auth = useAuth()
  const gameEvents = useGameEvents()

  const currentPlanet = ref<Planet | null>(null)
  const resources = ref<Resources>({
    tinhThach: 0,
    nangLuongVuTru: 0,
    honThach: 0,
    dienNang: 0,
    dienNangMax: 0,
  })
  const production = ref({
    tinhThach: 0,
    nangLuongVuTru: 0,
    honThach: 0,
  })

  const isLoading = ref(false)
  const lastUpdate = ref<Date | null>(null)
  let updateInterval: ReturnType<typeof setInterval> | null = null

  /**
   * Fetch planet data
   */
  const fetchPlanet = async (planetId: string) => {
    isLoading.value = true
    try {
      const { data, error } = await useFetch(`/api/planet/${planetId}`, {
        credentials: 'include',
      })

      if (!error.value && data.value?.success) {
        currentPlanet.value = data.value.data.planet as Planet
        resources.value = data.value.data.planet.resources
        production.value = data.value.data.production
        lastUpdate.value = new Date()
      }
    } catch (err) {
      console.error('Failed to fetch planet:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Start real-time resource updates
   */
  const startUpdates = () => {
    // Connect to SSE
    gameEvents.connect()

    // Listen for resource updates from server
    gameEvents.on('resource_update', (event) => {
      if (event.data?.planetId === currentPlanet.value?.id) {
        resources.value = event.data.resources
        lastUpdate.value = new Date()
      }
    })

    // Client-side resource calculation (every 5 seconds for faster feedback)
    updateInterval = setInterval(() => {
      if (!lastUpdate.value || !production.value) return

      const now = new Date()
      const elapsed = (now.getTime() - lastUpdate.value.getTime()) / 1000 // seconds
      // Production is per hour, so convert 5 seconds = 5/3600 hours
      const hourFraction = elapsed / 3600

      resources.value.tinhThach += production.value.tinhThach * hourFraction
      resources.value.nangLuongVuTru += production.value.nangLuongVuTru * hourFraction
      resources.value.honThach += production.value.honThach * hourFraction

      lastUpdate.value = now
    }, 1000) // Update every 5 seconds
  }

  /**
   * Stop updates
   */
  const stopUpdates = () => {
    if (updateInterval) {
      clearInterval(updateInterval)
      updateInterval = null
    }
    gameEvents.disconnect()
  }

  /**
   * Check if player can afford a cost
   */
  const canAfford = (cost: Partial<Resources>): boolean => {
    if (cost.tinhThach && resources.value.tinhThach < cost.tinhThach) return false
    if (cost.nangLuongVuTru && resources.value.nangLuongVuTru < cost.nangLuongVuTru) return false
    if (cost.honThach && resources.value.honThach < cost.honThach) return false
    return true
  }

  /**
   * Deduct resources (optimistic update)
   */
  const deductResources = (cost: Partial<Resources>) => {
    if (cost.tinhThach) resources.value.tinhThach -= cost.tinhThach
    if (cost.nangLuongVuTru) resources.value.nangLuongVuTru -= cost.nangLuongVuTru
    if (cost.honThach) resources.value.honThach -= cost.honThach
  }

  // Auto-cleanup
  onUnmounted(() => {
    stopUpdates()
  })

  return {
    currentPlanet: readonly(currentPlanet),
    resources: readonly(resources),
    production: readonly(production),
    isLoading: readonly(isLoading),
    lastUpdate: readonly(lastUpdate),

    fetchPlanet,
    startUpdates,
    stopUpdates,
    canAfford,
    deductResources,
  }
}
