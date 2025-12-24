<script setup lang="ts">
import { ShipType } from '~/types/game'
import { SHIPS } from '~/config/gameConfig'
import { calculateShipCost, formatNumber } from '~/utils/gameFormulas'

definePageMeta({
  layout: 'game',
})

const { currentPlanet, buildQueue, fetchPlanet, fetchBuildQueue, buildShips, processQueue, isLoading } = useGame()

// Auto-refresh data
const refreshInterval = ref<NodeJS.Timeout | null>(null)

onMounted(async () => {
  await Promise.all([fetchPlanet(), fetchBuildQueue()])
  
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

// Get ships from planet
const ships = computed(() => {
  const planetShips = currentPlanet.value?.planet?.ships || []
  // All ship types with current count
  return Object.values(ShipType).map(type => {
    const existing = planetShips.find((s: any) => s.type === type)
    return {
      type,
      count: existing?.count || 0,
    }
  })
})

// Resources from planet
const resources = computed(() => ({
  tinhThach: currentPlanet.value?.planet?.resources?.tinhThach || 0,
  nangLuongVuTru: currentPlanet.value?.planet?.resources?.nangLuongVuTru || 0,
  honThach: currentPlanet.value?.planet?.resources?.honThach || 0,
}))

// Shipyard level from planet buildings
const shipyardLevel = computed(() => {
  const buildings = currentPlanet.value?.planet?.buildings || []
  return buildings.find((b: any) => b.type === 'XUONG_DONG_TAU')?.level || 0
})

const buildQuantity = ref<Record<string, number>>({})

const categories = [
  {
    name: 'Tàu Chiến',
    types: [ShipType.TIEU_CHIEN_HAM, ShipType.TRUNG_CHIEN_HAM, ShipType.TUAN_DUONG_HAM, ShipType.THIET_GIAP_HAM, ShipType.HAC_LONG_HAM],
  },
  {
    name: 'Tàu Hỗ Trợ',
    types: [ShipType.VAN_TAI_NHO, ShipType.VAN_TAI_LON, ShipType.TAU_THUOC_DIA, ShipType.TAU_DO_THAM, ShipType.TAU_TAI_CHE],
  },
]

const activeCategory = ref('Tàu Chiến')

const filteredShips = computed(() => {
  const category = categories.find(c => c.name === activeCategory.value)
  if (!category) return ships.value
  return ships.value.filter(s => category.types.includes(s.type as ShipType))
})

// Check if ships are being built
const isAnyBuilding = computed(() => buildQueue.value?.ships?.length > 0)
const shipBuildQueue = computed(() => buildQueue.value?.ships?.[0])

const canAffordShip = (type: ShipType, count: number = 1) => {
  const cost = calculateShipCost(type, count)
  return (
    resources.value.tinhThach >= cost.tinhThach &&
    resources.value.nangLuongVuTru >= cost.nangLuongVuTru &&
    resources.value.honThach >= cost.honThach
  )
}

const maxBuildable = (type: ShipType) => {
  const config = SHIPS[type]
  if (!config) return 0
  const cost = config.cost
  const byMetal = cost.tinhThach > 0 ? Math.floor(resources.value.tinhThach / cost.tinhThach) : Infinity
  const byCrystal = cost.nangLuongVuTru > 0 ? Math.floor(resources.value.nangLuongVuTru / cost.nangLuongVuTru) : Infinity
  const byDeut = cost.honThach > 0 ? Math.floor(resources.value.honThach / cost.honThach) : Infinity
  return Math.min(byMetal, byCrystal, byDeut, 9999)
}

const setMaxQuantity = (type: ShipType) => {
  buildQuantity.value[type] = maxBuildable(type)
}

const buildError = ref<string | null>(null)

const handleBuild = async (type: ShipType) => {
  const count = buildQuantity.value[type] || 1
  if (count < 1 || !canAffordShip(type, count)) return
  
  buildError.value = null
  const result = await buildShips(type, count)
  
  if (!result.success) {
    buildError.value = result.error || 'Chế tạo thất bại'
    setTimeout(() => {
      buildError.value = null
    }, 3000)
  } else {
    buildQuantity.value[type] = 0
  }
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
    <div v-if="currentPlanet" class="glass-card p-4 flex items-center gap-4">
      <div class="w-12 h-12 rounded-lg bg-secondary-500/20 flex items-center justify-center">
        <IconsXuongDongTau class="w-8 h-8 text-secondary-400" />
      </div>
      <div>
        <p class="font-medium text-slate-200">Xưởng Đóng Tàu</p>
        <p class="text-sm text-slate-400">Cấp {{ shipyardLevel }} - Chế tạo nhanh hơn {{ shipyardLevel * 10 }}%</p>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="buildError" class="glass-card p-4 border-l-4 border-red-500">
      <div class="flex items-center gap-3">
        <IconsCanhBao class="w-6 h-6 text-red-400" />
        <p class="text-red-400">{{ buildError }}</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading && !currentPlanet" class="flex items-center justify-center py-12">
      <div class="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"></div>
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
        <IconsChienHam class="w-5 h-5" />
        {{ category.name }}
      </button>
    </div>

    <!-- Building Queue -->
    <div v-if="shipBuildQueue" class="glass-card p-4 border-l-4 border-secondary-500">
      <div class="flex items-center gap-3">
        <IconsXuongDongTau class="w-6 h-6 text-secondary-400 animate-pulse" />
        <div class="flex-1">
          <p class="font-medium text-slate-200">
            Đang chế tạo {{ shipBuildQueue.count }} {{ SHIPS[shipBuildQueue.type as ShipType]?.name || shipBuildQueue.type }}
          </p>
          <p class="text-sm text-slate-400">
            Còn {{ Math.floor((shipBuildQueue.remainingSeconds || 0) / 60) }}m {{ (shipBuildQueue.remainingSeconds || 0) % 60 }}s
          </p>
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
            <IconsChienHam class="w-8 h-8 text-secondary-400" />
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
                <IconsTanCong class="w-3.5 h-3.5 text-red-400" />
                {{ SHIPS[ship.type].stats.attack }}
              </span>
              <span class="flex items-center gap-1">
                <IconsKhienLuc class="w-3.5 h-3.5 text-blue-400" />
                {{ SHIPS[ship.type].stats.defense }}
              </span>
              <span class="flex items-center gap-1">
                <IconsVanChuyen class="w-3.5 h-3.5 text-yellow-400" />
                {{ formatNumber(SHIPS[ship.type].stats.cargo) }}
              </span>
              <span class="flex items-center gap-1">
                <IconsTocDo class="w-3.5 h-3.5 text-green-400" />
                {{ formatNumber(SHIPS[ship.type].stats.speed) }}
              </span>
            </div>

            <!-- Cost per ship -->
            <div class="mb-3">
              <p class="text-xs text-slate-500 mb-1">Chi phí/tàu:</p>
              <div class="flex flex-wrap gap-2 text-xs">
                <span class="resource-metal flex items-center gap-1">
                  <IconsTinhThach class="w-4 h-4" />
                  {{ formatNumber(SHIPS[ship.type].cost.tinhThach) }}
                </span>
                <span class="resource-crystal flex items-center gap-1">
                  <IconsNangLuong class="w-4 h-4" />
                  {{ formatNumber(SHIPS[ship.type].cost.nangLuongVuTru) }}
                </span>
                <span v-if="SHIPS[ship.type].cost.honThach > 0" class="resource-deuterium flex items-center gap-1">
                  <IconsHonThach class="w-4 h-4" />
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
                @click="handleBuild(ship.type)"
              >
                <IconsXuongDongTau class="w-4 h-4" />
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
