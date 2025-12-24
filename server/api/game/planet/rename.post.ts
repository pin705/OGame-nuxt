import { requireAuth } from '~~/server/utils/auth'

/**
 * Rename a planet
 * POST /api/game/planet/rename
 */
export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const body = await readBody(event)
  const { planetId, newName } = body

  if (!planetId || !newName) {
    throw createError({
      statusCode: 400,
      message: 'Planet ID và tên mới được yêu cầu',
    })
  }

  // Validate name
  const trimmedName = newName.trim()
  if (trimmedName.length < 2 || trimmedName.length > 30) {
    throw createError({
      statusCode: 400,
      message: 'Tên hành tinh phải từ 2-30 ký tự',
    })
  }

  // Check for invalid characters
  if (!/^[\p{L}\p{N}\s\-_]+$/u.test(trimmedName)) {
    throw createError({
      statusCode: 400,
      message: 'Tên hành tinh chứa ký tự không hợp lệ',
    })
  }

  try {
    const planet = await PlanetSchema.findById(planetId)
    
    if (!planet) {
      throw createError({
        statusCode: 404,
        message: 'Hành tinh không tồn tại',
      })
    }

    if (planet.owner.toString() !== auth.playerId) {
      throw createError({
        statusCode: 403,
        message: 'Không có quyền đổi tên hành tinh này',
      })
    }

    const oldName = planet.name
    planet.name = trimmedName
    await planet.save()

    return {
      success: true,
      message: `Đã đổi tên hành tinh từ "${oldName}" thành "${trimmedName}"`,
      data: {
        name: trimmedName,
      },
    }
  } catch (error: any) {
    console.error('Planet rename error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Lỗi khi đổi tên hành tinh',
    })
  }
})
