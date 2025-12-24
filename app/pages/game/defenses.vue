<script setup lang="ts">
import { DefenseType } from '~/types/game'
import { DEFENSES } from '~/config/gameConfig'
import { formatNumber } from '~/utils/gameFormulas'
import { checkRequirements } from '~/utils/techTree'

definePageMeta({
  layout: 'game',
})

const { currentPlanet, buildQueue, processQueue, isLoading } = useGame()
const countdown = useCountdown()

const getDefenseRequirements = (type: DefenseType) => {
  const config = DEFENSES[type]
  if (!config.requirements) return []
  
  const planetBuildings = currentPlanet.value?.planet?.buildings || []
  const playerResearches = currentPlanet.value?.researches || []
  
  const check = checkRequirements(config.requirements, planetBuildings, playerResearches)
  return check.requirements
}

// Auto-refresh data
const refreshInterval = ref<NodeJS.Timeout | null>(null)

onMounted(async () => {
  // Process queue and refresh every 10 seconds
  refreshInterval.value = setInterval(async () => {
    await processQueue()
  }, 10000)
})

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
  }
})

// Get defenses from planet
const defenses = computed(() => {
  const planetDefenses = currentPlanet.value?.planet?.defenses || []
  const defensesArray = buildQueue.value?.defenses || []
  // All defense types with current count
  return Object.values(DefenseType).map(type => {
    const defenseQueue = defensesArray.find((q: any) => q.type === type && !q.isComplete)
    const existing = planetDefenses.find((d: any) => d.type === type)
    return {
      type,
      count: existing?.count || 0,
      isBuilding: !!defenseQueue,
      buildCount: defenseQueue?.count || 0,
    }
  })
})

// Resources from planet
const resources = computed(() => ({
  tinhThach: currentPlanet.value?.planet?.resources?.tinhThach || 0,
  nangLuongVuTru: currentPlanet.value?.planet?.resources?.nangLuongVuTru || 0,
  honThach: currentPlanet.value?.planet?.resources?.honThach || 0,
}))

const buildQuantity = ref<Record<string, number>>({})

const categories = [
  {
    name: 'Phòng Thủ Nhẹ',
    types: [
      DefenseType.BE_PHONG_TEN_LUA,
      DefenseType.PHAO_LASER_NHO,
      DefenseType.PHAO_LASER_LON,
      DefenseType.PHAO_ION,
    ],
  },
  {
    name: 'Phòng Thủ Nặng',
    types: [
      DefenseType.PHAO_GAUSS,
      DefenseType.PHAO_PLASMA,
    ],
  },
  {
    name: 'Lá Chắn',
    types: [
      DefenseType.VOM_KHIEN_NHO,
      DefenseType.VOM_KHIEN_LON,
    ],
  },
]

const activeCategory = ref('Phòng Thủ Nhẹ')

const filteredDefenses = computed(() => {
  const category = categories.find(c => c.name === activeCategory.value)
  if (!category) return defenses.value
  return defenses.value.filter(d => category.types.includes(d.type as DefenseType))
})

// Check if defenses are being built
const isAnyBuilding = computed(() => buildQueue.value?.defenses?.length > 0)
const defenseBuildQueue = computed(() => buildQueue.value?.defenses?.[0])

const calculateDefenseCost = (type: DefenseType, count: number = 1) => {
  const config = DEFENSES[type]
  return {
    tinhThach: config.cost.tinhThach * count,
    nangLuongVuTru: config.cost.nangLuongVuTru * count,
    honThach: config.cost.honThach * count,
  }
}

const canAffordDefense = (type: DefenseType, count: number = 1) => {
  const cost = calculateDefenseCost(type, count)
  return (
    resources.value.tinhThach >= cost.tinhThach &&
    resources.value.nangLuongVuTru >= cost.nangLuongVuTru &&
    resources.value.honThach >= cost.honThach
  )
}

