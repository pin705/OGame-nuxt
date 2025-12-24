import { MessageSchema } from '~~/server/models/message.schema'
import { PlayerSchema } from '~~/server/models/player.schema'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const body = await readBody(event)
  const { recipientName, subject, content } = body

  if (!recipientName || !subject || !content) {
    throw createError({
      statusCode: 400,
      message: 'Missing required fields',
    })
  }

  const recipient = await PlayerSchema.findOne({ username: recipientName })
  if (!recipient) {
    throw createError({
      statusCode: 404,
      message: 'Player not found',
    })
  }

  const message = await MessageSchema.create({
    sender: auth.playerId,
    recipient: recipient._id,
    type: 'PLAYER',
    subject,
    content,
    isRead: false,
  })

  return {
    success: true,
    message: 'Message sent',
    data: message,
  }
})
