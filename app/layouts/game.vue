<script setup lang="ts">
import { BuildingType } from '~/types/game'
import { 
  calculateMetalProduction, 
  calculateCrystalProduction, 
  calculateDeuteriumProduction, 
  calculateEnergyProduction,
  calculateEnergyConsumption 
} from '~/utils/gameFormulas'

const route = useRoute()
const router = useRouter()
const auth = useAuth()
const game = useGame()

// Navigation items with component references
const navigation = [
  { name: 'Tổng quan', href: '/game/overview', iconType: 'dashboard' },
  { name: 'Công trình', href: '/game/buildings', iconType: 'building' },
  { name: 'Nghiên cứu', href: '/game/research', iconType: 'research' },
  { name: 'Xưởng tàu', href: '/game/shipyard', iconType: 'shipyard' },
  { name: 'Hạm đội', href: '/game/fleet', iconType: 'fleet' },
  { name: 'Thiên hà', href: '/game/galaxy', iconType: 'galaxy' },
]

const isSidebarOpen = ref(true)
const isMobileMenuOpen = ref(false)
const isInitialized = ref(false)

const isActiveRoute = (href: string) => route.path === href

// Initialize game on mount
onMounted(async () => {
  await auth.init()
  if (!auth.isAuthenticated.value) {
    router.push('/login')
    return
  }
  await game.initGame()
  isInitialized.value = true
})

// Resources from current planet
const resources = computed(() => {
  const planet = game.currentPlanet.value?.planet
  if (!planet) return { tinhThach: 0, nangLuongVuTru: 0, honThach: 0, dienNang: 0, dienNangMax: 0 }
  
  const buildings = planet.buildings || []
  const solarPlant = buildings.find((b: any) => b.type === BuildingType.LO_NANG_LUONG)?.level || 0
  const metalMine = buildings.find((b: any) => b.type === BuildingType.MO_TINH_THACH)?.level || 0
  const crystalMine = buildings.find((b: any) => b.type === BuildingType.MAY_HAP_THU_NANG_LUONG)?.level || 0
  const deutMine = buildings.find((b: any) => b.type === BuildingType.DEN_HON_THACH)?.level || 0
  
  const energyProduced = calculateEnergyProduction(solarPlant)
  const energyUsed = 
    calculateEnergyConsumption(BuildingType.MO_TINH_THACH, metalMine) + 
    calculateEnergyConsumption(BuildingType.MAY_HAP_THU_NANG_LUONG, crystalMine) + 
    calculateEnergyConsumption(BuildingType.DEN_HON_THACH, deutMine)
  
  return {
    tinhThach: planet.resources?.tinhThach || 0,
    nangLuongVuTru: planet.resources?.nangLuongVuTru || 0,
    honThach: planet.resources?.honThach || 0,
    dienNang: energyProduced - energyUsed,
    dienNangMax: energyProduced,
  }
})

// Production rates
const production = computed(() => {
  const planet = game.currentPlanet.value?.planet
  if (!planet) return { tinhThach: 0, nangLuongVuTru: 0, honThach: 0 }
  
  const buildings = planet.buildings || []
  const metalMine = buildings.find((b: any) => b.type === BuildingType.MO_TINH_THACH)?.level || 0
  const crystalMine = buildings.find((b: any) => b.type === BuildingType.MAY_HAP_THU_NANG_LUONG)?.level || 0
  const deutMine = buildings.find((b: any) => b.type === BuildingType.DEN_HON_THACH)?.level || 0
  const temperature = planet.temperature || 15

  return {
    tinhThach: calculateMetalProduction(metalMine),
    nangLuongVuTru: calculateCrystalProduction(crystalMine),
    honThach: calculateDeuteriumProduction(deutMine, temperature),
  }
})

// Logout handler
const handleLogout = async () => {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-space-900 text-slate-100">
    <!-- Star field background -->
    <div class="star-field" />

    <!-- Mobile menu button -->
    <button
      class="fixed top-4 left-4 z-50 lg:hidden glass-card p-2"
      @click="isMobileMenuOpen = !isMobileMenuOpen"
    >
      <IconsDong v-if="isMobileMenuOpen" class="w-6 h-6" />
      <IconsMenu v-else class="w-6 h-6" />
    </button>

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-40 w-64 glass-card border-r border-space-700 transform transition-transform duration-300 lg:translate-x-0"
      :class="{
        'translate-x-0': isMobileMenuOpen,
        '-translate-x-full': !isMobileMenuOpen && !isSidebarOpen,
      }"
    >
      <div class="flex flex-col h-full">
        <!-- Logo -->
        <div class="p-4 border-b border-space-700">
          <NuxtLink to="/game/overview" class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <IconsTenLua class="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 class="font-display font-bold text-lg text-gradient">
                Thôn Phệ
              </h1>
              <p class="text-xs text-slate-500">Tinh Không</p>
            </div>
          </NuxtLink>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
          <NuxtLink
            v-for="item in navigation"
            :key="item.href"
            :to="item.href"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200"
            :class="
              isActiveRoute(item.href)
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                : 'text-slate-400 hover:bg-space-700 hover:text-slate-200'
            "
            @click="isMobileMenuOpen = false"
          >
            <IconsTrungTamChiHuy v-if="item.iconType === 'dashboard'" class="w-5 h-5" />
            <IconsMoKhoang v-else-if="item.iconType === 'building'" class="w-5 h-5" />
            <IconsNghienCuu v-else-if="item.iconType === 'research'" class="w-5 h-5" />
            <IconsXuongDongTau v-else-if="item.iconType === 'shipyard'" class="w-5 h-5" />
            <IconsHamDoi v-else-if="item.iconType === 'fleet'" class="w-5 h-5" />
            <IconsThienHa v-else-if="item.iconType === 'galaxy'" class="w-5 h-5" />
            <span class="font-medium">{{ item.name }}</span>
          </NuxtLink>
        </nav>

        <!-- Footer -->
        <div class="p-4 border-t border-space-700">
          <NuxtLink
            to="/game/settings"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-space-700 hover:text-slate-200 transition-colors"
          >
            <IconsCaiDat class="w-5 h-5" />
            <span>Cài đặt</span>
          </NuxtLink>
          <button
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors w-full mt-1"
            @click="handleLogout"
          >
            <IconsQuayLai class="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- Overlay for mobile -->
    <div
      v-if="isMobileMenuOpen"
      class="fixed inset-0 z-30 bg-black/50 lg:hidden"
      @click="isMobileMenuOpen = false"
    />

    <!-- Main content -->
    <main class="lg:ml-64 relative z-10 min-h-screen">
      <!-- Loading state -->
      <div v-if="!isInitialized" class="flex items-center justify-center min-h-screen">
        <div class="text-center">
          <IconsTaiDang class="w-12 h-12 animate-spin text-primary-400 mx-auto mb-4" />
          <p class="text-slate-400">Đang tải dữ liệu...</p>
        </div>
      </div>
      
      <template v-else>
        <!-- Top bar with resources -->
        <header class="sticky top-0 z-20 p-4 bg-space-900/80 backdrop-blur-md border-b border-space-700">
          <GameResourceBar
            :tinh-thach="resources.tinhThach"
            :nang-luong-vu-tru="resources.nangLuongVuTru"
            :hon-thach="resources.honThach"
            :dien-nang="resources.dienNang"
            :dien-nang-max="resources.dienNangMax"
            show-production
            :production="production"
          />
        </header>

        <!-- Page content -->
        <div class="p-4 md:p-6">
          <slot />
        </div>
      </template>
    </main>
  </div>
</template>
