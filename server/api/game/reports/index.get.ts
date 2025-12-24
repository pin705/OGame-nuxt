import { requireAuth } from '~~/server/utils/auth'

// Get battle reports for the player
export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10

  try {
    const reports = await BattleReportSchema.find({
      $or: [
        { attacker: auth.playerId },
        { defender: auth.playerId },
      ],
    })
      .sort({ battleTime: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('attacker', 'username')
      .populate('defender', 'username')

    const total = await BattleReportSchema.countDocuments({
      $or: [
        { attacker: auth.playerId },
        { defender: auth.playerId },
      ],
    })

    const formattedReports = reports.map((report: any) => {
      const isAttacker = report.attacker._id.toString() === auth.playerId
      
      return {
        id: report._id,
        battleTime: report.battleTime,
        isAttacker,
        opponent: isAttacker ? report.defender.username : report.attacker.username,
        result: {
          won: isAttacker ? report.result.attackerWins : report.result.defenderWins,
          lost: isAttacker ? report.result.defenderWins : report.result.attackerWins,
          draw: report.result.draw,
        },
        coordinates: {
          attacker: report.attackerPlanet,
          defender: report.defenderPlanet,
        },
        loot: isAttacker ? report.loot : null,
        rounds: report.result.rounds,
        isRead: isAttacker ? report.isRead.attacker : report.isRead.defender,
      }
    })

    return {
      success: true,
      data: {
        reports: formattedReports,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    }
  } catch (error: any) {
    console.error('Get battle reports error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to get battle reports',
    })
  }
})
