// WebSocket handler for real-time game events

// Define Peer interface for WebSocket handler
interface WSPeer {
  id: string
  send: (message: string) => void
  subscribe: (channel: string) => void
}

// Store active player connections: playerId -> Set of peers
const playerConnections = new Map<string, Set<WSPeer>>()

// Store peer -> playerId mapping for cleanup
const peerToPlayer = new Map<WSPeer, string>()

export default defineWebSocketHandler({
  open(peer) {
    console.log('[WS] New connection:', peer.id)
  },

  message(peer, message) {
    try {
      const data = JSON.parse(message.text())
      
      // Handle authentication message
      if (data.type === 'auth') {
        const playerId = data.playerId
        if (playerId) {
          // Store the connection
          if (!playerConnections.has(playerId)) {
            playerConnections.set(playerId, new Set())
          }
          playerConnections.get(playerId)!.add(peer as unknown as WSPeer)
          peerToPlayer.set(peer as unknown as WSPeer, playerId)
          
          console.log(`[WS] Player ${playerId} authenticated`)
          
          // Send confirmation
          peer.send(JSON.stringify({
            type: 'auth_success',
            timestamp: Date.now(),
          }))
        }
        return
      }

      // Handle ping/pong for keepalive
      if (data.type === 'ping') {
        peer.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }))
        return
      }

      // Handle subscription to specific channels
      if (data.type === 'subscribe') {
        const playerId = peerToPlayer.get(peer as unknown as WSPeer)
        if (playerId) {
          // Subscribe to specific game events
          peer.subscribe(`player:${playerId}`)
          peer.subscribe('global')
          peer.send(JSON.stringify({
            type: 'subscribed',
            channels: [`player:${playerId}`, 'global'],
          }))
        }
        return
      }

    } catch (err) {
      console.error('[WS] Error parsing message:', err)
    }
  },

  close(peer, event) {
    const playerId = peerToPlayer.get(peer as unknown as WSPeer)
    if (playerId) {
      const connections = playerConnections.get(playerId)
      if (connections) {
        connections.delete(peer as unknown as WSPeer)
        if (connections.size === 0) {
          playerConnections.delete(playerId)
        }
      }
      peerToPlayer.delete(peer as unknown as WSPeer)
      console.log(`[WS] Player ${playerId} disconnected:`, event.code, event.reason)
    }
  },

  error(peer, error) {
    console.error('[WS] Error:', error)
  },
})

// Export functions to send messages from other parts of the server

/**
 * Send a message to a specific player
 */
export function sendToPlayer(playerId: string, data: Record<string, unknown>) {
  const connections = playerConnections.get(playerId)
  if (!connections || connections.size === 0) {
    return false
  }

  const message = JSON.stringify(data)
  for (const peer of connections) {
    try {
      peer.send(message)
    } catch (err) {
      console.error('[WS] Failed to send to player:', err)
      connections.delete(peer)
    }
  }
  return true
}

/**
 * Send a message to all connected players
 */
export function broadcast(data: Record<string, unknown>, excludePlayerId?: string) {
  const message = JSON.stringify(data)
  for (const [playerId, connections] of playerConnections) {
    if (playerId === excludePlayerId) continue
    for (const peer of connections) {
      try {
        peer.send(message)
      } catch (err) {
        console.error('[WS] Failed to broadcast:', err)
        connections.delete(peer)
      }
    }
  }
}

/**
 * Get the number of connected players
 */
export function getConnectedPlayerCount(): number {
  return playerConnections.size
}

/**
 * Check if a player is connected
 */
export function isPlayerConnected(playerId: string): boolean {
  const connections = playerConnections.get(playerId)
  return !!connections && connections.size > 0
}

// Game-specific event emitters

/**
 * Notify player about resource update
 */
export function notifyResourceUpdate(playerId: string, resources: Record<string, number>) {
  sendToPlayer(playerId, {
    type: 'resource_update',
    data: resources,
    timestamp: Date.now(),
  })
}

/**
 * Notify player about building completion
 */
export function notifyBuildingComplete(playerId: string, building: Record<string, unknown>) {
  sendToPlayer(playerId, {
    type: 'building_complete',
    data: building,
    timestamp: Date.now(),
  })
}

/**
 * Notify player about research completion
 */
export function notifyResearchComplete(playerId: string, research: Record<string, unknown>) {
  sendToPlayer(playerId, {
    type: 'research_complete',
    data: research,
    timestamp: Date.now(),
  })
}

/**
 * Notify player about ship construction completion
 */
export function notifyShipComplete(playerId: string, ship: Record<string, unknown>) {
  sendToPlayer(playerId, {
    type: 'ship_complete',
    data: ship,
    timestamp: Date.now(),
  })
}

/**
 * Notify player about fleet update (arrival, return, etc)
 */
export function notifyFleetUpdate(playerId: string, fleet: Record<string, unknown>) {
  sendToPlayer(playerId, {
    type: 'fleet_update',
    data: fleet,
    timestamp: Date.now(),
  })
}

/**
 * Notify player about incoming attack
 */
export function notifyAttackIncoming(playerId: string, attack: Record<string, unknown>) {
  sendToPlayer(playerId, {
    type: 'attack_incoming',
    data: attack,
    timestamp: Date.now(),
  })
}

/**
 * Notify player about a new message
 */
export function notifyNewMessage(playerId: string, message: Record<string, unknown>) {
  sendToPlayer(playerId, {
    type: 'message',
    data: message,
    timestamp: Date.now(),
  })
}

/**
 * Notify player about battle report
 */
export function notifyBattleReport(playerId: string, report: Record<string, unknown>) {
  sendToPlayer(playerId, {
    type: 'battle_report',
    data: report,
    timestamp: Date.now(),
  })
}

/**
 * Notify player about spy report
 */
export function notifySpyReport(playerId: string, report: Record<string, unknown>) {
  sendToPlayer(playerId, {
    type: 'spy_report',
    data: report,
    timestamp: Date.now(),
  })
}
