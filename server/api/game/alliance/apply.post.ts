import { AllianceSchema } from '~~/server/models/alliance.schema'
import { PlayerSchema } from '~~/server/models/player.schema'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const body = await readBody(event)
  const { allianceId, message } = body

  const player = await PlayerSchema.findById(auth.playerId)
  if (player.alliance) {
    throw createError({
      statusCode: 400,
      message: 'You are already in an alliance',
    })
  }

  const alliance = await AllianceSchema.findById(allianceId)
  if (!alliance) {
    throw createError({
      statusCode: 404,
      message: 'Alliance not found',
    })
  }

  // Check if already applied
  const existingApp = alliance.applications.find(
    (app: any) => app.player.toString() === auth.playerId
  )
  if (existingApp) {
    throw createError({
      statusCode: 400,
      message: 'You have already applied to this alliance',
    })
  }

  alliance.applications.push({
    player: auth.playerId,
    message: message || '',
    createdAt: new Date(),
  })

  await alliance.save()

  return {
    success: true,
    message: 'Application sent',
  }
})
