import { AllianceSchema } from '~~/server/models/alliance.schema'
import { PlayerSchema } from '~~/server/models/player.schema'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  
  const player = await PlayerSchema.findById(auth.playerId).populate('alliance')
  
  if (!player.alliance) {
    return {
      success: true,
      hasAlliance: false,
    }
  }

  const alliance = await AllianceSchema.findById(player.alliance._id)
    .populate('members', 'username rank points isOnline lastActive')
    .populate('applications.player', 'username rank points')

  return {
    success: true,
    hasAlliance: true,
    data: alliance,
    isOwner: alliance.owner.toString() === auth.playerId,
  }
})
