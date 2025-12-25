<script setup lang="ts">
import { BuildingType } from '~/types/game'
import { BUILDINGS } from '~/config/gameConfig'
import { calculateBuildingCost, formatNumber } from '~/utils/gameFormulas'
import { checkRequirements } from '~/utils/techTree'

definePageMeta({
  layout: 'game',
})

const { currentPlanet, buildQueue, upgradeBuilding, processQueue, isLoading, fetchPlanet, fetchBuildQueue } = useGame()
const { player } = useAuth()
const countdown = useCountdown()

// Track which building is being upgraded (for loading state)
const upgradingBuildingType = ref<BuildingType | null>(null)

// Auto-refresh data
const refreshInterval = ref<NodeJS.Timeout | null>(null)

// Get building queue items
const buildingQueueItems = computed(() => buildQueue.value?.buildingQueue || [])
const currentBuildingInProgress = computed(() => buildQueue.value?.building)

// Watch for countdown completion to auto-refresh
watch(() => countdown.buildingRemaining.value, async (remaining) => {
  if (remaining === 0 && currentBuildingInProgress.value) {
    // Building completed, refresh immediately
    await Promise.all([
      processQueue(),
      fetchPlanet(),
      fetchBuildQueue(),
    ])
  }
})

onMounted(async () => {
  // Process queue and refresh every 5 seconds for faster response
  refreshInterval.value = setInterval(async () => {
    await processQueue()
  }, 5000)
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
})

// Get buildings from planet
const buildings = computed(() => {
  const planetBuildings = currentPlanet.value?.planet?.buildings || []
  // Merge with all building types to show unbuilt ones too
  const allTypes = Object.values(BuildingType)
  return allTypes.map(type => {
    const existing = planetBuildings.find((b: any) => b.type === type)
    // Count pending upgrades for this building type
    const pendingUpgrades = buildingQueueItems.value.filter((q: any) => q.type === type).length
    return {
      type,
      level: existing?.level || 0,
      pendingLevel: pendingUpgrades > 0 ? (existing?.level || 0) + pendingUpgrades : null,
    }
  })
})

// Get resources from planet
const resources = computed(() => ({
  tinhThach: currentPlanet.value?.planet?.resources?.tinhThach || 0,
  nangLuongVuTru: currentPlanet.value?.planet?.resources?.nangLuongVuTru || 0,
  honThach: currentPlanet.value?.planet?.resources?.honThach || 0,
}))

const categories = [
  {
    name: 'Khai Thác',
    icon: 'IconsMoKhoang',
    types: [
      BuildingType.MO_TINH_THACH,
      BuildingType.MAY_HAP_THU_NANG_LUONG,
      BuildingType.DEN_HON_THACH,
      BuildingType.LO_NANG_LUONG,
      BuildingType.LO_NHIET_HACH,
    ],
  },
  {
    name: 'Kho Chứa',
    icon: 'IconsKhoChua',
    types: [
      BuildingType.KHO_TINH_THACH,
      BuildingType.KHO_NANG_LUONG_VU_TRU,
      BuildingType.KHO_HON_THACH,
    ],
  },
  {
    name: 'Chức Năng',
    icon: 'IconsTrungTamChiHuy',
    types: [
      BuildingType.TRUNG_TAM_CHI_HUY,
      BuildingType.XUONG_DONG_TAU,
      BuildingType.VIEN_NGHIEN_CUU,
      BuildingType.NHA_MAY_ROBOT,
      BuildingType.NHA_MAY_NANITE,
      BuildingType.PHAO_DAI_PHONG_THU,
      BuildingType.SILO_TEN_LUA,
      BuildingType.CANG_VU_TRU,
    ],
  },
  {
    name: 'Tiên Tiến',
    icon: 'IconsNghienCuu',
    types: [
      BuildingType.MANG_CAM_BIEN,
      BuildingType.CONG_NHAY,
    ],
  },
]

const activeCategory = ref('Khai Thác')

const filteredBuildings = computed(() => {
  const category = categories.find(c => c.name === activeCategory.value)
  if (!category) return buildings.value
  return buildings.value.filter(b => category.types.includes(b.type as BuildingType))
})

