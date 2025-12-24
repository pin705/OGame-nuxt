<script setup lang="ts">
import { BuildingType } from '~/types/game'
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

const { player } = useAuth()
const { currentPlanet, buildQueue, processQueue, isLoading } = useGame()
const countdown = useCountdown()

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

// Calculate production
const production = computed(() => {
  if (!currentPlanet.value?.planet) return { tinhThach: 0, nangLuongVuTru: 0, honThach: 0, dienNang: 0 }
  
  const buildings = currentPlanet.value.planet.buildings || []
  const metalMine = buildings.find((b: any) => b.type === BuildingType.MO_TINH_THACH)?.level || 0
  const crystalMine = buildings.find((b: any) => b.type === BuildingType.MAY_HAP_THU_NANG_LUONG)?.level || 0
  const deutMine = buildings.find((b: any) => b.type === BuildingType.DEN_HON_THACH)?.level || 0
  const solarPlant = buildings.find((b: any) => b.type === BuildingType.LO_NANG_LUONG)?.level || 0
  const temperature = currentPlanet.value.planet.temperature || 15

  return {
    tinhThach: calculateMetalProduction(metalMine),
    nangLuongVuTru: calculateCrystalProduction(crystalMine),
    honThach: calculateDeuteriumProduction(deutMine, temperature),
    dienNang: calculateEnergyProduction(solarPlant),
  }
})

// Quick stats
const quickStats = computed(() => [
  { 
    label: 'Sản lượng Tinh Thạch', 
    value: formatNumber(production.value.tinhThach) + '/h', 
    color: 'text-neutral-400',
    colorClass: 'neo-badge',
  },
  { 
    label: 'Sản lượng Năng Lượng VT', 
    value: formatNumber(production.value.nangLuongVuTru) + '/h', 
    color: 'text-primary-500',
    colorClass: 'neo-badge-cyan',
  },
  { 
    label: 'Sản lượng Hồn Thạch', 
    value: formatNumber(production.value.honThach) + '/h', 
    color: 'text-success-400',
    colorClass: 'neo-badge-green',
  },
  { 
    label: 'Tổng Điện Năng', 
    value: formatNumber(production.value.dienNang), 
    color: 'text-warning-400',
    colorClass: 'neo-badge-amber',
  },
])

// Build queue info
const activeBuilding = computed(() => buildQueue.value?.building)

// Format coordinates
const formatCoords = (coords: any) => {
  if (!coords) return '[-:-:-]'
  return `[${coords.galaxy}:${coords.system}:${coords.position}]`
}

// Get rank display name
const getRankName = (rank: string) => {
  const rankNames: Record<string, string> = {
    'CHIEN_BINH_SO_CAP': 'Chiến Binh Sơ Cấp',
    'CHIEN_TUONG': 'Chiến Tướng',
    'DAI_TUONG': 'Đại Tướng',
    'NGUYEN_SOAI': 'Nguyên Soái',
    'DAI_DE': 'Đại Đế',
    'VU_TRU_CAP': 'Vũ Trụ Cấp',
  }
  return rankNames[rank] || rank
}
</script>

