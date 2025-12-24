<script setup lang="ts">
import { BuildingType } from '~/types/game'
import { BUILDINGS } from '~/config/gameConfig'
import { calculateBuildingCost } from '~/utils/gameFormulas'

definePageMeta({
  layout: 'game',
})

// Mock data - will be replaced with API calls
const buildings = ref([
  { type: BuildingType.MO_TINH_THACH, level: 15, isUpgrading: false },
  { type: BuildingType.MAY_HAP_THU_NANG_LUONG, level: 12, isUpgrading: true, upgradeEndTime: new Date(Date.now() + 3600000) },
  { type: BuildingType.DEN_HON_THACH, level: 8, isUpgrading: false },
  { type: BuildingType.LO_NANG_LUONG, level: 14, isUpgrading: false },
  { type: BuildingType.KHO_TINH_THACH, level: 5, isUpgrading: false },
  { type: BuildingType.KHO_NANG_LUONG_VU_TRU, level: 4, isUpgrading: false },
  { type: BuildingType.KHO_HON_THACH, level: 3, isUpgrading: false },
  { type: BuildingType.TRUNG_TAM_CHI_HUY, level: 5, isUpgrading: false },
  { type: BuildingType.XUONG_DONG_TAU, level: 6, isUpgrading: false },
  { type: BuildingType.VIEN_NGHIEN_CUU, level: 7, isUpgrading: false },
  { type: BuildingType.NHA_MAY_ROBOT, level: 4, isUpgrading: false },
  { type: BuildingType.PHAO_DAI_PHONG_THU, level: 2, isUpgrading: false },
])

const resources = ref({
  tinhThach: 1250000,
  nangLuongVuTru: 680000,
  honThach: 320000,
})

const categories = [
  {
    name: 'Khai Thác',
    icon: 'mdi:pickaxe',
    types: [
      BuildingType.MO_TINH_THACH,
      BuildingType.MAY_HAP_THU_NANG_LUONG,
      BuildingType.DEN_HON_THACH,
      BuildingType.LO_NANG_LUONG,
    ],
  },
  {
    name: 'Kho Chứa',
    icon: 'mdi:warehouse',
    types: [
      BuildingType.KHO_TINH_THACH,
      BuildingType.KHO_NANG_LUONG_VU_TRU,
      BuildingType.KHO_HON_THACH,
    ],
  },
  {
    name: 'Chức Năng',
    icon: 'mdi:cog',
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
  return buildings.value.filter(b => category.types.includes(b.type))
})

const canAffordBuilding = (type: BuildingType, currentLevel: number) => {
  const cost = calculateBuildingCost(type, currentLevel + 1)
  return (
    resources.value.tinhThach >= cost.tinhThach &&
    resources.value.nangLuongVuTru >= cost.nangLuongVuTru &&
    resources.value.honThach >= cost.honThach
  )
}

const isAnyUpgrading = computed(() => buildings.value.some(b => b.isUpgrading))

const handleUpgrade = async (type: BuildingType) => {
  const building = buildings.value.find(b => b.type === type)
  if (!building || building.isUpgrading || isAnyUpgrading.value) return
  
  const cost = calculateBuildingCost(type, building.level + 1)
  if (!canAffordBuilding(type, building.level)) return

  // Deduct resources
  resources.value.tinhThach -= cost.tinhThach
  resources.value.nangLuongVuTru -= cost.nangLuongVuTru
  resources.value.honThach -= cost.honThach

  // Start upgrade
  building.isUpgrading = true
  building.upgradeEndTime = new Date(Date.now() + 60000) // 1 minute for demo

  // TODO: Call API to start upgrade
  console.log(`Upgrading ${BUILDINGS[type].name} to level ${building.level + 1}`)
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
        <Icon :name="category.icon" />
        {{ category.name }}
      </button>
    </div>

    <!-- Warning if something is upgrading -->
    <div v-if="isAnyUpgrading" class="glass-card p-4 border-l-4 border-accent-500">
      <div class="flex items-center gap-3">
        <Icon name="mdi:information" class="text-2xl text-accent-400" />
        <div>
          <p class="font-medium text-slate-200">Đang có công trình nâng cấp</p>
          <p class="text-sm text-slate-400">Bạn chỉ có thể nâng cấp 1 công trình cùng lúc.</p>
        </div>
      </div>
    </div>

    <!-- Buildings Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <GameBuildingCard
        v-for="building in filteredBuildings"
        :key="building.type"
        :type="building.type"
        :level="building.level"
        :is-upgrading="building.isUpgrading"
        :upgrade-end-time="building.upgradeEndTime"
        :can-upgrade="canAffordBuilding(building.type, building.level)"
        :disabled="isAnyUpgrading && !building.isUpgrading"
        @upgrade="handleUpgrade"
      />
    </div>

    <!-- Empty State -->
    <div v-if="filteredBuildings.length === 0" class="glass-card p-12 text-center">
      <Icon name="mdi:office-building" class="text-6xl text-slate-600 mb-4" />
      <p class="text-slate-400">Không có công trình nào trong danh mục này.</p>
    </div>
  </div>
</template>
