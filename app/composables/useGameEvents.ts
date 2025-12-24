export interface GameEvent {
  type: 'connected' | 'heartbeat' | 'resource_update' | 'building_complete' | 'research_complete' | 'fleet_update' | 'attack_incoming' | 'message'
  data?: any
  timestamp: number
}

type EventCallback = (event: GameEvent) => void

export const useGameEvents = () => {
  const eventSource = ref<EventSource | null>(null)
  const isConnected = ref(false)
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = 5
  const listeners = new Map<string, Set<EventCallback>>()

  /**
   * Connect to the SSE stream
   */
  const connect = () => {
    if (eventSource.value) {
      return
    }

    try {
      eventSource.value = new EventSource('/api/game/events', {
        withCredentials: true,
      })

      eventSource.value.onopen = () => {
        isConnected.value = true
        reconnectAttempts.value = 0
        console.log('[GameEvents] Connected to event stream')
      }

      eventSource.value.onmessage = (e) => {
        try {
          const event: GameEvent = JSON.parse(e.data)
          handleEvent(event)
        } catch (err) {
          console.error('[GameEvents] Failed to parse event:', err)
        }
      }

      eventSource.value.onerror = () => {
        isConnected.value = false
        eventSource.value?.close()
        eventSource.value = null

        // Attempt reconnect
        if (reconnectAttempts.value < maxReconnectAttempts) {
          reconnectAttempts.value++
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.value), 30000)
          console.log(`[GameEvents] Reconnecting in ${delay}ms (attempt ${reconnectAttempts.value})`)
          setTimeout(connect, delay)
        } else {
          console.error('[GameEvents] Max reconnect attempts reached')
        }
      }
    } catch (err) {
      console.error('[GameEvents] Failed to connect:', err)
    }
  }

  /**
   * Disconnect from the SSE stream
   */
  const disconnect = () => {
    if (eventSource.value) {
      eventSource.value.close()
      eventSource.value = null
      isConnected.value = false
      console.log('[GameEvents] Disconnected from event stream')
    }
  }

  /**
   * Handle incoming events
   */
  const handleEvent = (event: GameEvent) => {
    // Notify type-specific listeners
    const typeListeners = listeners.get(event.type)
    if (typeListeners) {
      for (const callback of typeListeners) {
        callback(event)
      }
    }

    // Notify global listeners
    const globalListeners = listeners.get('*')
    if (globalListeners) {
      for (const callback of globalListeners) {
        callback(event)
      }
    }
  }

  /**
   * Subscribe to events
   */
  const on = (type: string, callback: EventCallback) => {
    if (!listeners.has(type)) {
      listeners.set(type, new Set())
    }
    listeners.get(type)!.add(callback)

    // Return unsubscribe function
    return () => {
      listeners.get(type)?.delete(callback)
    }
  }

  /**
   * Subscribe to all events
   */
  const onAny = (callback: EventCallback) => {
    return on('*', callback)
  }

  // Auto-disconnect on unmount
  onUnmounted(() => {
    disconnect()
  })

  return {
    isConnected: readonly(isConnected),
    connect,
    disconnect,
    on,
    onAny,
  }
}
