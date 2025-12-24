import { AllianceSchema } from '~~/server/models/alliance.schema'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)
  const query = getQuery(event)
  const search = query.search as string

  const filter: any = {}
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { tag: { $regex: search, $options: 'i' } },
    ]
  }

  const alliances = await AllianceSchema.find(filter)
    .select('name tag members createdAt')
    .limit(20)

  return {
    success: true,
    data: alliances.map((a: any) => ({
      _id: a._id,
      name: a.name,
      tag: a.tag,
      memberCount: a.members.length,
      createdAt: a.createdAt,
    })),
  }
})
