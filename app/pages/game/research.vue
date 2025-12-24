<script setup lang="ts">
import { ResearchType } from '~/types/game'
import { RESEARCHES } from '~/config/gameConfig'
import { calculateResearchCost, formatNumber, formatDuration } from '~/utils/gameFormulas'

definePageMeta({
  layout: 'game',
})

// Mock data
const researches = ref([
  { type: ResearchType.CONG_NGHE_NANG_LUONG, level: 5, isResearching: false },
  { type: ResearchType.CONG_NGHE_KHAI_THAC, level: 3, isResearching: true, endTime: new Date(Date.now() + 7200000) },
  { type: ResearchType.CONG_NGHE_VU_KHI, level: 4, isResearching: false },
  { type: ResearchType.CONG_NGHE_GIAP, level: 3, isResearching: false },
  { type: ResearchType.CONG_NGHE_KHIEN, level: 2, isResearching: false },
  { type: ResearchType.DONG_CO_DOT_CHAY, level: 6, isResearching: false },
  { type: ResearchType.DONG_CO_XUNG, level: 4, isResearching: false },
  { type: ResearchType.DONG_CO_SIEU_KHONG_GIAN, level: 0, isResearching: false },
  { type: ResearchType.CONG_NGHE_GIAN_DIEP, level: 3, isResearching: false },
  { type: ResearchType.CONG_NGHE_MAY_TINH, level: 5, isResearching: false },
  { type: ResearchType.CONG_NGHE_SIEU_KHONG_GIAN, level: 0, isResearching: false },
])

const resources = ref({
  tinhThach: 1250000,
  nangLuongVuTru: 680000,
  honThach: 320000,
})

const labLevel = 7

const categories = [
  {
    name: 'Năng Lượng & Khai Thác',
    icon: 'mdi:lightning-bolt',
    types: [ResearchType.CONG_NGHE_NANG_LUONG, ResearchType.CONG_NGHE_KHAI_THAC],
  },
  {
    name: 'Chiến Đấu',
    icon: 'mdi:sword',
    types: [ResearchType.CONG_NGHE_VU_KHI, ResearchType.CONG_NGHE_GIAP, ResearchType.CONG_NGHE_KHIEN],
  },
  {
    name: 'Động Cơ',
    icon: 'mdi:rocket',
    types: [ResearchType.DONG_CO_DOT_CHAY, ResearchType.DONG_CO_XUNG, ResearchType.DONG_CO_SIEU_KHONG_GIAN],
  },
  {
    name: 'Nâng Cao',
    icon: 'mdi:chip',
    types: [ResearchType.CONG_NGHE_GIAN_DIEP, ResearchType.CONG_NGHE_MAY_TINH, ResearchType.CONG_NGHE_SIEU_KHONG_GIAN],
  },
]

const activeCategory = ref('Năng Lượng & Khai Thác')

const filteredResearches = computed(() => {
  const category = categories.find(c => c.name === activeCategory.value)
  if (!category) return researches.value
  return researches.value.filter(r => category.types.includes(r.type))
})

const isAnyResearching = computed(() => researches.value.some(r => r.isResearching))

const canAffordResearch = (type: ResearchType, currentLevel: number) => {
  const cost = calculateResearchCost(type, currentLevel + 1)
  return (
    resources.value.tinhThach >= cost.tinhThach &&
    resources.value.nangLuongVuTru >= cost.nangLuongVuTru &&
    resources.value.honThach >= cost.honThach
  )
}

