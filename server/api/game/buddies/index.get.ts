import { requireAuth } from '~~/server/utils/auth'
import { BuddySchema } from '~~/server/models/buddy.schema'

/**
 * Get player's buddy list
 * GET /api/game/buddies
 */
export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)

  try {
    // Get accepted buddies (where current player is either requester or recipient)
    const buddies = await BuddySchema.find({
      $or: [
        { requester: auth.playerId, status: 'ACCEPTED' },
        { recipient: auth.playerId, status: 'ACCEPTED' },
      ],
    })
      .populate('requester', 'username rank level')
      .populate('recipient', 'username rank level')

    // Get pending requests (where current player is recipient)
    const pendingRequests = await BuddySchema.find({
      recipient: auth.playerId,
      status: 'PENDING',
    })
      .populate('requester', 'username rank level')

    // Get sent requests (where current player is requester)
    const sentRequests = await BuddySchema.find({
      requester: auth.playerId,
      status: 'PENDING',
    })
      .populate('recipient', 'username rank level')

    // Format buddy list
    const buddyList = buddies.map((buddy: any) => {
      const isRequester = buddy.requester._id.toString() === auth.playerId
      const friend = isRequester ? buddy.recipient : buddy.requester
      return {
        _id: buddy._id,
        friend: {
          _id: friend._id,
          username: friend.username,
          rank: friend.rank,
          level: friend.level,
        },
        acceptedAt: buddy.acceptedAt,
      }
    })

    return {
      success: true,
      data: {
        buddies: buddyList,
        pendingRequests: pendingRequests.map((req: any) => ({
          _id: req._id,
          from: {
            _id: req.requester._id,
            username: req.requester.username,
            rank: req.requester.rank,
            level: req.requester.level,
          },
          message: req.message,
          createdAt: req.createdAt,
        })),
        sentRequests: sentRequests.map((req: any) => ({
          _id: req._id,
          to: {
            _id: req.recipient._id,
            username: req.recipient.username,
            rank: req.recipient.rank,
            level: req.recipient.level,
          },
          message: req.message,
          createdAt: req.createdAt,
        })),
      },
    }
  } catch (error: any) {
    console.error('Buddy list error:', error)
    throw createError({
      statusCode: 500,
      message: 'Lỗi khi tải danh sách chiến hữu',
    })
  }
})
