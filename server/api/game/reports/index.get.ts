import { requireAuth } from '~~/server/utils/auth'
import { BattleReportSchema } from '~/server/models/battle-report.schema'
import { EspionageReportSchema } from '~/server/models/espionage-report.schema'

// Get reports for the player
export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10
  const skip = (page - 1) * limit

  try {
    // Fetch Battle Reports
    const battleReportsPromise = BattleReportSchema.find({
      $or: [{ attacker: auth.playerId }, { defender: auth.playerId }],
    })
      .sort({ createdAt: -1 })
      .limit(limit + skip)
      .populate('attacker', 'username')
      .populate('defender', 'username')
      .lean()

    // Fetch Espionage Reports
    const espionageReportsPromise = EspionageReportSchema.find({
      $or: [{ attacker: auth.playerId }, { defender: auth.playerId }],
    })
      .sort({ createdAt: -1 })
      .limit(limit + skip)
      .populate('attacker', 'username')
      .populate('defender', 'username')
      .lean()

    const [battleReports, espionageReports] = await Promise.all([
      battleReportsPromise,
      espionageReportsPromise
    ])

    // Combine and sort
    const allReports = [
      ...battleReports.map((r: any) => ({ ...r, type: 'BATTLE', time: r.battleTime || r.createdAt })),
      ...espionageReports.map((r: any) => ({ ...r, type: 'ESPIONAGE', time: r.createdAt }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

    // Paginate
    const paginatedReports = allReports.slice(skip, skip + limit)

    // Format
    const formattedReports = paginatedReports.map((report: any) => {
      const isAttacker = report.attacker._id.toString() === auth.playerId
      
      if (report.type === 'BATTLE') {
        return {
          id: report._id,
          type: 'BATTLE',
          time: report.time,
          isAttacker,
          opponent: isAttacker ? report.defender?.username : report.attacker?.username,
          result: {
            won: isAttacker ? report.result?.attackerWins : report.result?.defenderWins,
            lost: isAttacker ? report.result?.defenderWins : report.result?.attackerWins,
            draw: report.result?.draw,
          },
          coordinates: {
            attacker: report.attackerPlanet,
            defender: report.defenderPlanet,
          },
          loot: isAttacker ? report.loot : null,
          isRead: isAttacker ? report.isRead?.attacker : report.isRead?.defender,
        }
      } else {
        // Espionage
        return {
          id: report._id,
          type: 'ESPIONAGE',
          time: report.time,
          isAttacker,
          opponent: isAttacker ? report.defender?.username : report.attacker?.username,
          coordinates: report.coordinates,
          resources: report.resources,
          levelDifference: report.levelDifference,
          counterEspionageChance: report.counterEspionageChance,
          // Include details if attacker
          details: isAttacker ? {
            ships: report.ships,
            defenses: report.defenses,
            buildings: report.buildings,
            researches: report.researches
          } : null
        }
      }
    })

    const totalBattle = await BattleReportSchema.countDocuments({ $or: [{ attacker: auth.playerId }, { defender: auth.playerId }] })
    const totalEspionage = await EspionageReportSchema.countDocuments({ $or: [{ attacker: auth.playerId }, { defender: auth.playerId }] })
    const total = totalBattle + totalEspionage

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
    console.error('Get reports error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to get reports',
    })
  }
})
