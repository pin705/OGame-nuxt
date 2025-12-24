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
    color: 'text-slate-300',
  },
  { 
    label: 'Sản lượng Năng Lượng VT', 
    value: formatNumber(production.value.nangLuongVuTru) + '/h', 
    color: 'text-primary-300',
  },
  { 
    label: 'Sản lượng Hồn Thạch', 
    value: formatNumber(production.value.honThach) + '/h', 
    color: 'text-secondary-300',
  },
  { 
    label: 'Tổng Điện Năng', 
    value: formatNumber(production.value.dienNang), 
    color: 'text-accent-300',
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
      <div class="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"></div>
    </div>

    <template v-else-if="currentPlanet?.planet">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-display font-bold">Tổng Quan</h1>
          <p class="text-slate-400">Chào mừng trở lại, Chiến Sĩ {{ player?.username }}!</p>
        </div>
        <div class="glass-card p-4 flex items-center gap-4">
          <IconsHanhTinh class="w-10 h-10 text-primary-400" />
          <div>
            <p class="font-medium">{{ currentPlanet.planet.name }}</p>
            <p class="text-sm text-slate-400">{{ formatCoords(currentPlanet.planet.coordinates) }}</p>
          </div>
        </div>
      </div>

      <!-- Player Info Card -->
      <div class="glass-card p-4 flex items-center gap-4">
        <IconsNguoiChoi class="w-12 h-12 text-secondary-400" />
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <span class="font-medium text-lg">{{ player?.username }}</span>
            <span class="px-2 py-0.5 rounded-full bg-secondary-500/20 text-secondary-400 text-xs">
              {{ getRankName(player?.rank || '') }}
            </span>
          </div>
          <div class="text-sm text-slate-400">
            Cấp {{ player?.level || 1 }} • {{ formatNumber(player?.experience || 0) }} XP
          </div>
        </div>
        <div class="text-right">
          <p class="text-sm text-slate-400">Nhiệt độ</p>
          <p class="font-mono">{{ currentPlanet.planet.temperature }}°C</p>
        </div>
        <div class="text-right">
          <p class="text-sm text-slate-400">Sử dụng</p>
          <p class="font-mono">{{ currentPlanet.planet.usedFields || 0 }}/{{ currentPlanet.planet.maxFields || 163 }}</p>
        </div>
      </div>

      <!-- Quick Stats Grid -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="(stat, index) in quickStats"
          :key="stat.label"
          class="glass-card p-4"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-space-700/50 flex items-center justify-center">
              <component 
                :is="index === 0 ? 'IconsTinhThach' : index === 1 ? 'IconsNangLuong' : index === 2 ? 'IconsHonThach' : 'IconsDienNang'"
                class="w-6 h-6"
              />
            </div>
            <div>
              <p class="text-xs text-slate-500">{{ stat.label }}</p>
              <p class="font-mono font-semibold" :class="stat.color">{{ stat.value }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Build Queue -->
      <div v-if="activeBuilding" class="glass-card p-4 border-l-4 border-accent-500">
        <div class="flex items-center gap-4">
          <IconsNangCap class="w-8 h-8 text-accent-400 animate-pulse" />
          <div class="flex-1">
            <p class="font-medium">Đang nâng cấp: {{ BUILDINGS[activeBuilding.type as BuildingType]?.name || activeBuilding.type }}</p>
            <p class="text-sm text-slate-400">Cấp {{ activeBuilding.level }}</p>
          </div>
          <div class="text-right">
            <p class="font-mono text-accent-400">
              {{ Math.floor(activeBuilding.remainingSeconds / 3600) }}h 
              {{ Math.floor((activeBuilding.remainingSeconds % 3600) / 60) }}m 
              {{ activeBuilding.remainingSeconds % 60 }}s
            </p>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Buildings Overview -->
        <div class="lg:col-span-2 glass-card p-4">
          <h3 class="font-display font-bold mb-4 flex items-center gap-2">
            <IconsTrungTamChiHuy class="w-5 h-5 text-primary-400" />
            Công Trình
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div
              v-for="building in (currentPlanet.planet.buildings || [])"
              :key="building.type"
              class="flex items-center gap-3 p-3 rounded-lg bg-space-700/30"
            >
              <div class="w-10 h-10 rounded-lg bg-space-700 flex items-center justify-center">
                <IconsMoKhoang class="w-6 h-6 text-primary-400" />
              </div>
              <div>
                <p class="text-sm font-medium text-slate-200 truncate">
                  {{ BUILDINGS[building.type as BuildingType]?.name || building.type }}
                </p>
                <p class="text-xs text-slate-500">Cấp {{ building.level }}</p>
              </div>
            </div>
          </div>
          
          <div class="mt-4 pt-4 border-t border-space-700">
            <NuxtLink to="/game/buildings" class="btn-outline text-sm inline-flex items-center gap-2">
              <IconsMuiTen class="w-4 h-4" />
              Xem tất cả công trình
            </NuxtLink>
          </div>
        </div>

        <!-- Resources Summary -->
        <div class="glass-card p-4">
          <h3 class="font-display font-bold mb-4 flex items-center gap-2">
            <IconsTinhThach class="w-5 h-5 text-slate-400" />
            Tài Nguyên
          </h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <IconsTinhThach class="w-5 h-5" />
                <span class="text-sm">Tinh Thạch</span>
              </div>
              <span class="font-mono text-slate-300">{{ formatNumber(currentPlanet.planet.resources?.tinhThach || 0) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <IconsNangLuong class="w-5 h-5" />
                <span class="text-sm">Năng Lượng VT</span>
              </div>
              <span class="font-mono text-primary-300">{{ formatNumber(currentPlanet.planet.resources?.nangLuongVuTru || 0) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <IconsHonThach class="w-5 h-5" />
                <span class="text-sm">Hồn Thạch</span>
              </div>
              <span class="font-mono text-secondary-300">{{ formatNumber(currentPlanet.planet.resources?.honThach || 0) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <IconsDienNang class="w-5 h-5" />
                <span class="text-sm">Điện Năng</span>
              </div>
              <span class="font-mono" :class="currentPlanet.energyBalance >= 0 ? 'text-green-400' : 'text-red-400'">
                {{ currentPlanet.energyBalance >= 0 ? '+' : '' }}{{ formatNumber(currentPlanet.energyBalance || 0) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <NuxtLink to="/game/buildings" class="glass-card-hover p-4 flex flex-col items-center gap-2 text-center">
          <IconsTrungTamChiHuy class="w-8 h-8 text-primary-400" />
          <span class="text-sm font-medium">Xây Dựng</span>
        </NuxtLink>
        <NuxtLink to="/game/research" class="glass-card-hover p-4 flex flex-col items-center gap-2 text-center">
          <IconsVienNghienCuu class="w-8 h-8 text-blue-400" />
          <span class="text-sm font-medium">Nghiên Cứu</span>
        </NuxtLink>
        <NuxtLink to="/game/shipyard" class="glass-card-hover p-4 flex flex-col items-center gap-2 text-center">
          <IconsXuongDongTau class="w-8 h-8 text-secondary-400" />
          <span class="text-sm font-medium">Xưởng Tàu</span>
        </NuxtLink>
        <NuxtLink to="/game/galaxy" class="glass-card-hover p-4 flex flex-col items-center gap-2 text-center">
          <IconsThienHa class="w-8 h-8 text-accent-400" />
          <span class="text-sm font-medium">Thiên Hà</span>
        </NuxtLink>
      </div>
    </template>

    <!-- Empty State -->
    <div v-else class="glass-card p-12 text-center">
      <IconsHanhTinh class="w-16 h-16 mx-auto mb-4 text-slate-600" />
      <h3 class="text-xl font-medium mb-2">Không tìm thấy hành tinh</h3>
      <p class="text-slate-400">Vui lòng đăng nhập lại hoặc liên hệ hỗ trợ.</p>
    </div>
  </div>
</template>
