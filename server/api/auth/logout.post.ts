import { clearAuthCookie, getAuthPlayer } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const player = await getAuthPlayer(event)

  if (player) {
    // Update player status
    try {
      await PlayerSchema.findByIdAndUpdate(player.playerId, {
        isOnline: false,
        lastActive: new Date(),
      })
    } catch (error) {
      console.error('Error updating player status on logout:', error)
    }
  }

  // Clear auth cookie
  clearAuthCookie(event)

  return {
    success: true,
    message: 'Logged out successfully',
  }
})
