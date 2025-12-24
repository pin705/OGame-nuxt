import { MessageSchema } from '~~/server/models/message.schema'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const body = await readBody(event)
  const { messageIds } = body

  if (!Array.isArray(messageIds) || messageIds.length === 0) {
    throw createError({
      statusCode: 400,
      message: 'No messages selected',
    })
  }

  await MessageSchema.updateMany(
    {
      _id: { $in: messageIds },
      recipient: auth.playerId,
    },
    {
      $set: { isRead: true },
    }
  )

  return {
    success: true,
    message: 'Messages marked as read',
  }
})
