/**
 * Composable for real-time countdown timer
 * Updates every second and provides formatted time strings
 */
export const useCountdown = () => {
  // Store multiple countdowns by key
  const countdowns = useState<Record<string, number>>('countdowns', () => ({}))
  
  // Interval reference
  let intervalId: ReturnType<typeof setInterval> | null = null
  
  // Register a countdown with end time
  const registerCountdown = (key: string, endTime: Date | string | number) => {
    const end = new Date(endTime).getTime()
    const now = Date.now()
    const remaining = Math.max(0, Math.floor((end - now) / 1000))
    countdowns.value[key] = remaining
  }
  
  // Register multiple countdowns from queue data
  const registerFromQueue = (buildQueue: {
    building?: { endTime: string | Date; isComplete?: boolean } | null
    research?: { endTime: string | Date; isComplete?: boolean } | null
    ships?: Array<{ endTime: string | Date; isComplete?: boolean }>
    defenses?: Array<{ endTime: string | Date; isComplete?: boolean }>
  } | null) => {
    if (!buildQueue) return
    
    // Building queue
    if (buildQueue.building && !buildQueue.building.isComplete) {
      registerCountdown('building', buildQueue.building.endTime)
    } else {
      delete countdowns.value['building']
    }
    
    // Research queue
    if (buildQueue.research && !buildQueue.research.isComplete) {
      registerCountdown('research', buildQueue.research.endTime)
    } else {
      delete countdowns.value['research']
    }
    
    // Ships queue (multiple)
    if (buildQueue.ships?.length) {
      buildQueue.ships.forEach((ship, index) => {
        if (!ship.isComplete) {
          registerCountdown(`ship_${index}`, ship.endTime)
        }
      })
    }
    
    // Defense queue (multiple)
    if (buildQueue.defenses?.length) {
      buildQueue.defenses.forEach((defense, index) => {
        if (!defense.isComplete) {
          registerCountdown(`defense_${index}`, defense.endTime)
        }
      })
    }
  }
  
  // Start the global countdown ticker
  const startTicker = () => {
    if (intervalId) return // Already running
    
    intervalId = setInterval(() => {
      const keys = Object.keys(countdowns.value)
      keys.forEach(key => {
        if (countdowns.value[key] > 0) {
          countdowns.value[key]--
        }
      })
    }, 1000)
  }
  
  // Stop the ticker
  const stopTicker = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }
  
  // Get remaining seconds for a key
  const getRemaining = (key: string): number => {
    return countdowns.value[key] || 0
  }
  
  // Format seconds to HH:MM:SS
  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return '00:00'
    
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    
    if (h > 0) {
      return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }
    return `${m}:${String(s).padStart(2, '0')}`
  }
  
  // Format seconds to Vietnamese readable
  const formatTimeVi = (seconds: number): string => {
    if (seconds <= 0) return 'Hoàn thành'
    
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    
    if (h > 0) {
      return `${h}h ${m}m ${s}s`
    }
    if (m > 0) {
      return `${m}m ${s}s`
    }
    return `${s}s`
  }
  
  // Get progress percentage (0-100)
  const getProgress = (key: string, totalSeconds: number): number => {
    const remaining = getRemaining(key)
    if (totalSeconds <= 0) return 100
    return Math.max(0, Math.min(100, ((totalSeconds - remaining) / totalSeconds) * 100))
  }
  
  // Computed helpers for common queues
  const buildingRemaining = computed(() => getRemaining('building'))
  const buildingFormatted = computed(() => formatTime(buildingRemaining.value))
  const buildingFormattedVi = computed(() => formatTimeVi(buildingRemaining.value))
  
  const researchRemaining = computed(() => getRemaining('research'))
  const researchFormatted = computed(() => formatTime(researchRemaining.value))
  const researchFormattedVi = computed(() => formatTimeVi(researchRemaining.value))
  
  const shipRemaining = computed(() => getRemaining('ship_0'))
  const shipFormatted = computed(() => formatTime(shipRemaining.value))
  const shipFormattedVi = computed(() => formatTimeVi(shipRemaining.value))
  
  return {
    countdowns,
    registerCountdown,
    registerFromQueue,
    startTicker,
    stopTicker,
    getRemaining,
    formatTime,
    formatTimeVi,
    getProgress,
    // Common helpers
    buildingRemaining,
    buildingFormatted,
    buildingFormattedVi,
    researchRemaining,
    researchFormatted,
    researchFormattedVi,
    shipRemaining,
    shipFormatted,
    shipFormattedVi,
  }
}
