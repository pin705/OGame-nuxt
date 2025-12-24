<script setup lang="ts">
import { ShipType } from '~/types/game'
import { SHIPS } from '~/config/gameConfig'
import { calculateShipCost, formatNumber } from '~/utils/gameFormulas'

definePageMeta({
  layout: 'game',
})

// Mock data
const ships = ref([
  { type: ShipType.TIEU_CHIEN_HAM, count: 150, isBuilding: false },
  { type: ShipType.TRUNG_CHIEN_HAM, count: 45, isBuilding: true, buildCount: 10, endTime: new Date(Date.now() + 1800000) },
  { type: ShipType.TUAN_DUONG_HAM, count: 20, isBuilding: false },
  { type: ShipType.THIET_GIAP_HAM, count: 5, isBuilding: false },
  { type: ShipType.HAC_LONG_HAM, count: 0, isBuilding: false },
  { type: ShipType.VAN_TAI_NHO, count: 100, isBuilding: false },
  { type: ShipType.VAN_TAI_LON, count: 30, isBuilding: false },
  { type: ShipType.TAU_THUOC_DIA, count: 1, isBuilding: false },
  { type: ShipType.TAU_DO_THAM, count: 50, isBuilding: false },
  { type: ShipType.TAU_TAI_CHE, count: 10, isBuilding: false },
])

const resources = ref({
  tinhThach: 1250000,
  nangLuongVuTru: 680000,
  honThach: 320000,
})

const shipyardLevel = 6
const buildQuantity = ref<Record<string, number>>({})

const categories = [
  {
    name: 'Tàu Chiến',
    icon: 'mdi:sword',
    types: [ShipType.TIEU_CHIEN_HAM, ShipType.TRUNG_CHIEN_HAM, ShipType.TUAN_DUONG_HAM, ShipType.THIET_GIAP_HAM, ShipType.HAC_LONG_HAM],
  },
  {
    name: 'Tàu Hỗ Trợ',
    icon: 'mdi:truck',
    types: [ShipType.VAN_TAI_NHO, ShipType.VAN_TAI_LON, ShipType.TAU_THUOC_DIA, ShipType.TAU_DO_THAM, ShipType.TAU_TAI_CHE],
  },
]

const activeCategory = ref('Tàu Chiến')

const filteredShips = computed(() => {
  const category = categories.find(c => c.name === activeCategory.value)
  if (!category) return ships.value
  return ships.value.filter(s => category.types.includes(s.type))
})

const isAnyBuilding = computed(() => ships.value.some(s => s.isBuilding))

const canAffordShip = (type: ShipType, count: number = 1) => {
  const cost = calculateShipCost(type, count)
  return (
    resources.value.tinhThach >= cost.tinhThach &&
    resources.value.nangLuongVuTru >= cost.nangLuongVuTru &&
    resources.value.honThach >= cost.honThach
  )
}

const maxBuildable = (type: ShipType) => {
  const cost = SHIPS[type].cost
  const byMetal = cost.tinhThach > 0 ? Math.floor(resources.value.tinhThach / cost.tinhThach) : Infinity
  const byCrystal = cost.nangLuongVuTru > 0 ? Math.floor(resources.value.nangLuongVuTru / cost.nangLuongVuTru) : Infinity
  const byDeut = cost.honThach > 0 ? Math.floor(resources.value.honThach / cost.honThach) : Infinity
  return Math.min(byMetal, byCrystal, byDeut, 9999)
}

const getIconForShip = (type: ShipType) => {
  const iconMap: Record<string, string> = {
    [ShipType.TIEU_CHIEN_HAM]: 'mdi:airplane',
    [ShipType.TRUNG_CHIEN_HAM]: 'mdi:airplane-takeoff',
    [ShipType.TUAN_DUONG_HAM]: 'mdi:ship-wheel',
    [ShipType.THIET_GIAP_HAM]: 'mdi:tank',
    [ShipType.HAC_LONG_HAM]: 'mdi:dragon',
    [ShipType.VAN_TAI_NHO]: 'mdi:truck',
    [ShipType.VAN_TAI_LON]: 'mdi:truck-cargo-container',
    [ShipType.TAU_THUOC_DIA]: 'mdi:earth-plus',
    [ShipType.TAU_DO_THAM]: 'mdi:satellite-variant',
    [ShipType.TAU_TAI_CHE]: 'mdi:recycle',
  }
  return iconMap[type] || 'mdi:rocket'
}

