<script setup lang="ts">
import { PlayerRank, BuildingType } from '~/types/game'
import { BUILDINGS } from '~/config/gameConfig'
import {
  calculateMetalProduction,
  calculateCrystalProduction,
  calculateDeuteriumProduction,
  calculateEnergyProduction,
  formatNumber,
} from '~/utils/gameFormulas'

definePageMeta({
  layout: 'game',
})

// Mock data - will be replaced with API calls
const player = ref({
  username: 'LaPhong',
  level: 15,
  experience: 12500,
  rank: PlayerRank.CHIEN_TUONG,
  isOnline: true,
})

const currentPlanet = ref({
  _id: '1',
  name: 'Hành Tinh Mẫu',
  coordinates: { galaxy: 1, system: 250, position: 8 },
  diameter: 12800,
  temperature: 15,
  usedFields: 45,
  maxFields: 163,
  isHomePlanet: true,
  resources: {
    tinhThach: 1250000,
    nangLuongVuTru: 680000,
    honThach: 320000,
    dienNang: 185,
  },
  buildings: [
    { type: BuildingType.MO_TINH_THACH, level: 15 },
    { type: BuildingType.MAY_HAP_THU_NANG_LUONG, level: 12 },
    { type: BuildingType.DEN_HON_THACH, level: 8 },
    { type: BuildingType.LO_NANG_LUONG, level: 14 },
    { type: BuildingType.TRUNG_TAM_CHI_HUY, level: 5 },
    { type: BuildingType.XUONG_DONG_TAU, level: 6 },
    { type: BuildingType.VIEN_NGHIEN_CUU, level: 7 },
  ],
})

// Calculate production
const production = computed(() => {
  const metalMine = currentPlanet.value.buildings.find(b => b.type === BuildingType.MO_TINH_THACH)?.level || 0
  const crystalMine = currentPlanet.value.buildings.find(b => b.type === BuildingType.MAY_HAP_THU_NANG_LUONG)?.level || 0
  const deutMine = currentPlanet.value.buildings.find(b => b.type === BuildingType.DEN_HON_THACH)?.level || 0
  const solarPlant = currentPlanet.value.buildings.find(b => b.type === BuildingType.LO_NANG_LUONG)?.level || 0

  return {
    tinhThach: calculateMetalProduction(metalMine),
    nangLuongVuTru: calculateCrystalProduction(crystalMine),
    honThach: calculateDeuteriumProduction(deutMine, currentPlanet.value.temperature),
    dienNang: calculateEnergyProduction(solarPlant),
  }
})

// Quick stats
const quickStats = computed(() => [
  { label: 'Sản lượng Tinh Thạch', value: formatNumber(production.value.tinhThach) + '/h', icon: 'mdi:gold', color: 'text-slate-300' },
  { label: 'Sản lượng Năng Lượng VT', value: formatNumber(production.value.nangLuongVuTru) + '/h', icon: 'mdi:diamond-stone', color: 'text-primary-300' },
  { label: 'Sản lượng Hồn Thạch', value: formatNumber(production.value.honThach) + '/h', icon: 'mdi:water', color: 'text-secondary-300' },
  { label: 'Tổng Điện Năng', value: formatNumber(production.value.dienNang), icon: 'mdi:lightning-bolt', color: 'text-accent-300' },
])

