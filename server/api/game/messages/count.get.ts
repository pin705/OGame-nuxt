import { MessageSchema } from '~~/server/models/message.schema'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  
  const count = await MessageSchema.countDocuments({
    recipient: auth.playerId,
    isRead: false,
  })

  return {
    success: true,
    count,
  }
})
