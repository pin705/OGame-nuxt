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
      <h1 class="text-2xl font-display font-bold">Công Trình</h1>
      <p class="text-slate-400">Xây dựng và nâng cấp các công trình trên hành tinh của bạn</p>
    </div>

    <!-- Category Tabs -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="category in categories"
        :key="category.name"
        class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200"
        :class="
          activeCategory === category.name
            ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
            : 'bg-space-800/50 text-slate-400 border border-space-700 hover:bg-space-700'
        "
        @click="activeCategory = category.name"
      >
        <component :is="category.icon" class="w-5 h-5" />
        {{ category.name }}
      </button>
    </div>

    <!-- Warning if something is upgrading -->
    <div v-if="isAnyUpgrading" class="glass-card p-4 border-l-4 border-accent-500">
      <div class="flex items-center gap-3">
        <IconsThoiGian class="w-6 h-6 text-accent-400 animate-pulse" />
        <div class="flex-1">
          <p class="font-medium text-slate-200">Đang nâng cấp: {{ BUILDINGS[buildQueue.building.type as BuildingType]?.name }}</p>
          <p class="text-sm text-slate-400">
            Còn {{ Math.floor(buildQueue.building.remainingSeconds / 60) }}m {{ buildQueue.building.remainingSeconds % 60 }}s
          </p>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="upgradeError" class="glass-card p-4 border-l-4 border-red-500">
      <div class="flex items-center gap-3">
        <IconsCanhBao class="w-6 h-6 text-red-400" />
        <p class="text-red-400">{{ upgradeError }}</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading && !currentPlanet" class="flex items-center justify-center py-12">
      <div class="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"></div>
    </div>

    <!-- Buildings Grid -->
    <div v-if="currentPlanet" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="building in filteredBuildings"
        :key="building.type"
        class="glass-card p-4 hover:border-primary-500/50 transition-all"
      >
        <div class="flex items-center gap-4 mb-4">
          <div class="w-12 h-12 rounded-lg bg-space-700 flex items-center justify-center">
            <IconsMoKhoang class="w-8 h-8 text-primary-400" />
          </div>
          <div class="flex-1">
            <h4 class="font-medium">{{ BUILDINGS[building.type as BuildingType]?.name || building.type }}</h4>
            <p class="text-sm text-slate-400">Cấp {{ building.level }}</p>
          </div>
        </div>

        <!-- Cost Display -->
        <div class="text-xs text-slate-400 mb-3 space-y-1">
          <div class="flex justify-between">
            <span>Chi phí nâng cấp:</span>
          </div>
          <div class="flex gap-3">
            <span class="flex items-center gap-1">
              <IconsTinhThach class="w-3 h-3" />
              {{ formatNumber(calculateBuildingCost(building.type as BuildingType, building.level + 1).tinhThach) }}
            </span>
            <span class="flex items-center gap-1">
              <IconsNangLuong class="w-3 h-3" />
              {{ formatNumber(calculateBuildingCost(building.type as BuildingType, building.level + 1).nangLuongVuTru) }}
            </span>
            <span class="flex items-center gap-1">
              <IconsHonThach class="w-3 h-3" />
              {{ formatNumber(calculateBuildingCost(building.type as BuildingType, building.level + 1).honThach) }}
            </span>
          </div>
        </div>

        <button
          class="w-full py-2 rounded-lg text-sm font-medium transition-all"
          :class="canAffordBuilding(building.type as BuildingType, building.level) && !isAnyUpgrading
            ? 'bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 border border-primary-500/30'
            : 'bg-space-700/50 text-slate-500 cursor-not-allowed'
          "
          :disabled="!canAffordBuilding(building.type as BuildingType, building.level) || isAnyUpgrading"
          @click="handleUpgrade(building.type as BuildingType)"
        >
          <span class="flex items-center justify-center gap-2">
            <IconsNangCap class="w-4 h-4" />
            Nâng cấp lên {{ building.level + 1 }}
          </span>
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredBuildings.length === 0" class="glass-card p-12 text-center">
      <IconsTrungTamChiHuy class="w-16 h-16 mx-auto mb-4 text-slate-600" />
      <p class="text-slate-400">Không có công trình nào trong danh mục này.</p>
    </div>
  </div>
</template>
