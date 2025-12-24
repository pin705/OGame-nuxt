// Composable for fleet management
export const useFleet = () => {
  const fleets = useState<any[]>('fleets', () => [])
  const isLoading = useState<boolean>('fleetLoading', () => false)

  // Fetch all active fleets
  const fetchFleets = async () => {
    isLoading.value = true
    try {
      const { data } = await useFetch('/api/game/fleet')
      if (data.value?.success) {
        fleets.value = data.value.data.fleets
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

  // Get fleet countdown timer
  const getFleetCountdown = (fleet: any) => {
    if (!fleet) return null

    const now = Date.now()
    let targetTime: number
    
    if (fleet.isReturning && fleet.returnTime) {
      targetTime = new Date(fleet.returnTime).getTime()
    } else {
      targetTime = new Date(fleet.arrivalTime).getTime()
    }

    const remainingMs = Math.max(0, targetTime - now)
    const hours = Math.floor(remainingMs / 3600000)
    const minutes = Math.floor((remainingMs % 3600000) / 60000)
    const seconds = Math.floor((remainingMs % 60000) / 1000)

    return {
      remainingMs,
      formatted: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
      isComplete: remainingMs <= 0,
    }
  }

  return {
    fleets,
    isLoading,
    fetchFleets,
    sendFleet,
    recallFleet,
    getFleetCountdown,
  }
}
