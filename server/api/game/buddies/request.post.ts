import { requireAuth } from '~~/server/utils/auth'
import { BuddySchema } from '~~/server/models/buddy.schema'
import { MessageSchema } from '~~/server/models/message.schema'

/**
 * Send buddy request
 * POST /api/game/buddies/request
 */
export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const body = await readBody(event)
  const { recipientName, message } = body

  if (!recipientName) {
    throw createError({
      statusCode: 400,
      message: 'Tên người chơi được yêu cầu',
    })
  }

  try {
    // Find recipient
    const recipient = await PlayerSchema.findOne({ 
      username: { $regex: new RegExp(`^${recipientName}$`, 'i') },
    })

    if (!recipient) {
      throw createError({
        statusCode: 404,
        message: 'Không tìm thấy người chơi',
      })
    }

    if (recipient._id.toString() === auth.playerId) {
      throw createError({
        statusCode: 400,
        message: 'Không thể gửi lời mời cho chính mình',
      })
    }

    // Check if buddy request already exists
    const existingRequest = await BuddySchema.findOne({
      $or: [
        { requester: auth.playerId, recipient: recipient._id },
        { requester: recipient._id, recipient: auth.playerId },
      ],
    })

    if (existingRequest) {
      if (existingRequest.status === 'ACCEPTED') {
        throw createError({
          statusCode: 400,
          message: 'Bạn đã là chiến hữu với người chơi này',
        })
      }
      if (existingRequest.status === 'PENDING') {
        throw createError({
          statusCode: 400,
          message: 'Đã có lời mời đang chờ xử lý',
        })
      }
      if (existingRequest.status === 'BLOCKED') {
        throw createError({
          statusCode: 400,
          message: 'Không thể gửi lời mời',
        })
      }
    }

    // Create buddy request
    const buddy = await BuddySchema.create({
      requester: auth.playerId,
      recipient: recipient._id,
      message: message?.substring(0, 200),
      status: 'PENDING',
    })

    // Send notification message
    const requester = await PlayerSchema.findById(auth.playerId)
    await MessageSchema.create({
      recipient: recipient._id,
      type: 'SYSTEM',
      subject: 'Lời mời chiến hữu mới',
      content: `${requester?.username} muốn trở thành chiến hữu với bạn. ${message ? `Tin nhắn: "${message}"` : ''}`,
      relatedId: buddy._id,
    })

    return {
      success: true,
      message: 'Đã gửi lời mời chiến hữu',
    }
  } catch (error: any) {
    console.error('Buddy request error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Lỗi khi gửi lời mời',
    })
  }
})