const getIconForResearch = (type: ResearchType) => {
  const iconMap: Record<string, string> = {
    [ResearchType.CONG_NGHE_NANG_LUONG]: 'mdi:lightning-bolt',
    [ResearchType.CONG_NGHE_KHAI_THAC]: 'mdi:pickaxe',
    [ResearchType.CONG_NGHE_VU_KHI]: 'mdi:sword',
    [ResearchType.CONG_NGHE_GIAP]: 'mdi:shield',
    [ResearchType.CONG_NGHE_KHIEN]: 'mdi:shield-star',
    [ResearchType.DONG_CO_DOT_CHAY]: 'mdi:fire',
    [ResearchType.DONG_CO_XUNG]: 'mdi:flash',
    [ResearchType.DONG_CO_SIEU_KHONG_GIAN]: 'mdi:space-station',
    [ResearchType.CONG_NGHE_GIAN_DIEP]: 'mdi:eye',
    [ResearchType.CONG_NGHE_MAY_TINH]: 'mdi:desktop-tower',
    [ResearchType.CONG_NGHE_SIEU_KHONG_GIAN]: 'mdi:atom',
  }
  return iconMap[type] || 'mdi:flask'
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
    <div class="glass-card p-4 flex items-center gap-4">
      <div class="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
        <Icon name="mdi:flask" class="text-2xl text-blue-400" />
      </div>
      <div>
        <p class="font-medium text-slate-200">Viện Nghiên Cứu</p>
        <p class="text-sm text-slate-400">Cấp {{ labLevel }} - Nghiên cứu nhanh hơn {{ labLevel * 10 }}%</p>
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
            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            : 'bg-space-800/50 text-slate-400 border border-space-700 hover:bg-space-700'
        "
        @click="activeCategory = category.name"
      >
        <Icon :name="category.icon" />
        {{ category.name }}
      </button>
    </div>

    <!-- Warning if researching -->
    <div v-if="isAnyResearching" class="glass-card p-4 border-l-4 border-blue-500">
      <div class="flex items-center gap-3">
        <Icon name="mdi:flask" class="text-2xl text-blue-400 animate-pulse" />
        <div>
          <p class="font-medium text-slate-200">Đang nghiên cứu</p>
          <p class="text-sm text-slate-400">Bạn chỉ có thể nghiên cứu 1 công nghệ cùng lúc.</p>
        </div>
      </div>
    </div>

    <!-- Research Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="research in filteredResearches"
        :key="research.type"
        class="glass-card-hover p-4"
        :class="{ 'ring-2 ring-blue-500 animate-pulse': research.isResearching }"
      >
        <div class="flex items-start gap-4">
          <div class="w-12 h-12 rounded-lg bg-blue-900/30 flex items-center justify-center flex-shrink-0">
            <Icon :name="getIconForResearch(research.type)" class="text-2xl text-blue-400" />
          </div>
          
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-display font-semibold text-slate-100">
                {{ RESEARCHES[research.type].name }}
              </h3>
              <span class="font-mono text-sm text-blue-400">Cấp {{ research.level }}</span>
            </div>
            
            <p class="text-xs text-slate-500 mb-3">
              {{ RESEARCHES[research.type].description }}
            </p>

            <!-- Cost -->
            <div v-if="!research.isResearching" class="mb-3">
              <p class="text-xs text-slate-500 mb-1">Chi phí cấp {{ research.level + 1 }}:</p>
              <div class="flex flex-wrap gap-2 text-xs">
                <span class="resource-metal">
                  <Icon name="mdi:gold" class="text-sm" />
                  {{ formatNumber(calculateResearchCost(research.type, research.level + 1).tinhThach) }}
                </span>
                <span class="resource-crystal">
                  <Icon name="mdi:diamond-stone" class="text-sm" />
                  {{ formatNumber(calculateResearchCost(research.type, research.level + 1).nangLuongVuTru) }}
                </span>
                <span v-if="calculateResearchCost(research.type, research.level + 1).honThach > 0" class="resource-deuterium">
                  <Icon name="mdi:water" class="text-sm" />
                  {{ formatNumber(calculateResearchCost(research.type, research.level + 1).honThach) }}
                </span>
              </div>
            </div>

            <!-- Progress if researching -->
            <div v-else class="mb-3">
              <div class="flex items-center justify-between text-xs mb-1">
                <span class="text-blue-400">Đang nghiên cứu...</span>
                <span class="font-mono text-slate-300">{{ formatDuration(7200) }}</span>
              </div>
              <div class="progress-bar">
                <div class="progress-bar-fill bg-gradient-to-r from-blue-500 to-blue-400" style="width: 40%;" />
              </div>
            </div>

            <!-- Button -->
            <button
              v-if="!research.isResearching"
              :disabled="!canAffordResearch(research.type, research.level) || isAnyResearching"
              class="btn-primary text-sm w-full"
              :class="{ 'opacity-50 cursor-not-allowed': !canAffordResearch(research.type, research.level) || isAnyResearching }"
            >
              <Icon name="mdi:flask" />
              Nghiên cứu cấp {{ research.level + 1 }}
            </button>
            <button
              v-else
              disabled
              class="btn-outline text-sm w-full opacity-50 cursor-not-allowed"
            >
              <Icon name="mdi:timer-sand" />
              Đang nghiên cứu...
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