const canAffordBuilding = (type: BuildingType, currentLevel: number) => {
  // Calculate cost for next level (considering pending upgrades)
  const pendingUpgrades = buildingQueueItems.value.filter((q: any) => q.type === type).length
  const effectiveLevel = currentLevel + pendingUpgrades + 1
  const cost = calculateBuildingCost(type, effectiveLevel)
  return (
    resources.value.tinhThach >= cost.tinhThach &&
    resources.value.nangLuongVuTru >= cost.nangLuongVuTru &&
    resources.value.honThach >= cost.honThach
  )
}

// Check if queue is full (max 3 in progress + 3 pending = 6)
const isQueueFull = computed(() => buildingQueueItems.value.length >= 6)
const inProgressCount = computed(() => buildingQueueItems.value.filter((q: any) => q.status === 'IN_PROGRESS').length)
const pendingCount = computed(() => buildingQueueItems.value.filter((q: any) => q.status === 'PENDING').length)

const getBuildingRequirements = (type: BuildingType) => {
  const config = BUILDINGS[type]
  if (!config.requirements) return []
  
  const planetBuildings = currentPlanet.value?.planet?.buildings || []
  const playerResearches = player.value?.researches || []
  
  const check = checkRequirements(config.requirements, planetBuildings, playerResearches)
  return check.requirements
}

const upgradeError = ref<string | null>(null)

