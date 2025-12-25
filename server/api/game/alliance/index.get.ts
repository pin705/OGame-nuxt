import { AllianceSchema } from '~~/server/models/alliance.schema'
import { PlayerSchema } from '~~/server/models/player.schema'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  
  // First, get the player without populating to check if they have an alliance
  const player = await PlayerSchema.findById(auth.playerId)
  
  if (!player) {
    throw createError({
      statusCode: 404,
      message: 'Player not found',
    })
  }
  
  if (!player.alliance) {
    return {
      success: true,
      hasAlliance: false,
    }
  }

  // Get the alliance ID (could be ObjectId or populated object)
  const allianceId = typeof player.alliance === 'object' && player.alliance._id 
    ? player.alliance._id 
    : player.alliance

  const alliance = await AllianceSchema.findById(allianceId)
    .populate('owner', 'username rank points')
    .populate('members', 'username rank points isOnline lastActive')
    .populate('applications.player', 'username rank points')

  if (!alliance) {
    // Alliance was deleted, clean up player reference
    player.alliance = null
    await player.save()
    return {
      success: true,
      hasAlliance: false,
    }
  }

  return {
    success: true,
    hasAlliance: true,
    data: alliance,
    isOwner: alliance.owner._id?.toString() === auth.playerId || alliance.owner.toString() === auth.playerId,
  }
})
