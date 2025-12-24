import { requireAuth } from '~~/server/utils/auth'

// Store active connections
const connections = new Map<string, Set<ReadableStreamDefaultController>>()

export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const playerId = auth.playerId

  // Set up SSE headers
  setResponseHeaders(event, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  })

  // Create response stream
  const stream = new ReadableStream({
    start(controller) {
      // Add to connections
      if (!connections.has(playerId)) {
        connections.set(playerId, new Set())
      }
      connections.get(playerId)!.add(controller)

      // Send initial connection message
      const message = `data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`
      controller.enqueue(new TextEncoder().encode(message))

      // Send heartbeat every 30 seconds
      const heartbeat = setInterval(() => {
        try {
          const msg = `data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`
          controller.enqueue(new TextEncoder().encode(msg))
        } catch {
          clearInterval(heartbeat)
        }
      }, 30000)

      // Cleanup on close
      event.node.req.on('close', () => {
        clearInterval(heartbeat)
        const playerConnections = connections.get(playerId)
        if (playerConnections) {
          playerConnections.delete(controller)
          if (playerConnections.size === 0) {
            connections.delete(playerId)
          }
        }
        try {
          controller.close()
        } catch {
          // Already closed
        }
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
})

// Export function to send messages to a player
export function sendToPlayer(playerId: string, data: any) {
  const playerConnections = connections.get(playerId)
  if (!playerConnections) return

  const message = `data: ${JSON.stringify(data)}\n\n`
  const encoded = new TextEncoder().encode(message)

  for (const controller of playerConnections) {
    try {
      controller.enqueue(encoded)
    } catch {
      playerConnections.delete(controller)
    }
  }
}

// Export function to broadcast to all players
export function broadcast(data: any) {
  const message = `data: ${JSON.stringify(data)}\n\n`
  const encoded = new TextEncoder().encode(message)

  for (const [, playerConnections] of connections) {
    for (const controller of playerConnections) {
      try {
        controller.enqueue(encoded)
      } catch {
        playerConnections.delete(controller)
      }
    }
  }
}
