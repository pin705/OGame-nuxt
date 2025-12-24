<script setup lang="ts">
import { ResearchType } from '~/types/game'
import { RESEARCHES } from '~/config/gameConfig'
import { calculateResearchCost, formatNumber, formatDuration } from '~/utils/gameFormulas'

definePageMeta({
  layout: 'game',
})

const { currentPlanet, buildQueue, isLoading, startResearch } = useGame()

// Get research data from current planet
const researches = computed(() => {
  if (!currentPlanet.value?.research) return []
  const research = currentPlanet.value.research
  return Object.entries(research).map(([type, level]) => ({
    type: type as ResearchType,
    level: level as number,
    isResearching: false,
    buildCount: 0,
  }))
})

// Get resources from planet
const resources = computed(() => currentPlanet.value?.resources || {
  tinhThach: 0,
  nangLuongVuTru: 0,
  honThach: 0,
  dienNang: 0,
})

// Get lab level
const labLevel = computed(() => currentPlanet.value?.buildings?.vienNghienCuu || 1)

// Check build queue for active research
const researchQueue = computed(() => {
  return buildQueue.value.find((q: any) => q.type === 'RESEARCH' && !q.isComplete)
})

const categories = [
  {
    name: 'Năng Lượng & Khai Thác',
    types: [ResearchType.CONG_NGHE_NANG_LUONG, ResearchType.CONG_NGHE_KHAI_THAC],
  },
  {
    name: 'Chiến Đấu',
    types: [ResearchType.CONG_NGHE_VU_KHI, ResearchType.CONG_NGHE_GIAP, ResearchType.CONG_NGHE_KHIEN],
  },
  {
    name: 'Động Cơ',
    types: [ResearchType.DONG_CO_DOT_CHAY, ResearchType.DONG_CO_XUNG, ResearchType.DONG_CO_SIEU_KHONG_GIAN],
  },
  {
    name: 'Nâng Cao',
    types: [ResearchType.CONG_NGHE_GIAN_DIEP, ResearchType.CONG_NGHE_MAY_TINH, ResearchType.CONG_NGHE_SIEU_KHONG_GIAN],
  },
]

const activeCategory = ref('Năng Lượng & Khai Thác')

const filteredResearches = computed(() => {
  const category = categories.find(c => c.name === activeCategory.value)
  if (!category) return researches.value
  return researches.value.filter(r => category.types.includes(r.type))
})

const isAnyResearching = computed(() => !!researchQueue.value)

const canAffordResearch = (type: ResearchType, currentLevel: number) => {
  const cost = calculateResearchCost(type, currentLevel + 1)
  return (
    resources.value.tinhThach >= cost.tinhThach &&
    resources.value.nangLuongVuTru >= cost.nangLuongVuTru &&
    resources.value.honThach >= cost.honThach
  )
}

const researchError = ref<string | null>(null)

