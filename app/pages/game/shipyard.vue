<script setup lang="ts">
import { ShipType } from '~/types/game'
import { SHIPS } from '~/config/gameConfig'
import { calculateShipCost, formatNumber } from '~/utils/gameFormulas'

definePageMeta({
  layout: 'game',
})

const { currentPlanet, buildQueue, buildShips, processQueue, isLoading } = useGame()

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

// Get ships from planet
const ships = computed(() => {
  const planetShips = currentPlanet.value?.planet?.ships || {}
  // All ship types with current count
  return Object.values(ShipType).map(type => {
    const shipQueue = buildQueue.value?.find((q: any) => q.type === 'SHIP' && q.shipType === type && !q.isComplete)
    return {
      type,
      count: (planetShips as Record<string, number>)[type] || 0,
      isBuilding: !!shipQueue,
      buildCount: shipQueue?.count || 0,
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
  const result = await buildShips(type, count) as { success: boolean; error?: string }
  
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
      <h1 class="text-2xl font-display font-bold text-gradient-cyan">Xưởng Đóng Tàu</h1>
      <p class="text-neutral-500 mt-1">Chế tạo tàu chiến và tàu hỗ trợ cho hạm đội của bạn</p>
    </div>

    <!-- Shipyard Info -->
    <div v-if="currentPlanet" class="neo-card p-4 flex items-center gap-4">
      <div class="w-12 h-12 neo-card flex items-center justify-center border-success-400/30">
        <IconsXuongDongTau class="w-8 h-8 text-success-400" />
      </div>
      <div>
        <p class="font-medium">Xưởng Đóng Tàu</p>
        <p class="text-sm text-neutral-500">Cấp <span class="text-success-400 font-mono">{{ shipyardLevel }}</span> - Chế tạo nhanh hơn {{ shipyardLevel * 10 }}%</p>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="buildError" class="neo-card p-4 border-l-2 border-alert-400">
      <div class="flex items-center gap-3">
        <IconsCanhBao class="w-6 h-6 text-alert-400" />
        <p class="text-alert-400">{{ buildError }}</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading && !currentPlanet" class="flex items-center justify-center py-12">
      <div class="neo-spinner"></div>
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
        <IconsChienHam class="w-5 h-5" />
        {{ category.name }}
      </button>
    </div>

    <!-- Building Queue -->
    <div v-if="shipBuildQueue" class="neo-card p-4 border-l-2 border-success-400">
      <div class="flex items-center gap-3">
        <IconsXuongDongTau class="w-6 h-6 text-success-400 neo-pulse" />
        <div class="flex-1">
          <p class="font-medium">
            Đang chế tạo {{ shipBuildQueue.count }} {{ SHIPS[shipBuildQueue.type as ShipType]?.name || shipBuildQueue.type }}
          </p>
          <p class="text-sm text-neutral-500">
            Còn <span class="text-warning-400 font-mono">{{ Math.floor((shipBuildQueue.remainingSeconds || 0) / 60) }}m {{ (shipBuildQueue.remainingSeconds || 0) % 60 }}s</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Ships Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="ship in filteredShips"
        :key="ship.type"
        class="neo-card neo-card-hover p-4"
        :class="{ 'border-success-400/50 neo-active-pulse': ship.isBuilding }"
      >
        <div class="flex items-start gap-4">
          <div class="w-14 h-14 neo-card flex items-center justify-center border-success-400/20">
            <IconsChienHam class="w-8 h-8 text-success-400" />
          </div>
          
          <div class="flex-1">
            <div class="flex items-center justify-between mb-1">
              <h3 class="font-display font-semibold">
                {{ SHIPS[ship.type].name }}
              </h3>
              <span class="font-mono text-lg text-success-400">{{ ship.count }}</span>
            </div>
            
            <p class="text-xs text-neutral-500 mb-2">
              {{ SHIPS[ship.type].description }}
            </p>

            <!-- Stats -->
            <div class="flex flex-wrap gap-3 text-xs text-neutral-500 mb-3 font-mono">
              <span class="flex items-center gap-1">
                <IconsTanCong class="w-3.5 h-3.5 text-alert-400" />
                {{ SHIPS[ship.type].stats.attack }}
              </span>
              <span class="flex items-center gap-1">
                <IconsKhienLuc class="w-3.5 h-3.5 text-primary-500" />
                {{ SHIPS[ship.type].stats.defense }}
              </span>
              <span class="flex items-center gap-1">
                <IconsVanChuyen class="w-3.5 h-3.5 text-warning-400" />
                {{ formatNumber(SHIPS[ship.type].stats.cargo) }}
              </span>
              <span class="flex items-center gap-1">
                <IconsTocDo class="w-3.5 h-3.5 text-success-400" />
                {{ formatNumber(SHIPS[ship.type].stats.speed) }}
              </span>
            </div>

            <!-- Cost per ship -->
            <div class="mb-3">
              <p class="text-xs text-neutral-500 mb-1 uppercase tracking-wider font-display">Chi phí/tàu:</p>
              <div class="flex flex-wrap gap-3 text-xs font-mono">
                <span class="flex items-center gap-1 text-neutral-400">
                  <IconsTinhThach class="w-3.5 h-3.5" />
                  {{ formatNumber(SHIPS[ship.type].cost.tinhThach) }}
                </span>
                <span class="flex items-center gap-1 text-primary-500">
                  <IconsNangLuong class="w-3.5 h-3.5" />
                  {{ formatNumber(SHIPS[ship.type].cost.nangLuongVuTru) }}
                </span>
                <span v-if="SHIPS[ship.type].cost.honThach > 0" class="flex items-center gap-1 text-success-400">
                  <IconsHonThach class="w-3.5 h-3.5" />
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
                class="neo-input w-20 text-center text-sm"
              >
              <button
                class="neo-btn-ghost text-xs px-2"
                @click="setMaxQuantity(ship.type)"
              >
                Max
              </button>
              <button
                :disabled="!canAffordShip(ship.type, buildQuantity[ship.type] || 1) || isAnyBuilding"
                class="flex-1 text-sm flex items-center justify-center gap-2"
                :class="canAffordShip(ship.type, buildQuantity[ship.type] || 1) && !isAnyBuilding ? 'neo-btn-success' : 'neo-btn-ghost opacity-50 cursor-not-allowed'"
                @click="handleBuild(ship.type)"
              >
                <IconsXuongDongTau class="w-4 h-4" />
                Chế tạo
              </button>
            </div>

            <!-- Building Progress -->
            <div v-else>
              <div class="flex items-center justify-between text-xs mb-1">
                <span class="text-success-400">
                  Đang chế tạo {{ ship.buildCount }} tàu...
                </span>
                <span class="font-mono">30:00</span>
              </div>
              <div class="neo-progress neo-progress-green">
                <div class="neo-progress-fill" style="width: 45%;" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
