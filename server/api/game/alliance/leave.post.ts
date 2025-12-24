import { AllianceSchema } from '~~/server/models/alliance.schema'
import { PlayerSchema } from '~~/server/models/player.schema'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  
  const player = await PlayerSchema.findById(auth.playerId)
  if (!player.alliance) {
    throw createError({
      statusCode: 400,
      message: 'You are not in an alliance',
    })
  }

  const alliance = await AllianceSchema.findById(player.alliance)
  
  if (alliance.owner.toString() === auth.playerId) {
    // If owner leaves, disband alliance (simple logic for now)
    // Ideally should transfer ownership or prevent leaving if members exist
    if (alliance.members.length > 1) {
      throw createError({
        statusCode: 400,
        message: 'You must transfer ownership before leaving',
      })
    }
    await AllianceSchema.findByIdAndDelete(alliance._id)
  } else {
    // Remove from members
    alliance.members = alliance.members.filter(
      (m: any) => m.toString() !== auth.playerId
    )
    await alliance.save()
  }

  player.alliance = null
  await player.save()

  return {
    success: true,
    message: 'Left alliance',
  }
})
