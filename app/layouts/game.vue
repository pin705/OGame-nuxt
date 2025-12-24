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
  <div class="min-h-screen bg-space-950">
    <!-- Star field background -->
    <div class="star-field" />
    
    <!-- Grid overlay -->
    <div class="fixed inset-0 bg-grid pointer-events-none opacity-30" />

    <!-- Mobile menu button -->
    <button
      class="fixed top-4 left-4 z-50 lg:hidden neo-card p-2 hover:glow-cyan"
      @click="isMobileMenuOpen = !isMobileMenuOpen"
    >
      <IconsDong v-if="isMobileMenuOpen" class="w-6 h-6 text-primary-500" />
      <IconsMenu v-else class="w-6 h-6 text-primary-500" />
    </button>

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-40 w-60 bg-space-800/90 backdrop-blur-xl border-r border-white/5 transform transition-transform duration-300 lg:translate-x-0"
      :class="{
        'translate-x-0': isMobileMenuOpen,
        '-translate-x-full': !isMobileMenuOpen && !isSidebarOpen,
      }"
    >
      <div class="flex flex-col h-full">
        <!-- Logo -->
        <div class="p-5 border-b border-white/5">
          <NuxtLink to="/game/overview" class="flex items-center gap-3 group">
            <div class="w-10 h-10 neo-card flex items-center justify-center border-primary-500/50 group-hover:glow-cyan transition-all">
              <IconsTenLua class="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <h1 class="font-display font-bold text-lg text-gradient-cyan">
                THÔN PHỆ
              </h1>
              <p class="text-xs text-neutral-500 tracking-widest uppercase">Tinh Không</p>
            </div>
          </NuxtLink>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 py-4 overflow-y-auto">
          <NuxtLink
            v-for="item in navigation"
            :key="item.href"
            :to="item.href"
            class="neo-nav-item"
            :class="{ 'active': isActiveRoute(item.href) }"
            @click="isMobileMenuOpen = false"
          >
            <IconsTrungTamChiHuy v-if="item.iconType === 'dashboard'" class="icon" />
            <IconsMoKhoang v-else-if="item.iconType === 'building'" class="icon" />
            <IconsNghienCuu v-else-if="item.iconType === 'research'" class="icon" />
            <IconsXuongDongTau v-else-if="item.iconType === 'shipyard'" class="icon" />
            <IconsHamDoi v-else-if="item.iconType === 'fleet'" class="icon" />
            <IconsThienHa v-else-if="item.iconType === 'galaxy'" class="icon" />
            <span class="font-medium tracking-wide">{{ item.name }}</span>
          </NuxtLink>
        </nav>

        <!-- Footer -->
        <div class="p-4 border-t border-white/5">
          <NuxtLink
            to="/game/settings"
            class="neo-nav-item"
            :class="{ 'active': isActiveRoute('/game/settings') }"
          >
            <IconsCaiDat class="icon" />
            <span>Cài đặt</span>
          </NuxtLink>
          <button
            class="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-alert-400 hover:bg-alert-400/10 transition-colors border-l-2 border-transparent hover:border-alert-400/50"
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
      class="fixed inset-0 z-30 bg-space-950/80 backdrop-blur-sm lg:hidden"
      @click="isMobileMenuOpen = false"
    />

    <!-- Main content -->
    <main class="lg:ml-60 relative z-10 min-h-screen">
      <!-- Loading state -->
      <div v-if="!isInitialized" class="flex items-center justify-center min-h-screen">
        <div class="text-center">
          <div class="relative">
            <IconsTaiDang class="w-16 h-16 animate-spin text-primary-500 mx-auto" />
            <div class="absolute inset-0 blur-xl bg-primary-500/30 animate-pulse" />
          </div>
          <p class="mt-6 text-neutral-500 text-sm uppercase tracking-widest font-display">Đang tải dữ liệu...</p>
        </div>
      </div>
      
      <template v-else>
        <!-- Top bar with resources -->
        <header class="sticky top-0 z-20 bg-space-900/80 backdrop-blur-xl border-b border-white/5">
          <div class="px-4 py-3">
            <GameResourceBar
              :tinh-thach="resources.tinhThach"
              :nang-luong-vu-tru="resources.nangLuongVuTru"
              :hon-thach="resources.honThach"
              :dien-nang="resources.dienNang"
              :dien-nang-max="resources.dienNangMax"
              show-production
              :production="production"
            />
          </div>
        </header>

        <!-- Page content -->
        <div class="p-4 md:p-6">
          <slot />
        </div>
      </template>
    </main>
  </div>
</template>
