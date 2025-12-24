import { requireAuth } from '~/server/utils/auth'
import { BuddySchema } from '~/server/models/buddy.schema'

/**
 * Remove a buddy from friend list
 * POST /api/game/buddies/remove
 */
export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const body = await readBody(event)

  const { buddyId } = body

  if (!buddyId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Thiếu buddyId',
    })
  }

  try {
    // Find the buddy relationship
    const buddy = await BuddySchema.findById(buddyId)

    if (!buddy) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Không tìm thấy chiến hữu',
      })
    }

    // Check if current player is part of this relationship
    const isRequester = buddy.requester.toString() === auth.playerId
    const isRecipient = buddy.recipient.toString() === auth.playerId

    if (!isRequester && !isRecipient) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Bạn không có quyền xóa chiến hữu này',
      })
    }

    // Delete the buddy relationship
    await BuddySchema.findByIdAndDelete(buddyId)

    return {
      success: true,
      message: 'Đã xóa chiến hữu thành công',
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error

    console.error('[BUDDY_REMOVE]', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Lỗi khi xóa chiến hữu',
    })
  }
})