const handleResearch = async (type: ResearchType, currentLevel: number) => {
  if (isAnyResearching.value || !canAffordResearch(type, currentLevel)) return
  
  researchError.value = null
  const result = await startResearch(type)
  
  if (!result.success) {
    researchError.value = result.error || 'Nghiên cứu thất bại'
    setTimeout(() => {
      researchError.value = null
    }, 3000)
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-display font-bold">Nghiên Cứu</h1>
      <p class="text-slate-400">Phát triển công nghệ để nâng cao sức mạnh đế chế</p>
    </div>

    <!-- Lab Info -->
    <div v-if="currentPlanet" class="glass-card p-4 flex items-center gap-4">
      <div class="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
        <IconsNghienCuu class="w-8 h-8 text-blue-400" />
      </div>
      <div>
        <p class="font-medium text-slate-200">Viện Nghiên Cứu</p>
        <p class="text-sm text-slate-400">Cấp {{ labLevel }} - Nghiên cứu nhanh hơn {{ labLevel * 10 }}%</p>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="researchError" class="glass-card p-4 border-l-4 border-red-500">
      <div class="flex items-center gap-3">
        <IconsCanhBao class="w-6 h-6 text-red-400" />
        <p class="text-red-400">{{ researchError }}</p>
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
            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            : 'bg-space-800/50 text-slate-400 border border-space-700 hover:bg-space-700'
        "
        @click="activeCategory = category.name"
      >
        <IconsNghienCuu class="w-5 h-5" />
        {{ category.name }}
      </button>
    </div>

    <!-- Warning if researching -->
    <div v-if="isAnyResearching" class="glass-card p-4 border-l-4 border-blue-500">
      <div class="flex items-center gap-3">
        <IconsNghienCuu class="w-6 h-6 text-blue-400 animate-pulse" />
        <div class="flex-1">
          <p class="font-medium text-slate-200">
            Đang nghiên cứu {{ RESEARCHES[researchQueue?.researchType as ResearchType]?.name || 'Công nghệ' }}
          </p>
          <p class="text-sm text-slate-400">
            Còn {{ Math.floor((researchQueue?.remainingSeconds || 0) / 60) }}m {{ (researchQueue?.remainingSeconds || 0) % 60 }}s
          </p>
        </div>
      </div>
    </div>

    <!-- Research Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="research in filteredResearches"
        :key="research.type"
        class="glass-card-hover p-4"
        :class="{ 'ring-2 ring-blue-500 animate-pulse': researchQueue?.researchType === research.type }"
      >
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-lg bg-blue-900/30 flex items-center justify-center flex-shrink-0">
            <IconsNghienCuu class="w-8 h-8 text-blue-400" />
          </div>
          
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-display font-semibold text-slate-100">
                {{ RESEARCHES[research.type]?.name || research.type }}
              </h3>
              <span class="font-mono text-sm text-blue-400">Cấp {{ research.level }}</span>
            </div>
            
            <p class="text-xs text-slate-500 mb-3">
              {{ RESEARCHES[research.type]?.description || '' }}
            </p>

            <!-- Cost -->
            <div v-if="researchQueue?.researchType !== research.type" class="mb-3">
              <p class="text-xs text-slate-500 mb-1">Chi phí cấp {{ research.level + 1 }}:</p>
              <div class="flex flex-wrap gap-2 text-xs">
                <span class="resource-metal flex items-center gap-1">
                  <IconsTinhThach class="w-4 h-4" />
                  {{ formatNumber(calculateResearchCost(research.type, research.level + 1).tinhThach) }}
                </span>
                <span class="resource-crystal flex items-center gap-1">
                  <IconsNangLuong class="w-4 h-4" />
                  {{ formatNumber(calculateResearchCost(research.type, research.level + 1).nangLuongVuTru) }}
                </span>
                <span v-if="calculateResearchCost(research.type, research.level + 1).honThach > 0" class="resource-deuterium flex items-center gap-1">
                  <IconsHonThach class="w-4 h-4" />
                  {{ formatNumber(calculateResearchCost(research.type, research.level + 1).honThach) }}
                </span>
              </div>
            </div>

            <!-- Progress if researching -->
            <div v-else class="mb-3">
              <div class="flex items-center justify-between text-xs mb-1">
                <span class="text-blue-400">Đang nghiên cứu...</span>
                <span class="font-mono text-slate-300">
                  {{ Math.floor((researchQueue?.remainingSeconds || 0) / 60) }}:{{ String((researchQueue?.remainingSeconds || 0) % 60).padStart(2, '0') }}
                </span>
              </div>
              <div class="progress-bar">
                <div class="progress-bar-fill bg-gradient-to-r from-blue-500 to-blue-400" style="width: 40%;" />
              </div>
            </div>

            <!-- Button -->
            <button
              v-if="researchQueue?.researchType !== research.type"
              :disabled="!canAffordResearch(research.type, research.level) || isAnyResearching"
              class="btn-primary text-sm w-full flex items-center justify-center gap-2"
              :class="{ 'opacity-50 cursor-not-allowed': !canAffordResearch(research.type, research.level) || isAnyResearching }"
              @click="handleResearch(research.type, research.level)"
            >
              <IconsNghienCuu class="w-4 h-4" />
              Nghiên cứu cấp {{ research.level + 1 }}
            </button>
            <button
              v-else
              disabled
              class="btn-outline text-sm w-full opacity-50 cursor-not-allowed flex items-center justify-center gap-2"
            >
              <IconsThoiGian class="w-4 h-4" />
              Đang nghiên cứu...
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
