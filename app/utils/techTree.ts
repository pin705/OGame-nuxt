import { BuildingType, ResearchType, type BuildingLevel, type ResearchLevel } from '~/types/game'
import { BUILDINGS, RESEARCHES } from '~/config/gameConfig'

export interface Requirement {
  type: BuildingType | ResearchType
  level: number
  currentLevel: number
  met: boolean
  name: string
  category: 'building' | 'research' // Added to help with navigation
}

export interface RequirementsCheckResult {
  met: boolean
  requirements: Requirement[]
}

/**
 * Get navigation path for a requirement
 */
export function getRequirementPath(req: Requirement): string {
  if (req.category === 'research') {
    return '/game/research'
  }
  return '/game/buildings'
}

export function checkRequirements(
  requirements: { buildings?: { type: BuildingType; level: number }[]; researches?: { type: ResearchType; level: number }[] } | undefined,
  buildings: BuildingLevel[],
  researches: ResearchLevel[]
): RequirementsCheckResult {
  if (!requirements) {
    return { met: true, requirements: [] }
  }

  const result: Requirement[] = []
  let allMet = true

  // Check building requirements
  if (requirements.buildings) {
    for (const req of requirements.buildings) {
      const building = buildings.find((b) => b.type === req.type)
      const currentLevel = building ? building.level : 0
      const met = currentLevel >= req.level
      
      if (!met) allMet = false

      result.push({
        type: req.type,
        level: req.level,
        currentLevel,
        met,
        name: BUILDINGS[req.type]?.name || req.type,
        category: 'building',
      })
    }
  }

  // Check research requirements
  if (requirements.researches) {
    for (const req of requirements.researches) {
      const research = researches.find((r) => r.type === req.type)
      const currentLevel = research ? research.level : 0
      const met = currentLevel >= req.level
      
      if (!met) allMet = false

      result.push({
        type: req.type,
        level: req.level,
        currentLevel,
        met,
        name: RESEARCHES[req.type]?.name || req.type,
        category: 'research',
      })
    }
  }

  return {
    met: allMet,
    requirements: result,
  }
}
