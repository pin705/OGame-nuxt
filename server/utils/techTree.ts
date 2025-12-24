import { BuildingType, ResearchType } from '~/types/game'

interface Requirements {
  buildings?: { type: BuildingType; level: number }[];
  researches?: { type: ResearchType; level: number }[];
}

export function checkRequirements(
  requirements: Requirements | undefined,
  planet: any,
  player: any
): { met: boolean; missing: string[] } {
  if (!requirements) {
    return { met: true, missing: [] }
  }

  const missing: string[] = []

  // Check building requirements
  if (requirements.buildings) {
    for (const req of requirements.buildings) {
      const building = planet.buildings.find((b: any) => b.type === req.type)
      const currentLevel = building ? building.level : 0
      
      if (currentLevel < req.level) {
        missing.push(`Cần ${req.type} cấp ${req.level}`)
      }
    }
  }

  // Check research requirements
  if (requirements.researches) {
    for (const req of requirements.researches) {
      const research = player.researches?.find((r: any) => r.type === req.type)
      const currentLevel = research ? research.level : 0
      
      if (currentLevel < req.level) {
        missing.push(`Cần ${req.type} cấp ${req.level}`)
      }
    }
  }

  return {
    met: missing.length === 0,
    missing,
  }
}