const setMaxQuantity = (type: ShipType) => {
  buildQuantity.value[type] = maxBuildable(type)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-display font-bold">Xưởng Đóng Tàu</h1>
      <p class="text-slate-400">Chế tạo tàu chiến và tàu hỗ trợ cho hạm đội của bạn</p>
    </div>

    <!-- Shipyard Info -->
    <div class="glass-card p-4 flex items-center gap-4">
      <div class="w-12 h-12 rounded-lg bg-secondary-500/20 flex items-center justify-center">
        <Icon name="mdi:rocket-launch" class="text-2xl text-secondary-400" />
      </div>
      <div>
        <p class="font-medium text-slate-200">Xưởng Đóng Tàu</p>
        <p class="text-sm text-slate-400">Cấp {{ shipyardLevel }} - Chế tạo nhanh hơn {{ shipyardLevel * 10 }}%</p>
      </div>
    </div>

    <!-- Category Tabs -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="category in categories"
        :key="category.name"
        class="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200"
        :class="
          activeCategory === category.name
            ? 'bg-secondary-500/20 text-secondary-400 border border-secondary-500/30'
            : 'bg-space-800/50 text-slate-400 border border-space-700 hover:bg-space-700'
        "
        @click="activeCategory = category.name"
      >
        <Icon :name="category.icon" />
        {{ category.name }}
      </button>
    </div>

    <!-- Building Queue -->
    <div v-if="isAnyBuilding" class="glass-card p-4 border-l-4 border-secondary-500">
      <div class="flex items-center gap-3">
        <Icon name="mdi:hammer-wrench" class="text-2xl text-secondary-400 animate-spin" />
        <div class="flex-1">
          <p class="font-medium text-slate-200">Đang chế tạo tàu</p>
          <p class="text-sm text-slate-400">Tiến độ sẽ hoàn thành trong 30 phút</p>
        </div>
      </div>
    </div>

    <!-- Ships Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="ship in filteredShips"
        :key="ship.type"
        class="glass-card p-4"
        :class="{ 'ring-2 ring-secondary-500': ship.isBuilding }"
      >
        <div class="flex items-start gap-4">
          <div class="w-14 h-14 rounded-lg bg-secondary-900/30 flex items-center justify-center flex-shrink-0">
            <Icon :name="getIconForShip(ship.type)" class="text-3xl text-secondary-400" />
          </div>
          
          <div class="flex-1">
            <div class="flex items-center justify-between mb-1">
              <h3 class="font-display font-semibold text-slate-100">
                {{ SHIPS[ship.type].name }}
              </h3>
              <span class="font-mono text-lg text-secondary-400">{{ ship.count }}</span>
            </div>
            
            <p class="text-xs text-slate-500 mb-2">
              {{ SHIPS[ship.type].description }}
            </p>

            <!-- Stats -->
            <div class="flex flex-wrap gap-3 text-xs text-slate-400 mb-3">
              <span class="flex items-center gap-1">
                <Icon name="mdi:sword" class="text-red-400" />
                {{ SHIPS[ship.type].stats.attack }}
              </span>
              <span class="flex items-center gap-1">
                <Icon name="mdi:shield" class="text-blue-400" />
                {{ SHIPS[ship.type].stats.defense }}
              </span>
              <span class="flex items-center gap-1">
                <Icon name="mdi:package-variant" class="text-yellow-400" />
                {{ formatNumber(SHIPS[ship.type].stats.cargo) }}
              </span>
              <span class="flex items-center gap-1">
                <Icon name="mdi:speedometer" class="text-green-400" />
                {{ formatNumber(SHIPS[ship.type].stats.speed) }}
              </span>
            </div>

            <!-- Cost per ship -->
            <div class="mb-3">
              <p class="text-xs text-slate-500 mb-1">Chi phí/tàu:</p>
              <div class="flex flex-wrap gap-2 text-xs">
                <span class="resource-metal">
                  <Icon name="mdi:gold" class="text-sm" />
                  {{ formatNumber(SHIPS[ship.type].cost.tinhThach) }}
                </span>
                <span class="resource-crystal">
                  <Icon name="mdi:diamond-stone" class="text-sm" />
                  {{ formatNumber(SHIPS[ship.type].cost.nangLuongVuTru) }}
                </span>
                <span v-if="SHIPS[ship.type].cost.honThach > 0" class="resource-deuterium">
                  <Icon name="mdi:water" class="text-sm" />
                  {{ formatNumber(SHIPS[ship.type].cost.honThach) }}
                </span>
              </div>
            </div>

            <!-- Build Controls -->
            <div v-if="!ship.isBuilding" class="flex items-center gap-2">
              <input
                v-model.number="buildQuantity[ship.type]"
                type="number"
                min="1"
                :max="maxBuildable(ship.type)"
                placeholder="1"
                class="input w-20 text-center text-sm"
              >
              <button
                class="btn-ghost text-xs px-2"
                @click="setMaxQuantity(ship.type)"
              >
                Max
              </button>
              <button
                :disabled="!canAffordShip(ship.type, buildQuantity[ship.type] || 1) || isAnyBuilding"
                class="btn-secondary flex-1 text-sm"
                :class="{ 'opacity-50 cursor-not-allowed': !canAffordShip(ship.type, buildQuantity[ship.type] || 1) || isAnyBuilding }"
              >
                <Icon name="mdi:hammer" />
                Chế tạo
              </button>
            </div>

            <!-- Building Progress -->
            <div v-else>
              <div class="flex items-center justify-between text-xs mb-1">
                <span class="text-secondary-400">
                  Đang chế tạo {{ ship.buildCount }} tàu...
                </span>
                <span class="font-mono text-slate-300">30:00</span>
              </div>
              <div class="progress-bar">
                <div class="progress-bar-fill bg-gradient-to-r from-secondary-500 to-secondary-400" style="width: 45%;" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
