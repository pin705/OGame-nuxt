// WebSocket composable for real-time game events
export interface GameEvent {
  type: 
    | 'auth_success'
    | 'pong'
    | 'subscribed'
    | 'resource_update' 
    | 'building_complete' 
    | 'research_complete' 
    | 'ship_complete'
    | 'fleet_update' 
    | 'attack_incoming' 
    | 'message'
    | 'battle_report'
    | 'spy_report'
  data?: Record<string, unknown>
  timestamp: number
}

type EventCallback = (event: GameEvent) => void

export const useWebSocket = () => {
  const ws = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const isAuthenticated = ref(false)
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = 10
  const listeners = new Map<string, Set<EventCallback>>()
  
  let reconnectTimeout: ReturnType<typeof setTimeout> | null = null
  let pingInterval: ReturnType<typeof setInterval> | null = null

  /**
   * Get WebSocket URL based on current location
   */
  const getWsUrl = () => {
    if (import.meta.client) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      return `${protocol}//${window.location.host}/_ws`
    }
    return ''
  }

  /**
   * Connect to WebSocket server
   */
  const connect = (playerId: string) => {
    if (!import.meta.client) return
    if (ws.value?.readyState === WebSocket.OPEN) return

    const url = getWsUrl()
    if (!url) return

    try {
      ws.value = new WebSocket(url)

      ws.value.onopen = () => {
        console.log('[WebSocket] Connected')
        isConnected.value = true
        reconnectAttempts.value = 0
        
        // Authenticate with playerId
        ws.value?.send(JSON.stringify({
          type: 'auth',
          playerId,
        }))

        // Start ping interval to keep connection alive
        startPing()
      }

      ws.value.onmessage = (event) => {
        try {
          const data: GameEvent = JSON.parse(event.data)
          handleEvent(data)
        } catch (err) {
          console.error('[WebSocket] Failed to parse message:', err)
        }
      }

      ws.value.onclose = (event) => {
        console.log('[WebSocket] Disconnected:', event.code, event.reason)
        isConnected.value = false
        isAuthenticated.value = false
        stopPing()

        // Attempt reconnect if not a clean close
        if (event.code !== 1000 && reconnectAttempts.value < maxReconnectAttempts) {
          scheduleReconnect(playerId)
        }
      }

      ws.value.onerror = (error) => {
        console.error('[WebSocket] Error:', error)
      }
    } catch (err) {
      console.error('[WebSocket] Failed to connect:', err)
      scheduleReconnect(playerId)
    }
  }

  /**
   * Schedule a reconnection attempt with exponential backoff
   */
  const scheduleReconnect = (playerId: string) => {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout)
    }

    reconnectAttempts.value++
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.value), 30000)
    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttempts.value})`)

    reconnectTimeout = setTimeout(() => {
      connect(playerId)
    }, delay)
  }

  /**
   * Start ping interval for keepalive
   */
  const startPing = () => {
    stopPing()
    pingInterval = setInterval(() => {
      if (ws.value?.readyState === WebSocket.OPEN) {
        ws.value.send(JSON.stringify({ type: 'ping' }))
      }
    }, 25000) // Ping every 25 seconds
  }

  /**
   * Stop ping interval
   */
  const stopPing = () => {
    if (pingInterval) {
      clearInterval(pingInterval)
      pingInterval = null
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  const disconnect = () => {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout)
      reconnectTimeout = null
    }
    stopPing()

    if (ws.value) {
      ws.value.close(1000, 'Client disconnect')
      ws.value = null
    }
    isConnected.value = false
    isAuthenticated.value = false
    reconnectAttempts.value = 0
  }

  /**
   * Subscribe to game event channels
   */
  const subscribe = () => {
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify({ type: 'subscribe' }))
    }
  }

  /**
   * Handle incoming events
   */
  const handleEvent = (event: GameEvent) => {
    // Handle auth success
    if (event.type === 'auth_success') {
      isAuthenticated.value = true
      subscribe()
      return
    }

    // Notify type-specific listeners
    const typeListeners = listeners.get(event.type)
    if (typeListeners) {
      for (const callback of typeListeners) {
        try {
          callback(event)
        } catch (err) {
          console.error('[WebSocket] Error in event listener:', err)
        }
      }
    }

    // Notify global listeners
    const globalListeners = listeners.get('*')
    if (globalListeners) {
      for (const callback of globalListeners) {
        try {
          callback(event)
        } catch (err) {
          console.error('[WebSocket] Error in global listener:', err)
        }
      }
    }
  }

  /**
   * Subscribe to specific event type
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
  const onAll = (callback: EventCallback) => {
    return on('*', callback)
  }

  /**
   * Remove all listeners for a type
   */
  const off = (type: string) => {
    listeners.delete(type)
  }

  /**
   * Remove all listeners
   */
  const offAll = () => {
    listeners.clear()
  }

  /**
   * Send a message through WebSocket
   */
  const send = (data: Record<string, unknown>) => {
    if (ws.value?.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify(data))
      return true
    }
    return false
  }

  return {
    // State
    isConnected: readonly(isConnected),
    isAuthenticated: readonly(isAuthenticated),
    reconnectAttempts: readonly(reconnectAttempts),

    // Actions
    connect,
    disconnect,
    subscribe,
    send,

    // Event handlers
    on,
    onAll,
    off,
    offAll,
  }
}
