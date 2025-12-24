import { MessageSchema } from '~~/server/models/message.schema'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const query = getQuery(event)
  
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 20
  const type = query.type as string
  const skip = (page - 1) * limit

  const filter: any = { recipient: auth.playerId }
  if (type && type !== 'ALL') {
    filter.type = type
  }

  const messages = await MessageSchema.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'username')

  const total = await MessageSchema.countDocuments(filter)
  const unread = await MessageSchema.countDocuments({ recipient: auth.playerId, isRead: false })

  return {
    success: true,
    data: messages,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    },
    unreadTotal: unread
  }
})
