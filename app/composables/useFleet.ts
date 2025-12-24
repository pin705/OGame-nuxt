// Composable for fleet management
export const useFleet = () => {
  const fleets = useState<any[]>('fleets', () => [])
  const isLoading = useState<boolean>('fleetLoading', () => false)
  const fleetCountdowns = useState<Record<string, number>>('fleetCountdowns', () => ({}))
  
  // Countdown ticker
  let tickerInterval: ReturnType<typeof setInterval> | null = null

  // Start countdown ticker
  const startTicker = () => {
    if (tickerInterval) return
    tickerInterval = setInterval(() => {
      const keys = Object.keys(fleetCountdowns.value)
      keys.forEach(key => {
        if (fleetCountdowns.value[key] > 0) {
          fleetCountdowns.value[key]--
        }
      })
    }, 1000)
  }

  // Stop ticker
  const stopTicker = () => {
    if (tickerInterval) {
      clearInterval(tickerInterval)
      tickerInterval = null
    }
  }

  // Update countdowns from fleets data
  const updateCountdowns = () => {
    const now = Date.now()
    fleets.value.forEach((fleet: any) => {
      const targetTime = fleet.isReturning && fleet.returnTime
        ? new Date(fleet.returnTime).getTime()
        : new Date(fleet.arrivalTime).getTime()
      const remaining = Math.max(0, Math.floor((targetTime - now) / 1000))
      fleetCountdowns.value[fleet._id] = remaining
    })
  }

  // Fetch all active fleets
  const fetchFleets = async () => {
    isLoading.value = true
    try {
      const response = await $fetch('/api/game/fleet')
      if (response?.success) {
        fleets.value = response.data.fleets
        updateCountdowns()
        startTicker()
      }
    } catch (error) {
      console.error('Failed to fetch fleets:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Send a fleet
  const sendFleet = async (params: {
    originPlanetId: string
    destination: { galaxy: number; system: number; position: number }
    ships: { type: string; count: number }[]
    mission: string
    resources?: { tinhThach: number; nangLuongVuTru: number; honThach: number }
  }) => {
    try {
      const response = await $fetch('/api/game/fleet/send', {
        method: 'POST',
        body: params,
      })

      if (response.success) {
        await fetchFleets()
      }

      return response
    } catch (error: any) {
      return { success: false, error: error.data?.message || 'Failed to send fleet' }
    }
  }

  // Recall a fleet
  const recallFleet = async (fleetId: string) => {
    try {
      const response = await $fetch('/api/game/fleet/recall', {
        method: 'POST',
        body: { fleetId },
      })

      if (response.success) {
        await fetchFleets()
      }

      return response
    } catch (error: any) {
      return { success: false, error: error.data?.message || 'Failed to recall fleet' }
    }
  }

  // Get fleet countdown - now reactive
  const getFleetCountdown = (fleet: any) => {
    if (!fleet) return '00:00:00'
    const seconds = fleetCountdowns.value[fleet._id] || 0
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Format time in Vietnamese
  const getFleetCountdownVi = (fleet: any) => {
    if (!fleet) return 'Đã đến'
    const seconds = fleetCountdowns.value[fleet._id] || 0
    if (seconds <= 0) return 'Đã đến'
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}h ${m}m ${s}s`
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
  }

  return {
    fleets,
    isLoading,
    fleetCountdowns,
    fetchFleets,
    sendFleet,
    recallFleet,
    getFleetCountdown,
    getFleetCountdownVi,
    startTicker,
    stopTicker,
  }
}
