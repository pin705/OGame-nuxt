<script setup lang="ts">
import { BUILDINGS } from '~/config/gameConfig'
import { BuildingType } from '~/types/game'
import { calculateBuildingCost, formatNumber, formatDuration } from '~/utils/gameFormulas'

interface Props {
  type: BuildingType
  level: number
  isUpgrading?: boolean
  upgradeEndTime?: Date | null
  canUpgrade?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isUpgrading: false,
  upgradeEndTime: null,
  canUpgrade: true,
  disabled: false,
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

const iconMap: Record<string, string> = {
  [BuildingType.MO_TINH_THACH]: 'mdi:pickaxe',
  [BuildingType.MAY_HAP_THU_NANG_LUONG]: 'mdi:crystal-ball',
  [BuildingType.DEN_HON_THACH]: 'mdi:temple-hindu',
  [BuildingType.LO_NANG_LUONG]: 'mdi:solar-power',
  [BuildingType.KHO_TINH_THACH]: 'mdi:warehouse',
  [BuildingType.KHO_NANG_LUONG_VU_TRU]: 'mdi:package-variant',
  [BuildingType.KHO_HON_THACH]: 'mdi:database',
  [BuildingType.TRUNG_TAM_CHI_HUY]: 'mdi:headquarters',
  [BuildingType.XUONG_DONG_TAU]: 'mdi:rocket-launch',
  [BuildingType.VIEN_NGHIEN_CUU]: 'mdi:flask',
  [BuildingType.NHA_MAY_ROBOT]: 'mdi:robot-industrial',
  [BuildingType.PHAO_DAI_PHONG_THU]: 'mdi:shield-home',
}
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
          <Icon :name="iconMap[type] || 'mdi:building'" class="text-2xl text-primary-400" />
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-display font-semibold text-slate-100 truncate">
            {{ config.name }}
          </h3>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="text-sm text-slate-400">Cấp</span>
            <span class="font-mono font-bold text-primary-400">{{ level }}</span>
            <Icon v-if="isUpgrading" name="mdi:arrow-right" class="text-accent-400" />
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
            <Icon name="mdi:hammer-wrench" class="animate-spin" />
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
          <span class="resource-metal">
            <Icon name="mdi:gold" class="text-sm" />
            {{ formatNumber(nextLevelCost.tinhThach) }}
          </span>
          <span class="resource-crystal">
            <Icon name="mdi:diamond-stone" class="text-sm" />
            {{ formatNumber(nextLevelCost.nangLuongVuTru) }}
          </span>
          <span v-if="nextLevelCost.honThach > 0" class="resource-deuterium">
            <Icon name="mdi:water" class="text-sm" />
            {{ formatNumber(nextLevelCost.honThach) }}
          </span>
        </div>
      </div>

      <!-- Upgrade Button -->
      <button
        v-if="!isUpgrading"
        :disabled="!canUpgrade || disabled"
        class="btn-primary w-full text-sm"
        :class="{ 'opacity-50 cursor-not-allowed': !canUpgrade || disabled }"
        @click="emit('upgrade', type)"
      >
        <Icon name="mdi:arrow-up-bold" />
        Nâng cấp lên cấp {{ level + 1 }}
      </button>
      <button
        v-else
        disabled
        class="btn-outline w-full text-sm opacity-50 cursor-not-allowed"
      >
        <Icon name="mdi:timer-sand" />
        Đang xây dựng...
      </button>
    </div>
  </div>
</template>
