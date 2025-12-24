import { PlayerSchema } from '~~/server/models/player.schema'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = Number(query.limit) || 100
  const page = Number(query.page) || 1
  const skip = (page - 1) * limit

  const players = await PlayerSchema.find({}, 'username rank points alliance')
    .sort({ points: -1 })
    .skip(skip)
    .limit(limit)
    .populate('alliance', 'name tag')

  const total = await PlayerSchema.countDocuments()

  return {
    success: true,
    data: players,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  }
})
