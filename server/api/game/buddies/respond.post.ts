import { requireAuth } from '~~/server/utils/auth'
import { BuddySchema } from '~~/server/models/buddy.schema'
import { MessageSchema } from '~~/server/models/message.schema'

/**
 * Respond to buddy request (accept/reject/block)
 * POST /api/game/buddies/respond
 */
export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const body = await readBody(event)
  const { requestId, action } = body

  if (!requestId || !action) {
    throw createError({
      statusCode: 400,
      message: 'Request ID và hành động được yêu cầu',
    })
  }

  if (!['ACCEPT', 'REJECT', 'BLOCK'].includes(action)) {
    throw createError({
      statusCode: 400,
      message: 'Hành động không hợp lệ',
    })
  }

  try {
    const buddyRequest = await BuddySchema.findById(requestId)
      .populate('requester', 'username')

    if (!buddyRequest) {
      throw createError({
        statusCode: 404,
        message: 'Không tìm thấy lời mời',
      })
    }

    if (buddyRequest.recipient.toString() !== auth.playerId) {
      throw createError({
        statusCode: 403,
        message: 'Không có quyền xử lý lời mời này',
      })
    }

    if (buddyRequest.status !== 'PENDING') {
      throw createError({
        statusCode: 400,
        message: 'Lời mời đã được xử lý',
      })
    }

    // Update status
    if (action === 'ACCEPT') {
      buddyRequest.status = 'ACCEPTED'
      buddyRequest.acceptedAt = new Date()
      await buddyRequest.save()

      // Notify requester
      const recipient = await PlayerSchema.findById(auth.playerId)
      await MessageSchema.create({
        recipient: buddyRequest.requester._id,
        type: 'SYSTEM',
        subject: 'Lời mời chiến hữu đã được chấp nhận!',
        content: `${recipient?.username} đã chấp nhận trở thành chiến hữu của bạn.`,
      })

      return {
        success: true,
        message: 'Đã chấp nhận lời mời chiến hữu',
      }
    } else if (action === 'REJECT') {
      await BuddySchema.findByIdAndDelete(requestId)
      return {
        success: true,
        message: 'Đã từ chối lời mời',
      }
    } else if (action === 'BLOCK') {
      buddyRequest.status = 'BLOCKED'
      await buddyRequest.save()
      return {
        success: true,
        message: 'Đã chặn người chơi',
      }
    }
  } catch (error: any) {
    console.error('Buddy respond error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Lỗi khi xử lý lời mời',
    })
  }
})
