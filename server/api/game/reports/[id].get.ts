import { requireAuth } from '~~/server/utils/auth'

// Get a specific battle report
export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const reportId = getRouterParam(event, 'id')

  if (!reportId) {
    throw createError({
      statusCode: 400,
      message: 'Report ID is required',
    })
  }

  try {
    const report = await BattleReportSchema.findById(reportId)
      .populate('attacker', 'username')
      .populate('defender', 'username')

    if (!report) {
      throw createError({
        statusCode: 404,
        message: 'Battle report not found',
      })
    }

    // Check access
    const isAttacker = report.attacker._id.toString() === auth.playerId
    const isDefender = report.defender._id.toString() === auth.playerId

    if (!isAttacker && !isDefender) {
      throw createError({
        statusCode: 403,
        message: 'Access denied',
      })
    }

    // Mark as read
    if (isAttacker && !report.isRead.attacker) {
      report.isRead.attacker = true
      await report.save()
    } else if (isDefender && !report.isRead.defender) {
      report.isRead.defender = true
      await report.save()
    }

    return {
      success: true,
      data: {
        id: report._id,
        battleTime: report.battleTime,
        attacker: {
          username: report.attacker.username,
          planet: report.attackerPlanet,
        },
        defender: {
          username: report.defender.username,
          planet: report.defenderPlanet,
        },
        result: report.result,
        attackerFleet: report.attackerFleet,
        defenderFleet: report.defenderFleet,
        defenderDefenses: report.defenderDefenses,
        loot: report.loot,
        debrisField: report.debrisField,
        isAttacker,
      },
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('Get battle report error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to get battle report',
    })
  }
})
