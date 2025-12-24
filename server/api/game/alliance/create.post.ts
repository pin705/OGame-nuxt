import { AllianceSchema } from '~~/server/models/alliance.schema'
import { PlayerSchema } from '~~/server/models/player.schema'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const body = await readBody(event)
  const { name, tag } = body

  if (!name || !tag) {
    throw createError({
      statusCode: 400,
      message: 'Name and Tag are required',
    })
  }

  // Check if player is already in an alliance
  const player = await PlayerSchema.findById(auth.playerId)
  if (player.alliance) {
    throw createError({
      statusCode: 400,
      message: 'You are already in an alliance',
    })
  }

  // Check if name or tag exists
  const existing = await AllianceSchema.findOne({
    $or: [{ name }, { tag }],
  })
  if (existing) {
    throw createError({
      statusCode: 400,
      message: 'Alliance name or tag already exists',
    })
  }

  const alliance = await AllianceSchema.create({
    name,
    tag,
    owner: auth.playerId,
    members: [auth.playerId],
  })

  // Update player
  player.alliance = alliance._id
  await player.save()

  return {
    success: true,
    data: alliance,
  }
})