<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="isLoading && !currentPlanet" class="flex items-center justify-center py-12">
      <div class="loading-spinner"></div>
    </div>

    <template v-else-if="currentPlanet?.planet">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-display font-bold text-gradient-cyan">Tổng Quan</h1>
          <p class="text-neutral-500 mt-1">Chào mừng trở lại, Chiến Sĩ <span class="text-primary-500">{{ player?.username }}</span>!</p>
        </div>
        <div class="neo-card p-4 flex items-center gap-4">
          <div class="w-12 h-12 neo-card flex items-center justify-center border-primary-500/30">
            <IconsHanhTinh class="w-7 h-7 text-primary-500" />
          </div>
          <div>
            <p class="font-display font-semibold text-lg">{{ currentPlanet.planet.name }}</p>
            <p class="text-sm text-neutral-500 font-mono">{{ formatCoords(currentPlanet.planet.coordinates) }}</p>
          </div>
        </div>
      </div>

      <!-- Player Info Card -->
      <div class="neo-card p-4 flex flex-wrap items-center gap-4">
        <div class="w-14 h-14 neo-card flex items-center justify-center border-success-400/30">
          <IconsNguoiChoi class="w-8 h-8 text-success-400" />
        </div>
        <div class="flex-1 min-w-[200px]">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-display font-semibold text-lg">{{ player?.username }}</span>
            <span class="neo-badge-green text-xs">
              {{ getRankName(player?.rank || '') }}
            </span>
          </div>
          <div class="text-sm text-neutral-500 mt-1">
            Cấp <span class="text-primary-500 font-mono">{{ player?.level || 1 }}</span> • <span class="font-mono">{{ formatNumber(player?.experience || 0) }}</span> XP
          </div>
        </div>
        <div class="text-right">
          <p class="text-xs text-neutral-500 uppercase tracking-wider">Nhiệt độ</p>
          <p class="font-mono text-warning-400">{{ currentPlanet.planet.temperature }}°C</p>
        </div>
        <div class="text-right">
          <p class="text-xs text-neutral-500 uppercase tracking-wider">Sử dụng</p>
          <p class="font-mono"><span class="text-primary-500">{{ currentPlanet.planet.usedFields || 0 }}</span>/{{ currentPlanet.planet.maxFields || 163 }}</p>
        </div>
      </div>

      <!-- Quick Stats Grid -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="(stat, index) in quickStats"
          :key="stat.label"
          class="neo-card neo-card-hover p-4"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 neo-card flex items-center justify-center" :class="stat.colorClass.replace('neo-badge-', 'border-') + '-400/30'">
              <component 
                :is="index === 0 ? 'IconsTinhThach' : index === 1 ? 'IconsNangLuong' : index === 2 ? 'IconsHonThach' : 'IconsDienNang'"
                class="w-5 h-5"
                :class="stat.color"
              />
            </div>
            <div>
              <p class="text-xs text-neutral-500 uppercase tracking-wider">{{ stat.label }}</p>
              <p class="font-mono font-semibold" :class="stat.color">{{ stat.value }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Build Queue -->
      <div v-if="activeBuilding" class="neo-card p-3 md:p-4 border-l-2 border-warning-400">
        <div class="flex items-center gap-3 md:gap-4">
          <div class="w-10 h-10 neo-card flex items-center justify-center border-warning-400/30 flex-shrink-0">
            <IconsNangCap class="w-5 h-5 text-warning-400 animate-pulse" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-display font-semibold truncate text-sm md:text-base">
              Đang nâng cấp: {{ BUILDINGS[activeBuilding.type as BuildingType]?.name || activeBuilding.type }}
            </p>
            <p class="text-sm text-neutral-500">Cấp {{ activeBuilding.level }}</p>
          </div>
          <div class="text-right flex-shrink-0">
            <p class="font-mono text-warning-400 text-sm md:text-lg">
              {{ countdown.buildingFormattedVi.value }}
            </p>
          </div>
        </div>
        <!-- Progress bar -->
        <div class="mt-3 h-1 bg-neutral-800 rounded-full overflow-hidden">
          <div 
            class="h-full bg-gradient-to-r from-warning-400 to-warning-500 transition-all duration-1000"
            :style="{ width: `${100 - (countdown.buildingRemaining.value / (activeBuilding.remainingSeconds || 1)) * 100}%` }"
          />
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Buildings Overview -->
        <div class="lg:col-span-2 neo-card p-5">
          <h3 class="neo-section-title flex items-center gap-2 mb-4">
            <IconsTrungTamChiHuy class="w-5 h-5 text-primary-500" />
            Công Trình
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div
              v-for="building in (currentPlanet.planet.buildings || [])"
              :key="building.type"
              class="flex items-center gap-3 p-3 neo-card neo-card-hover"
            >
              <div class="w-9 h-9 neo-card flex items-center justify-center border-primary-500/20">
                <IconsMoKhoang class="w-5 h-5 text-primary-500" />
              </div>
              <div class="min-w-0">
                <p class="text-sm font-medium truncate">
                  {{ BUILDINGS[building.type as BuildingType]?.name || building.type }}
                </p>
                <p class="text-xs text-neutral-500">Cấp <span class="text-primary-500 font-mono">{{ building.level }}</span></p>
              </div>
            </div>
          </div>
          
          <div class="mt-4 pt-4 border-t border-white/5">
            <NuxtLink to="/game/buildings" class="neo-btn text-sm inline-flex items-center gap-2">
              <IconsMuiTen class="w-4 h-4" />
              Xem tất cả công trình
            </NuxtLink>
          </div>
        </div>

        <!-- Resources Summary -->
        <div class="neo-card p-5">
          <h3 class="neo-section-title flex items-center gap-2 mb-4">
            <IconsTinhThach class="w-5 h-5 text-neutral-400" />
            Tài Nguyên
          </h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <IconsTinhThach class="w-5 h-5 text-neutral-400" />
                <span class="text-sm">Tinh Thạch</span>
              </div>
              <span class="font-mono text-neutral-400">{{ formatNumber(currentPlanet.planet.resources?.tinhThach || 0) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <IconsNangLuong class="w-5 h-5 text-primary-500" />
                <span class="text-sm">Năng Lượng VT</span>
              </div>
              <span class="font-mono text-primary-500">{{ formatNumber(currentPlanet.planet.resources?.nangLuongVuTru || 0) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <IconsHonThach class="w-5 h-5 text-success-400" />
                <span class="text-sm">Hồn Thạch</span>
              </div>
              <span class="font-mono text-success-400">{{ formatNumber(currentPlanet.planet.resources?.honThach || 0) }}</span>
            </div>
            <div class="neo-divider"></div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <IconsDienNang class="w-5 h-5" :class="currentPlanet.energyBalance >= 0 ? 'text-warning-400' : 'text-alert-400'" />
                <span class="text-sm">Điện Năng</span>
              </div>
              <span class="font-mono font-semibold" :class="currentPlanet.energyBalance >= 0 ? 'text-success-400' : 'text-alert-400'">
                {{ currentPlanet.energyBalance >= 0 ? '+' : '' }}{{ formatNumber(currentPlanet.energyBalance || 0) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <NuxtLink to="/game/buildings" class="neo-card neo-card-hover p-4 flex flex-col items-center gap-3 text-center group">
          <div class="w-12 h-12 neo-card flex items-center justify-center border-primary-500/20 group-hover:border-primary-500/50 transition-all">
            <IconsTrungTamChiHuy class="w-6 h-6 text-primary-500" />
          </div>
          <span class="text-sm font-medium">Xây Dựng</span>
        </NuxtLink>
        <NuxtLink to="/game/research" class="neo-card neo-card-hover p-4 flex flex-col items-center gap-3 text-center group">
          <div class="w-12 h-12 neo-card flex items-center justify-center border-primary-500/20 group-hover:border-primary-500/50 transition-all">
            <IconsVienNghienCuu class="w-6 h-6 text-primary-500" />
          </div>
          <span class="text-sm font-medium">Nghiên Cứu</span>
        </NuxtLink>
        <NuxtLink to="/game/shipyard" class="neo-card neo-card-hover p-4 flex flex-col items-center gap-3 text-center group">
          <div class="w-12 h-12 neo-card flex items-center justify-center border-success-400/20 group-hover:border-success-400/50 transition-all">
            <IconsXuongDongTau class="w-6 h-6 text-success-400" />
          </div>
          <span class="text-sm font-medium">Xưởng Tàu</span>
        </NuxtLink>
        <NuxtLink to="/game/galaxy" class="neo-card neo-card-hover p-4 flex flex-col items-center gap-3 text-center group">
          <div class="w-12 h-12 neo-card flex items-center justify-center border-warning-400/20 group-hover:border-warning-400/50 transition-all">
            <IconsThienHa class="w-6 h-6 text-warning-400" />
          </div>
          <span class="text-sm font-medium">Thiên Hà</span>
        </NuxtLink>
      </div>
    </template>

    <!-- Empty State -->
    <div v-else class="neo-card p-12 text-center">
      <div class="w-20 h-20 neo-card flex items-center justify-center mx-auto mb-6 border-neutral-500/20">
        <IconsHanhTinh class="w-10 h-10 text-neutral-500" />
      </div>
      <h3 class="text-xl font-display font-semibold mb-2">Không tìm thấy hành tinh</h3>
      <p class="text-neutral-500">Vui lòng đăng nhập lại hoặc liên hệ hỗ trợ.</p>
    </div>
  </div>
</template>
