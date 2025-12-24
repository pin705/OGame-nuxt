<script setup lang="ts">
import { ResearchType } from '~/types/game'
import { RESEARCHES } from '~/config/gameConfig'
import { calculateResearchCost, formatNumber, formatDuration } from '~/utils/gameFormulas'

definePageMeta({
  layout: 'game',
})

const { currentPlanet, buildQueue, isLoading, startResearch } = useGame()
const countdown = useCountdown()

// Get research data from API (researches are player-wide, returned with planet data)
const researches = computed(() => {
  // API returns researches array in currentPlanet.value.researches
  const researchData = currentPlanet.value?.researches || []
  
  // If no research data, create default list with all research types at level 0
  const allTypes = Object.values(ResearchType)
  
  return allTypes.map(type => {
    // Find existing research from API data
    const existing = researchData.find((r: any) => r.type === type)
    return {
      type: type as ResearchType,
      level: existing?.level || 0,
      isResearching: researchQueue.value?.type === type,
    }
  })
})

// Get resources from planet
const resources = computed(() => currentPlanet.value?.planet?.resources || {
  tinhThach: 0,
  nangLuongVuTru: 0,
  honThach: 0,
  dienNang: 0,
})

// Get lab level from planet buildings
const labLevel = computed(() => {
  const buildings = currentPlanet.value?.planet?.buildings || []
  const lab = buildings.find((b: any) => b.type === 'VIEN_NGHIEN_CUU')
  return lab?.level || 0
})

// Check build queue for active research
// API returns: { building: {...}, research: {...}, ships: [...], defenses: [...] }
const researchQueue = computed(() => {
  const queue = buildQueue.value?.research
  return queue && !queue.isComplete ? queue : null
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
  const result = await startResearch(type) as { success: boolean; error?: string }
  
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
      <h1 class="text-2xl font-display font-bold text-gradient-cyan">Nghiên Cứu</h1>
      <p class="text-neutral-500 mt-1">Phát triển công nghệ để nâng cao sức mạnh đế chế</p>
    </div>

    <!-- Lab Info -->
    <div v-if="currentPlanet" class="neo-card p-4 flex items-center gap-4">
      <div class="w-12 h-12 neo-card flex items-center justify-center border-primary-500/30">
        <IconsNghienCuu class="w-8 h-8 text-primary-500" />
      </div>
      <div>
        <p class="font-medium">Viện Nghiên Cứu</p>
        <p class="text-sm text-neutral-500">Cấp <span class="text-primary-500 font-mono">{{ labLevel }}</span> - Nghiên cứu nhanh hơn {{ labLevel * 10 }}%</p>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="researchError" class="neo-card p-4 border-l-2 border-alert-400">
      <div class="flex items-center gap-3">
        <IconsCanhBao class="w-6 h-6 text-alert-400" />
        <p class="text-alert-400">{{ researchError }}</p>
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
        <IconsNghienCuu class="w-5 h-5" />
        {{ category.name }}
      </button>
    </div>

    <!-- Warning if researching -->
    <div v-if="isAnyResearching" class="neo-card p-3 md:p-4 border-l-2 border-primary-500">
      <div class="flex items-center gap-3">
        <IconsNghienCuu class="w-6 h-6 text-primary-500 animate-pulse flex-shrink-0" />
        <div class="flex-1 min-w-0">
          <p class="font-medium truncate">
            Đang nghiên cứu {{ RESEARCHES[researchQueue?.type as ResearchType]?.name || 'Công nghệ' }}
          </p>
          <p class="text-sm text-neutral-500">
            Còn <span class="text-warning-400 font-mono text-base">{{ countdown.researchFormattedVi.value }}</span>
          </p>
        </div>
      </div>
      <!-- Progress bar -->
      <div class="mt-3 h-1 bg-neutral-800 rounded-full overflow-hidden">
        <div 
          class="h-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-1000"
          :style="{ width: `${100 - (countdown.researchRemaining.value / (researchQueue?.remainingSeconds || 1)) * 100}%` }"
        />
      </div>
    </div>

    <!-- Research Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="research in filteredResearches"
        :key="research.type"
        class="neo-card neo-card-hover p-4"
        :class="{ 'border-primary-500/50 neo-active-pulse': researchQueue?.researchType === research.type }"
      >
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 neo-card flex items-center justify-center border-primary-500/20">
            <IconsNghienCuu class="w-8 h-8 text-primary-500" />
          </div>
          
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-display font-semibold">
                {{ RESEARCHES[research.type]?.name || research.type }}
              </h3>
              <span class="font-mono text-sm text-primary-500">Cấp {{ research.level }}</span>
            </div>
            
            <p class="text-xs text-neutral-500 mb-3">
              {{ RESEARCHES[research.type]?.description || '' }}
            </p>

            <!-- Cost -->
            <div v-if="researchQueue?.researchType !== research.type" class="mb-3">
              <p class="text-xs text-neutral-500 mb-1 uppercase tracking-wider font-display">Chi phí cấp {{ research.level + 1 }}:</p>
              <div class="flex flex-wrap gap-3 text-xs font-mono">
                <span class="flex items-center gap-1 text-neutral-400">
                  <IconsTinhThach class="w-3.5 h-3.5" />
                  {{ formatNumber(calculateResearchCost(research.type, research.level + 1).tinhThach) }}
                </span>
                <span class="flex items-center gap-1 text-primary-500">
                  <IconsNangLuong class="w-3.5 h-3.5" />
                  {{ formatNumber(calculateResearchCost(research.type, research.level + 1).nangLuongVuTru) }}
                </span>
                <span v-if="calculateResearchCost(research.type, research.level + 1).honThach > 0" class="flex items-center gap-1 text-success-400">
                  <IconsHonThach class="w-3.5 h-3.5" />
                  {{ formatNumber(calculateResearchCost(research.type, research.level + 1).honThach) }}
                </span>
              </div>
            </div>

            <!-- Progress if researching -->
            <div v-else class="mb-3">
              <div class="flex items-center justify-between text-xs mb-1">
                <span class="text-primary-500">Đang nghiên cứu...</span>
                <span class="font-mono">
                  {{ Math.floor((researchQueue?.remainingSeconds || 0) / 60) }}:{{ String((researchQueue?.remainingSeconds || 0) % 60).padStart(2, '0') }}
                </span>
              </div>
              <div class="neo-progress neo-progress-cyan">
                <div class="neo-progress-fill" style="width: 40%;" />
              </div>
            </div>

            <!-- Button -->
            <button
              v-if="researchQueue?.researchType !== research.type"
              :disabled="!canAffordResearch(research.type, research.level) || isAnyResearching"
              class="text-sm w-full flex items-center justify-center gap-2"
              :class="canAffordResearch(research.type, research.level) && !isAnyResearching ? 'neo-btn-primary' : 'neo-btn-ghost opacity-50 cursor-not-allowed'"
              @click="handleResearch(research.type, research.level)"
            >
              <IconsNghienCuu class="w-4 h-4" />
              Nghiên cứu cấp {{ research.level + 1 }}
            </button>
            <button
              v-else
              disabled
              class="neo-btn-outline text-sm w-full opacity-50 cursor-not-allowed flex items-center justify-center gap-2"
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
