<script setup lang="ts">
import { BUILDINGS } from '~/config/gameConfig'
import { BuildingType } from '~/types/game'
import { calculateBuildingCost, formatNumber, formatDuration } from '~/utils/gameFormulas'
import type { Requirement } from '~/utils/techTree'

interface Props {
  type: BuildingType
  level: number
  isUpgrading?: boolean
  upgradeEndTime?: Date | null
  canUpgrade?: boolean
  disabled?: boolean
  requirements?: Requirement[]
}

const props = withDefaults(defineProps<Props>(), {
  isUpgrading: false,
  upgradeEndTime: null,
  canUpgrade: true,
  disabled: false,
  requirements: () => [],
})

const emit = defineEmits<{
  upgrade: [type: BuildingType]
}>()

const config = computed(() => BUILDINGS[props.type])
const nextLevelCost = computed(() => calculateBuildingCost(props.type, props.level + 1))

const timeRemaining = ref('')
let timer: ReturnType<typeof setInterval> | null = null

const updateTimeRemaining = () => {
  if (!props.upgradeEndTime) {
    timeRemaining.value = ''
    return
  }
  
  const now = new Date()
  const end = new Date(props.upgradeEndTime)
  const diff = Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000))
  
  if (diff <= 0) {
    timeRemaining.value = 'Hoàn thành!'
    if (timer) clearInterval(timer)
  } else {
    timeRemaining.value = formatDuration(diff)
  }
}

watch(() => props.upgradeEndTime, (newVal) => {
  if (timer) clearInterval(timer)
  if (newVal && props.isUpgrading) {
    updateTimeRemaining()
    timer = setInterval(updateTimeRemaining, 1000)
  }
}, { immediate: true })

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<template>
  <div
    class="glass-card-hover p-4 relative overflow-hidden group"
    :class="{ 'ring-2 ring-primary-500 animate-pulse': isUpgrading }"
  >
    <!-- Background decoration -->
    <div class="absolute inset-0 bg-gradient-to-br from-transparent to-space-700/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    
    <div class="relative z-10">
      <!-- Header -->
      <div class="flex items-start gap-3 mb-3">
        <div class="w-12 h-12 rounded-lg bg-space-700/50 flex items-center justify-center flex-shrink-0">
          <IconsMoKhoang class="w-8 h-8 text-primary-400" />
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-display font-semibold text-slate-100 truncate">
            {{ config.name }}
          </h3>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="text-sm text-slate-400">Cấp</span>
            <span class="font-mono font-bold text-primary-400">{{ level }}</span>
            <IconsMuiTen v-if="isUpgrading" class="w-4 h-4 text-accent-400" />
            <span v-if="isUpgrading" class="font-mono font-bold text-accent-400">{{ level + 1 }}</span>
          </div>
        </div>
      </div>

      <!-- Description -->
      <p class="text-xs text-slate-400 mb-3 line-clamp-2">
        {{ config.description }}
      </p>

      <!-- Upgrade Progress -->
      <div v-if="isUpgrading" class="mb-3">
        <div class="flex items-center justify-between text-xs mb-1">
          <span class="text-accent-400 flex items-center gap-1">
            <IconsThoiGian class="w-4 h-4 animate-spin" />
            Đang nâng cấp...
          </span>
          <span class="font-mono text-slate-300">{{ timeRemaining }}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-bar-fill bg-gradient-to-r from-accent-500 to-accent-400" style="width: 60%;" />
        </div>
      </div>

      <!-- Cost for next level -->
      <div v-else class="mb-3">
        <p class="text-xs text-slate-500 mb-1">Chi phí nâng cấp cấp {{ level + 1 }}:</p>
        <div class="flex flex-wrap gap-2 text-xs">
          <span class="resource-metal flex items-center gap-1">
            <IconsTinhThach class="w-4 h-4" />
            {{ formatNumber(nextLevelCost.tinhThach) }}
          </span>
          <span class="resource-crystal flex items-center gap-1">
            <IconsNangLuong class="w-4 h-4" />
            {{ formatNumber(nextLevelCost.nangLuongVuTru) }}
          </span>
          <span v-if="nextLevelCost.honThach > 0" class="resource-deuterium flex items-center gap-1">
            <IconsHonThach class="w-4 h-4" />
            {{ formatNumber(nextLevelCost.honThach) }}
          </span>
        </div>
      </div>

      <!-- Requirements -->
      <GameRequirementList
        v-if="requirements && requirements.length > 0 && !requirements.every(r => r.met)"
        :requirements="requirements"
        class="mb-3"
      />

      <!-- Upgrade Button -->
      <button
        v-if="!isUpgrading"
        :disabled="!canUpgrade || disabled || (requirements && !requirements.every(r => r.met))"
        class="btn-primary w-full text-sm flex items-center justify-center gap-2"
        :class="{ 'opacity-50 cursor-not-allowed': !canUpgrade || disabled || (requirements && !requirements.every(r => r.met)) }"
        @click="emit('upgrade', type)"
      >
        <IconsNangCap class="w-4 h-4" />
        Nâng cấp lên cấp {{ level + 1 }}
      </button>
      <button
        v-else
        disabled
        class="btn-outline w-full text-sm opacity-50 cursor-not-allowed flex items-center justify-center gap-2"
      >
        <IconsThoiGian class="w-4 h-4" />
        Đang xây dựng...
      </button>
    </div>
  </div>
</template>