// Recent activities (mock)
const recentActivities = [
  { type: 'building', message: 'Mỏ Tinh Thạch đã nâng cấp lên cấp 15', time: '5 phút trước', icon: 'mdi:check-circle', color: 'text-green-400' },
  { type: 'research', message: 'Công nghệ Vũ Khí đã hoàn thành cấp 5', time: '15 phút trước', icon: 'mdi:flask', color: 'text-blue-400' },
  { type: 'fleet', message: 'Hạm đội đã trở về từ [1:245:7]', time: '1 giờ trước', icon: 'mdi:rocket', color: 'text-purple-400' },
  { type: 'attack', message: 'Bị tấn công bởi DarkLord tại [1:250:8]', time: '3 giờ trước', icon: 'mdi:sword', color: 'text-red-400' },
]
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-display font-bold">Tổng Quan</h1>
        <p class="text-slate-400">Chào mừng trở lại, Chiến Sĩ {{ player.username }}!</p>
      </div>
      <GamePlanetCard
        :planet="currentPlanet"
        is-active
      />
    </div>

    <!-- Player Card -->
    <GamePlayerCard
      :username="player.username"
      :level="player.level"
      :experience="player.experience"
      :rank="player.rank"
      :is-online="player.isOnline"
    />

    <!-- Quick Stats Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="stat in quickStats"
        :key="stat.label"
        class="glass-card p-4"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-space-700/50 flex items-center justify-center">
            <Icon :name="stat.icon" class="text-xl" :class="stat.color" />
          </div>
          <div>
            <p class="text-xs text-slate-500">{{ stat.label }}</p>
            <p class="font-mono font-semibold" :class="stat.color">{{ stat.value }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Buildings Overview -->
      <UiCard title="Công Trình" subtitle="Tình trạng các công trình chính" class="lg:col-span-2">
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div
            v-for="building in currentPlanet.buildings"
            :key="building.type"
            class="flex items-center gap-3 p-3 rounded-lg bg-space-700/30"
          >
            <div class="w-10 h-10 rounded-lg bg-space-700 flex items-center justify-center">
              <Icon name="mdi:office-building" class="text-primary-400" />
            </div>
            <div>
              <p class="text-sm font-medium text-slate-200 truncate">
                {{ BUILDINGS[building.type].name }}
              </p>
              <p class="text-xs text-slate-500">Cấp {{ building.level }}</p>
            </div>
          </div>
        </div>
        
        <template #footer>
          <NuxtLink to="/game/buildings" class="btn-outline text-sm">
            <Icon name="mdi:arrow-right" />
            Xem tất cả công trình
          </NuxtLink>
        </template>
      </UiCard>

      <!-- Recent Activity -->
      <UiCard title="Hoạt Động Gần Đây">
        <div class="space-y-3">
          <div
            v-for="(activity, index) in recentActivities"
            :key="index"
            class="flex items-start gap-3"
          >
            <Icon :name="activity.icon" class="text-lg mt-0.5" :class="activity.color" />
            <div class="flex-1 min-w-0">
              <p class="text-sm text-slate-300">{{ activity.message }}</p>
              <p class="text-xs text-slate-500">{{ activity.time }}</p>
            </div>
          </div>
        </div>
      </UiCard>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <NuxtLink to="/game/buildings" class="glass-card-hover p-4 flex flex-col items-center gap-2 text-center">
        <Icon name="mdi:office-building" class="text-3xl text-primary-400" />
        <span class="text-sm font-medium">Xây Dựng</span>
      </NuxtLink>
      <NuxtLink to="/game/research" class="glass-card-hover p-4 flex flex-col items-center gap-2 text-center">
        <Icon name="mdi:flask" class="text-3xl text-blue-400" />
        <span class="text-sm font-medium">Nghiên Cứu</span>
      </NuxtLink>
      <NuxtLink to="/game/shipyard" class="glass-card-hover p-4 flex flex-col items-center gap-2 text-center">
        <Icon name="mdi:rocket-launch" class="text-3xl text-secondary-400" />
        <span class="text-sm font-medium">Xưởng Tàu</span>
      </NuxtLink>
      <NuxtLink to="/game/galaxy" class="glass-card-hover p-4 flex flex-col items-center gap-2 text-center">
        <Icon name="mdi:galaxy" class="text-3xl text-accent-400" />
        <span class="text-sm font-medium">Thiên Hà</span>
      </NuxtLink>
    </div>
  </div>
</template>