const maxBuildable = (type: DefenseType) => {
  const config = DEFENSES[type]
  if (!config) return 0
  const cost = config.cost
  const byMetal = cost.tinhThach > 0 ? Math.floor(resources.value.tinhThach / cost.tinhThach) : Infinity
  const byCrystal = cost.nangLuongVuTru > 0 ? Math.floor(resources.value.nangLuongVuTru / cost.nangLuongVuTru) : Infinity
  const byDeut = cost.honThach > 0 ? Math.floor(resources.value.honThach / cost.honThach) : Infinity
  return Math.min(byMetal, byCrystal, byDeut, 9999)
}

const setMaxQuantity = (type: DefenseType) => {
  buildQuantity.value[type] = maxBuildable(type)
}

const buildError = ref<string | null>(null)

const handleBuild = async (type: DefenseType) => {
  const count = buildQuantity.value[type] || 1
  if (count < 1) return
  
  if (isAnyBuilding.value) return
  
  buildError.value = null
  try {
    const result = await $fetch('/api/game/defense/build', {
      method: 'POST',
      body: {
        planetId: currentPlanet.value?.planet?.id,
        defenseType: type,
        count,
      },
    })
    
    if (result.success) {
      await processQueue()
      buildQuantity.value[type] = 0
    }
  } catch (err: any) {
    buildError.value = err.data?.message || 'Xây dựng thất bại'
    setTimeout(() => {
      buildError.value = null
    }, 3000)
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-display font-bold text-gradient-cyan">Phòng Thủ</h1>
      <p class="text-neutral-500 mt-1">Xây dựng hệ thống phòng thủ để bảo vệ hành tinh</p>
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
        <IconsPhongThu class="w-5 h-5" />
        {{ category.name }}
      </button>
    </div>

    <!-- Building Queue -->
    <div v-if="defenseBuildQueue" class="neo-card p-3 md:p-4 border-l-2 border-alert-400">
      <div class="flex items-center gap-3">
        <IconsPhongThu class="w-6 h-6 text-alert-400 animate-pulse flex-shrink-0" />
        <div class="flex-1 min-w-0">
          <p class="font-medium truncate">
            Đang xây dựng {{ defenseBuildQueue.count }} {{ DEFENSES[defenseBuildQueue.type as DefenseType]?.name || defenseBuildQueue.type }}
          </p>
          <p class="text-sm text-neutral-500">
            Còn <span class="text-warning-400 font-mono text-base">{{ countdown.defenseFormattedVi.value }}</span>
          </p>
        </div>
      </div>
      <!-- Progress bar -->
      <div class="mt-3 h-1 bg-neutral-800 rounded-full overflow-hidden">
        <div 
          class="h-full bg-gradient-to-r from-alert-400 to-alert-500 transition-all duration-1000"
          :style="{ width: `${100 - (countdown.defenseRemaining.value / (defenseBuildQueue.remainingSeconds || 1)) * 100}%` }"
        />
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="buildError" class="neo-card p-4 border-l-2 border-alert-400">
      <div class="flex items-center gap-3">
        <IconsCanhBao class="w-6 h-6 text-alert-400" />
        <p class="text-alert-400">{{ buildError }}</p>
      </div>
    </div>

    <!-- Defenses Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="defense in filteredDefenses"
        :key="defense.type"
        class="neo-card neo-card-hover p-4"
        :class="{ 'border-alert-400/50 neo-active-pulse': defense.isBuilding }"
      >
        <div class="flex items-start gap-4">
          <div class="w-14 h-14 neo-card flex items-center justify-center border-alert-400/20">
            <IconsPhongThu class="w-8 h-8 text-alert-400" />
          </div>
          
          <div class="flex-1">
            <div class="flex items-center justify-between mb-1">
              <h3 class="font-display font-semibold">
                {{ DEFENSES[defense.type].name }}
              </h3>
              <span class="font-mono text-lg text-alert-400">{{ defense.count }}</span>
            </div>
            
            <p class="text-xs text-neutral-500 mb-2">
              {{ DEFENSES[defense.type].description }}
            </p>

            <!-- Requirements -->
            <GameRequirementList
              v-if="getDefenseRequirements(defense.type).length > 0 && !getDefenseRequirements(defense.type).every(r => r.met)"
              :requirements="getDefenseRequirements(defense.type)"
              class="mb-3"
            />

            <!-- Stats -->
            <div class="flex flex-wrap gap-3 text-xs text-neutral-500 mb-3 font-mono">
              <span class="flex items-center gap-1">
                <IconsTanCong class="w-3.5 h-3.5 text-alert-400" />
                {{ DEFENSES[defense.type].stats.attack }}
              </span>
              <span class="flex items-center gap-1">
                <IconsKhienLuc class="w-3.5 h-3.5 text-primary-500" />
                {{ DEFENSES[defense.type].stats.defense }}
              </span>
              <span class="flex items-center gap-1">
                <IconsPhongThu class="w-3.5 h-3.5 text-warning-400" />
                {{ DEFENSES[defense.type].stats.shield }}
              </span>
            </div>

            <!-- Cost per unit -->
            <div class="mb-3">
              <p class="text-xs text-neutral-500 mb-1 uppercase tracking-wider font-display">Chi phí/đơn vị:</p>
              <div class="flex flex-wrap gap-3 text-xs font-mono">
                <span class="flex items-center gap-1 text-neutral-400">
                  <IconsTinhThach class="w-3.5 h-3.5" />
                  {{ formatNumber(DEFENSES[defense.type].cost.tinhThach) }}
                </span>
                <span class="flex items-center gap-1 text-primary-500">
                  <IconsNangLuong class="w-3.5 h-3.5" />
                  {{ formatNumber(DEFENSES[defense.type].cost.nangLuongVuTru) }}
                </span>
                <span v-if="DEFENSES[defense.type].cost.honThach > 0" class="flex items-center gap-1 text-success-400">
                  <IconsHonThach class="w-3.5 h-3.5" />
                  {{ formatNumber(DEFENSES[defense.type].cost.honThach) }}
                </span>
              </div>
            </div>

            <!-- Build Controls -->
            <div v-if="!defense.isBuilding" class="flex items-center gap-2">
              <input
                v-model.number="buildQuantity[defense.type]"
                type="number"
                min="1"
                :max="maxBuildable(defense.type)"
                placeholder="1"
                class="neo-input w-20 text-center text-sm"
              >
              <button
                class="neo-btn-ghost text-xs px-2"
                @click="setMaxQuantity(defense.type)"
              >
                Max
              </button>
              <button
                :disabled="!canAffordDefense(defense.type, buildQuantity[defense.type] || 1) || isAnyBuilding || !getDefenseRequirements(defense.type).every(r => r.met)"
                class="flex-1 text-sm flex items-center justify-center gap-2"
                :class="canAffordDefense(defense.type, buildQuantity[defense.type] || 1) && !isAnyBuilding && getDefenseRequirements(defense.type).every(r => r.met) ? 'neo-btn-alert' : 'neo-btn-ghost opacity-50 cursor-not-allowed'"
                @click="handleBuild(defense.type)"
              >
                <IconsPhongThu class="w-4 h-4" />
                Xây dựng
              </button>
            </div>

            <!-- Building Progress -->
            <div v-else>
              <div class="flex items-center justify-between text-xs mb-1">
                <span class="text-alert-400">
                  Đang xây dựng {{ defense.buildCount }} đơn vị...
                </span>
                <span class="font-mono">
                  {{ countdown.defenseFormattedVi.value }}
                </span>
              </div>
              <div class="neo-progress neo-progress-red">
                <div class="neo-progress-fill" style="width: 45%;" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
