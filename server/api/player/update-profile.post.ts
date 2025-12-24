import { requireAuth } from '~~/server/utils/auth'
import { hashPassword, comparePassword } from '~~/server/utils/auth'

/**
 * Update player profile
 * POST /api/player/update-profile
 */
export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const body = await readBody(event)
  const { email } = body

  try {
    const player = await PlayerSchema.findById(auth.playerId)
    if (!player) {
      throw createError({
        statusCode: 404,
        message: 'Người chơi không tồn tại',
      })
    }

    // Update email if provided
    if (email) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw createError({
          statusCode: 400,
          message: 'Email không hợp lệ',
        })
      }

      // Check if email is already taken
      const existingPlayer = await PlayerSchema.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: auth.playerId },
      })
      if (existingPlayer) {
        throw createError({
          statusCode: 400,
          message: 'Email đã được sử dụng',
        })
      }

      player.email = email.toLowerCase()
    }

    await player.save()

    return {
      success: true,
      message: 'Cập nhật thông tin thành công',
      data: {
        email: player.email,
      },
    }
  } catch (error: any) {
    console.error('Profile update error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Lỗi khi cập nhật thông tin',
    })
  }
})
