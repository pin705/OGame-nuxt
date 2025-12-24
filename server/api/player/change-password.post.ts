import { requireAuth, hashPassword, comparePassword } from '~~/server/utils/auth'

/**
 * Change player password
 * POST /api/player/change-password
 */
export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const body = await readBody(event)
  const { currentPassword, newPassword, confirmPassword } = body

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw createError({
      statusCode: 400,
      message: 'Vui lòng điền đầy đủ thông tin',
    })
  }

  if (newPassword !== confirmPassword) {
    throw createError({
      statusCode: 400,
      message: 'Mật khẩu xác nhận không khớp',
    })
  }

  if (newPassword.length < 6) {
    throw createError({
      statusCode: 400,
      message: 'Mật khẩu mới phải có ít nhất 6 ký tự',
    })
  }

  try {
    const player = await PlayerSchema.findById(auth.playerId)
    if (!player) {
      throw createError({
        statusCode: 404,
        message: 'Người chơi không tồn tại',
      })
    }

    // Verify current password
    const isValidPassword = await comparePassword(currentPassword, player.passwordHash)
    if (!isValidPassword) {
      throw createError({
        statusCode: 400,
        message: 'Mật khẩu hiện tại không đúng',
      })
    }

    // Hash new password
    player.passwordHash = await hashPassword(newPassword)
    await player.save()

    return {
      success: true,
      message: 'Đổi mật khẩu thành công',
    }
  } catch (error: any) {
    console.error('Password change error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Lỗi khi đổi mật khẩu',
    })
  }
})
