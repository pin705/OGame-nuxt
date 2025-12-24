import { AllianceSchema } from '~~/server/models/alliance.schema'
import { PlayerSchema } from '~~/server/models/player.schema'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const body = await readBody(event)
  const { applicationId, action } = body // action: 'ACCEPT' | 'REJECT'

  const alliance = await AllianceSchema.findOne({ owner: auth.playerId })
  if (!alliance) {
    throw createError({
      statusCode: 403,
      message: 'Only alliance owner can manage applications',
    })
  }

  const appIndex = alliance.applications.findIndex(
    (app: any) => app._id.toString() === applicationId
  )

  if (appIndex === -1) {
    throw createError({
      statusCode: 404,
      message: 'Application not found',
    })
  }

  const app = alliance.applications[appIndex]

  if (action === 'ACCEPT') {
    const player = await PlayerSchema.findById(app.player)
    if (player && !player.alliance) {
      player.alliance = alliance._id
      await player.save()
      
      alliance.members.push(player._id)
    }
  }

  // Remove application
  alliance.applications.splice(appIndex, 1)
  await alliance.save()

  return {
    success: true,
    message: action === 'ACCEPT' ? 'Member accepted' : 'Application rejected',
  }
})
