import { requireAuth } from '~~/server/utils/auth'
import { BuddySchema } from '~~/server/models/buddy.schema'

/**
 * Cancel a pending buddy request
 * POST /api/game/buddies/cancel
 */
export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const body = await readBody(event)

  const { requestId } = body

  if (!requestId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Thiếu requestId',
    })
  }

  try {
    // Find the pending request
    const request = await BuddySchema.findOne({
      _id: requestId,
      requester: auth.playerId,
      status: 'PENDING',
    })

    if (!request) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Không tìm thấy lời mời hoặc lời mời đã được xử lý',
      })
    }

    // Delete the pending request
    await BuddySchema.findByIdAndDelete(requestId)

    return {
      success: true,
      message: 'Đã hủy lời mời thành công',
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error

    console.error('[BUDDY_CANCEL]', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Lỗi khi hủy lời mời',
    })
  }
})
