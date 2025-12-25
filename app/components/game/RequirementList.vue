<script setup lang="ts">
import type { Requirement } from '~/utils/techTree'
import { getRequirementPath } from '~/utils/techTree'

const props = defineProps<{
  requirements: Requirement[]
}>()

const router = useRouter()

const navigateToRequirement = (req: Requirement) => {
  if (req.met) return // Don't navigate if already met
  
  const path = getRequirementPath(req)
  // Store the target requirement in query for auto-scroll/highlight
  router.push({
    path,
    query: { target: req.type }
  })
}
</script>

<template>
  <div class="space-y-1 bg-[var(--space-dark)] p-2 rounded border border-[var(--border-subtle)]">
    <div class="text-xs font-semibold text-[var(--text-secondary)] mb-1 flex items-center gap-1">
      <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      Yêu cầu:
    </div>
    <div 
      v-for="req in requirements" 
      :key="req.type" 
      class="flex items-center justify-between text-xs py-1 px-1 rounded transition-all"
      :class="req.met 
        ? 'text-[var(--accent-green)]' 
        : 'text-[var(--accent-red)] cursor-pointer hover:bg-[var(--accent-red)]/10'"
      :title="req.met ? 'Đã đạt yêu cầu' : `Ấn để đến ${req.category === 'research' ? 'Nghiên cứu' : 'Công trình'}`"
      @click="navigateToRequirement(req)"
    >
      <span class="flex items-center gap-1.5">
        <!-- Navigation arrow for unmet requirements -->
        <svg 
          v-if="!req.met" 
          class="w-3 h-3 opacity-60" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2"
        >
          <path d="M9 5l7 7-7 7" />
        </svg>
        {{ req.name }} (Cấp {{ req.level }})
      </span>
      <span v-if="!req.met" class="text-[var(--text-muted)] ml-2 flex items-center gap-1">
        <span class="font-mono">{{ req.currentLevel }}</span>
        <svg class="w-3 h-3 text-[var(--accent-red)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
        <span class="font-mono">{{ req.level }}</span>
      </span>
      <IconsHoanThanh v-else class="w-4 h-4 ml-2" />
    </div>
  </div>
</template>
