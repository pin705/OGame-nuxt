<script setup lang="ts">
import { RANKS } from '~/config/gameConfig'
import { PlayerRank } from '~/types/game'
import { calculateXPForLevel, formatNumber } from '~/utils/gameFormulas'

interface Props {
  username: string
  level: number
  experience: number
  rank: PlayerRank
  isOnline?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isOnline: true,
})

const rankInfo = computed(() => RANKS[props.rank])
const xpForNextLevel = computed(() => calculateXPForLevel(props.level + 1))
const xpProgress = computed(() => {
  const xpForCurrent = calculateXPForLevel(props.level)
  const xpNeeded = xpForNextLevel.value - xpForCurrent
  const xpGained = props.experience - xpForCurrent
  return Math.min(100, Math.round((xpGained / xpNeeded) * 100))
})

const rankColor = computed(() => {
  switch (props.rank) {
    case PlayerRank.VU_TRU_CAP: return 'from-purple-500 to-pink-500'
    case PlayerRank.DAI_DE: return 'from-yellow-500 to-orange-500'
    case PlayerRank.NGUYEN_SOAI: return 'from-red-500 to-rose-500'
    case PlayerRank.DAI_TUONG: return 'from-blue-500 to-cyan-500'
    case PlayerRank.CHIEN_TUONG: return 'from-green-500 to-emerald-500'
    default: return 'from-slate-500 to-slate-400'
  }
})
</script>

<template>
  <div class="glass-card p-4">
    <div class="flex items-center gap-4">
      <!-- Avatar -->
      <div class="relative">
        <div
          class="w-14 h-14 rounded-full bg-gradient-to-br flex items-center justify-center"
          :class="rankColor"
        >
          <Icon name="mdi:account-circle" class="text-4xl text-white" />
        </div>
        <div
          v-if="isOnline"
          class="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-500 border-2 border-space-800"
        />
      </div>

      <!-- Info -->
      <div class="flex-1">
        <div class="flex items-center gap-2">
          <h3 class="font-display font-semibold text-slate-100">
            {{ username }}
          </h3>
          <span
            class="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r text-white"
            :class="rankColor"
          >
            {{ rankInfo.name }}
          </span>
        </div>

        <div class="flex items-center gap-4 mt-1">
          <span class="text-sm text-slate-400">
            Cấp <span class="font-mono font-bold text-primary-400">{{ level }}</span>
          </span>
          <span class="text-xs text-slate-500">
            {{ formatNumber(experience) }} / {{ formatNumber(xpForNextLevel) }} XP
          </span>
        </div>

        <!-- XP Progress Bar -->
        <div class="mt-2">
          <div class="progress-bar">
            <div
              class="progress-bar-fill bg-gradient-to-r from-primary-500 to-secondary-500"
              :style="{ width: `${xpProgress}%` }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