const handleUpgrade = async (type: BuildingType) => {
  if (isQueueFull.value || upgradingBuildingType.value) return
  
  upgradeError.value = null
  upgradingBuildingType.value = type
  
  try {
    const result = await upgradeBuilding(type) as { success: boolean; error?: string; message?: string }
    
    if (!result.success) {
      upgradeError.value = result.error || 'Nâng cấp thất bại'
      setTimeout(() => {
        upgradeError.value = null
      }, 3000)
    }
  } finally {
    upgradingBuildingType.value = null
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-display font-bold text-gradient-cyan">Công Trình</h1>
      <p class="text-neutral-500 mt-1">Xây dựng và nâng cấp các công trình trên hành tinh của bạn</p>
    </div>

    <!-- Category Tabs -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="category in categories"
        :key="category.name"
        class="flex items-center gap-2 px-4 py-2.5 transition-all duration-200"
        :class="
          activeCategory === category.name
            ? 'neo-btn'
            : 'neo-btn-ghost'
        "
        @click="activeCategory = category.name"
      >
        <component :is="category.icon" class="w-5 h-5" />
        {{ category.name }}
      </button>
    </div>

    <!-- Warning if something is upgrading -->
    <div v-if="currentBuildingInProgress" class="neo-card p-3 md:p-4 border-l-2 border-warning-400">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 neo-card flex items-center justify-center border-warning-400/30 flex-shrink-0">
          <IconsThoiGian class="w-5 h-5 text-warning-400 animate-pulse" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-sm md:text-base truncate">
            Đang nâng cấp: {{ BUILDINGS[currentBuildingInProgress.type as BuildingType]?.name }}
          </p>
          <p class="text-sm text-neutral-500">
            Còn <span class="text-warning-400 font-mono text-base">{{ countdown.buildingFormattedVi.value }}</span>
          </p>
        </div>
        <div class="text-xs text-neutral-500">
          {{ inProgressCount }}/3 đang xây · {{ pendingCount }}/3 chờ
        </div>
      </div>
      <!-- Progress bar -->
      <div class="mt-3 h-1 bg-neutral-800 rounded-full overflow-hidden">
        <div 
          class="h-full bg-gradient-to-r from-warning-400 to-warning-500 transition-all duration-1000"
          :style="{ width: `${100 - (countdown.buildingRemaining.value / (currentBuildingInProgress.durationSeconds || currentBuildingInProgress.remainingSeconds || 1)) * 100}%` }"
        />
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="upgradeError" class="neo-card p-4 border-l-2 border-alert-400">
      <div class="flex items-center gap-3">
        <IconsCanhBao class="w-6 h-6 text-alert-400" />
        <p class="text-alert-400">{{ upgradeError }}</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading && !currentPlanet" class="flex items-center justify-center py-12">
      <div class="loading-spinner"></div>
    </div>

    <!-- Buildings Grid -->
    <div v-if="currentPlanet" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="building in filteredBuildings"
        :key="building.type"
        class="neo-card neo-card-hover p-4"
      >
        <div class="flex items-center gap-4 mb-4">
          <div class="w-12 h-12 neo-card flex items-center justify-center border-primary-500/20">
            <IconsMoKhoang class="w-6 h-6 text-primary-500" />
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="font-semibold truncate">{{ BUILDINGS[building.type as BuildingType]?.name || building.type }}</h4>
            <div class="flex items-center gap-2">
              <p class="text-sm text-neutral-500">Cấp <span class="text-primary-500 font-mono">{{ building.level }}</span></p>
              <span v-if="building.pendingLevel" class="text-xs text-warning-400">
                → {{ building.pendingLevel }}
              </span>
            </div>
          </div>
        </div>

        <!-- Description Tooltip -->
        <p class="text-xs text-neutral-500 mb-3 line-clamp-2">
          {{ BUILDINGS[building.type as BuildingType]?.description }}
        </p>

        <!-- Requirements -->
        <GameRequirementList
          v-if="getBuildingRequirements(building.type as BuildingType).length > 0 && !getBuildingRequirements(building.type as BuildingType).every(r => r.met)"
          :requirements="getBuildingRequirements(building.type as BuildingType)"
          class="mb-4"
        />

        <!-- Cost Display -->
        <div class="text-xs mb-4 space-y-2">
          <div class="text-neutral-500 uppercase tracking-wider">Chi phí nâng cấp:</div>
          <div class="flex gap-3 font-mono">
            <span class="flex items-center gap-1 text-neutral-400" :title="'Tinh Thạch'">
              <IconsTinhThach class="w-3.5 h-3.5" />
              {{ formatNumber(calculateBuildingCost(building.type as BuildingType, (building.pendingLevel || building.level) + 1).tinhThach) }}
            </span>
            <span class="flex items-center gap-1 text-primary-500" :title="'Năng Lượng Vũ Trụ'">
              <IconsNangLuong class="w-3.5 h-3.5" />
              {{ formatNumber(calculateBuildingCost(building.type as BuildingType, (building.pendingLevel || building.level) + 1).nangLuongVuTru) }}
            </span>
            <span class="flex items-center gap-1 text-success-400" :title="'Hồn Thạch'">
              <IconsHonThach class="w-3.5 h-3.5" />
              {{ formatNumber(calculateBuildingCost(building.type as BuildingType, (building.pendingLevel || building.level) + 1).honThach) }}
            </span>
          </div>
        </div>

        <button
          class="w-full py-2.5 text-sm font-medium uppercase tracking-wider transition-all relative"
          :class="canAffordBuilding(building.type as BuildingType, building.level) && !isQueueFull && !upgradingBuildingType && getBuildingRequirements(building.type as BuildingType).every(r => r.met)
            ? 'neo-btn-success'
            : 'neo-btn-ghost opacity-50 cursor-not-allowed'
          "
          :disabled="!canAffordBuilding(building.type as BuildingType, building.level) || isQueueFull || !!upgradingBuildingType || !getBuildingRequirements(building.type as BuildingType).every(r => r.met)"
          :title="isQueueFull ? 'Hàng đợi đã đầy (tối đa 3 đang xây + 3 chờ)' : ''"
          @click="handleUpgrade(building.type as BuildingType)"
        >
          <!-- Loading spinner when this building is being upgraded -->
          <span v-if="upgradingBuildingType === building.type" class="flex items-center justify-center gap-2">
            <svg class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang xử lý...
          </span>
          <span v-else class="flex items-center justify-center gap-2">
            <IconsNangCap class="w-4 h-4" />
            {{ buildingQueueItems.length > 0 ? 'Thêm vào hàng đợi' : 'Nâng cấp' }} → {{ (building.pendingLevel || building.level) + 1 }}
          </span>
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredBuildings.length === 0" class="neo-card p-12 text-center">
      <div class="w-16 h-16 neo-card flex items-center justify-center mx-auto mb-4 border-neutral-500/20">
        <IconsTrungTamChiHuy class="w-8 h-8 text-neutral-500" />
      </div>
      <p class="text-neutral-500">Không có công trình nào trong danh mục này.</p>
    </div>
  </div>
</template>
