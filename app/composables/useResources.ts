import type { Planet, Resources } from '~/types/game'

// Resource gain animation event bus
export type ResourceGain = {
  tinhThach: number
  nangLuongVuTru: number
  honThach: number
}

// API Response type
interface PlanetApiResponse {
  success: boolean
  data: {
    planet: Planet
    production: {
      tinhThach: number
      nangLuongVuTru: number
      honThach: number
    }
  }
}

// Global event bus for resource animations
const resourceGainListeners: ((gain: ResourceGain) => void)[] = []

export const onResourceGain = (callback: (gain: ResourceGain) => void) => {
  resourceGainListeners.push(callback)
  return () => {
    const index = resourceGainListeners.indexOf(callback)
    if (index > -1) resourceGainListeners.splice(index, 1)
  }
}

const emitResourceGain = (gain: ResourceGain) => {
  resourceGainListeners.forEach(cb => cb(gain))
}

export const useResources = () => {
  const websocket = useWebSocket()

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
  let unsubscribeWs: (() => void) | null = null

  /**
   * Fetch planet data
   */
  const fetchPlanet = async (planetId: string) => {
    isLoading.value = true
    try {
      const { data, error } = await useFetch<PlanetApiResponse>(`/api/planet/${planetId}`, {
        credentials: 'include',
      })

      if (!error.value && data.value?.success && data.value.data) {
        currentPlanet.value = data.value.data.planet
        resources.value = {
          ...data.value.data.planet.resources,
          dienNangMax: data.value.data.planet.resources.dienNangMax || 0,
        }
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
   * Start real-time resource updates using WebSocket
   */
  const startUpdates = (playerId: string) => {
    // Connect to WebSocket
    websocket.connect(playerId)

    // Listen for resource updates from server via WebSocket
    unsubscribeWs = websocket.on('resource_update', (event) => {
      if (event.data?.planetId === currentPlanet.value?._id) {
        resources.value = event.data!.resources as Resources
        lastUpdate.value = new Date()
      }
    })

    // Client-side resource calculation (every 1 second for smooth animation)
    updateInterval = setInterval(() => {
      if (!lastUpdate.value || !production.value) return

      const now = new Date()
      const elapsed = (now.getTime() - lastUpdate.value.getTime()) / 1000 // seconds
      // Production is per hour, so convert
      const hourFraction = elapsed / 3600

      const gains = {
        tinhThach: production.value.tinhThach * hourFraction,
        nangLuongVuTru: production.value.nangLuongVuTru * hourFraction,
        honThach: production.value.honThach * hourFraction,
      }

      resources.value.tinhThach += gains.tinhThach
      resources.value.nangLuongVuTru += gains.nangLuongVuTru
      resources.value.honThach += gains.honThach

      // Emit resource gain for animations
      emitResourceGain(gains)

      lastUpdate.value = now
    }, 1000) // Update every second for smooth animation
  }

  /**
   * Stop updates
   */
  const stopUpdates = () => {
    if (updateInterval) {
      clearInterval(updateInterval)
      updateInterval = null
    }
    if (unsubscribeWs) {
      unsubscribeWs()
      unsubscribeWs = null
    }
    websocket.disconnect()
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
