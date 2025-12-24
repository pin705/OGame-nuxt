<script setup lang="ts">
import { BuildingType } from '~/types/game'
import { BUILDINGS } from '~/config/gameConfig'
import { calculateBuildingCost, formatNumber } from '~/utils/gameFormulas'

definePageMeta({
  layout: 'game',
})

const { currentPlanet, buildQueue, upgradeBuilding, processQueue, isLoading } = useGame()

// Auto-refresh data
const refreshInterval = ref<NodeJS.Timeout | null>(null)

onMounted(async () => {
  // Process queue and refresh every 5 seconds
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
    return {
      type,
      level: existing?.level || 0,
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
      BuildingType.PHAO_DAI_PHONG_THU,
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
  const cost = calculateBuildingCost(type, currentLevel + 1)
  return (
    resources.value.tinhThach >= cost.tinhThach &&
    resources.value.nangLuongVuTru >= cost.nangLuongVuTru &&
    resources.value.honThach >= cost.honThach
  )
}

const isAnyUpgrading = computed(() => !!buildQueue.value?.building)

const upgradeError = ref<string | null>(null)

const handleUpgrade = async (type: BuildingType) => {
  if (isAnyUpgrading.value) return
  
  upgradeError.value = null
  const result = await upgradeBuilding(type) as { success: boolean; error?: string }
  
  if (!result.success) {
    upgradeError.value = result.error || 'Nâng cấp thất bại'
    setTimeout(() => {
      upgradeError.value = null
    }, 3000)
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
    <div v-if="isAnyUpgrading" class="neo-card p-4 border-l-2 border-warning-400">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 neo-card flex items-center justify-center border-warning-400/30 pulse-neon">
          <IconsThoiGian class="w-5 h-5 text-warning-400" />
        </div>
        <div class="flex-1">
          <p class="font-display font-semibold">Đang nâng cấp: {{ BUILDINGS[buildQueue.building.type as BuildingType]?.name }}</p>
          <p class="text-sm text-neutral-500">
            Còn <span class="text-warning-400 font-mono">{{ Math.floor(buildQueue.building.remainingSeconds / 60) }}m {{ buildQueue.building.remainingSeconds % 60 }}s</span>
          </p>
        </div>
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
            <h4 class="font-display font-semibold truncate">{{ BUILDINGS[building.type as BuildingType]?.name || building.type }}</h4>
            <p class="text-sm text-neutral-500">Cấp <span class="text-primary-500 font-mono">{{ building.level }}</span></p>
          </div>
        </div>

        <!-- Cost Display -->
        <div class="text-xs mb-4 space-y-2">
          <div class="text-neutral-500 uppercase tracking-wider font-display">Chi phí nâng cấp:</div>
          <div class="flex gap-3 font-mono">
            <span class="flex items-center gap-1 text-neutral-400">
              <IconsTinhThach class="w-3.5 h-3.5" />
              {{ formatNumber(calculateBuildingCost(building.type as BuildingType, building.level + 1).tinhThach) }}
            </span>
            <span class="flex items-center gap-1 text-primary-500">
              <IconsNangLuong class="w-3.5 h-3.5" />
              {{ formatNumber(calculateBuildingCost(building.type as BuildingType, building.level + 1).nangLuongVuTru) }}
            </span>
            <span class="flex items-center gap-1 text-success-400">
              <IconsHonThach class="w-3.5 h-3.5" />
              {{ formatNumber(calculateBuildingCost(building.type as BuildingType, building.level + 1).honThach) }}
            </span>
          </div>
        </div>

        <button
          class="w-full py-2.5 text-sm font-display font-medium uppercase tracking-wider transition-all"
          :class="canAffordBuilding(building.type as BuildingType, building.level) && !isAnyUpgrading
            ? 'neo-btn-success'
            : 'neo-btn-ghost opacity-50 cursor-not-allowed'
          "
          :disabled="!canAffordBuilding(building.type as BuildingType, building.level) || isAnyUpgrading"
          @click="handleUpgrade(building.type as BuildingType)"
        >
          <span class="flex items-center justify-center gap-2">
            <IconsNangCap class="w-4 h-4" />
            Nâng lên cấp {{ building.level + 1 }}
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
