import { updateAllPlayersPoints } from '~/server/utils/points'

export default defineEventHandler(async (event) => {
  try {
    await updateAllPlayersPoints()
    return { success: true, message: 'Scores updated' }
  } catch (error) {
    return { success: false, error: 'Failed to update scores' }
  }
})
