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
const countdown = useCountdown()
const notifications = useNotifications()

// Navigation items with component references
const navigation = [
  { name: 'Tổng quan', shortName: 'Tổng quan', href: '/game/overview', iconType: 'dashboard' },
  { name: 'Công trình', shortName: 'Xây dựng', href: '/game/buildings', iconType: 'building' },
  { name: 'Nghiên cứu', shortName: 'Nghiên cứu', href: '/game/research', iconType: 'research' },
  { name: 'Xưởng tàu', shortName: 'Xưởng tàu', href: '/game/shipyard', iconType: 'shipyard' },
  { name: 'Phòng thủ', shortName: 'Phòng thủ', href: '/game/defenses', iconType: 'defense' },
  { name: 'Hạm đội', shortName: 'Hạm đội', href: '/game/fleet', iconType: 'fleet' },
  { name: 'Thiên hà', shortName: 'Thiên hà', href: '/game/galaxy', iconType: 'galaxy' },
  { name: 'Thám hiểm', shortName: 'Thám hiểm', href: '/game/expedition', iconType: 'expedition' },
  { name: 'Bảng xếp hạng', shortName: 'Xếp hạng', href: '/game/highscore', iconType: 'highscore' },
  { name: 'Liên minh', shortName: 'Liên minh', href: '/game/alliance', iconType: 'alliance' },
  { name: 'Chiến hữu', shortName: 'Bạn bè', href: '/game/buddies', iconType: 'buddies' },
  { name: 'Tin nhắn', shortName: 'Tin nhắn', href: '/game/messages', iconType: 'message' },
]

// Mobile bottom nav (key items only)
const mobileNav = [
  { name: 'Tổng quan', href: '/game/overview', iconType: 'dashboard' },
  { name: 'Xây dựng', href: '/game/buildings', iconType: 'building' },
  { name: 'Xưởng tàu', href: '/game/shipyard', iconType: 'shipyard' },
  { name: 'Hạm đội', href: '/game/fleet', iconType: 'fleet' },
  { name: 'Thêm', href: '', iconType: 'menu' },
]

const isMoreMenuOpen = ref(false)
const isInitialized = ref(false)
const unreadMessages = ref(0)

const isActiveRoute = (href: string) => route.path === href

// Fetch unread messages
const fetchUnreadMessages = async () => {
  try {
    const result = await $fetch('/api/game/messages/count') as { count: number }
    unreadMessages.value = result.count
  } catch (e) {
    console.error('Failed to fetch unread messages')
  }
}

// Handle "More" menu toggle
const toggleMoreMenu = () => {
  isMoreMenuOpen.value = !isMoreMenuOpen.value
}

// Initialize game on mount
onMounted(async () => {
  await auth.init()
  if (!auth.isAuthenticated.value) {
    router.push('/login')
    return
  }
  await game.initGame()
  await fetchUnreadMessages()
  isInitialized.value = true
  
  // Start countdown ticker
  countdown.startTicker()
  countdown.registerFromQueue(game.buildQueue.value)
  
  // Connect to WebSocket for real-time updates
  connectWebSocket()
})

// WebSocket connection
const websocket = useWebSocket()

const connectWebSocket = () => {
  const playerId = auth.player.value?._id
  if (playerId) {
    websocket.connect(playerId)
    
    // Listen for game events
    websocket.on('resource_update', (event) => {
      if (game.currentPlanet.value?.planet) {
        game.currentPlanet.value.planet.resources = event.data
      }
    })
    
    websocket.on('building_complete', async (event) => {
      notifications.success('Nâng cấp hoàn tất!', event.data?.buildingName || 'Công trình đã được nâng cấp')
      await game.processQueue()
    })
    
    websocket.on('research_complete', async (event) => {
      notifications.success('Nghiên cứu hoàn tất!', event.data?.researchName || 'Nghiên cứu đã hoàn thành')
      await game.processQueue()
    })
    
    websocket.on('ship_complete', async (event) => {
      notifications.success('Đóng tàu hoàn tất!', event.data?.shipName || 'Tàu đã được đóng xong')
      await game.processQueue()
    })
    
    websocket.on('fleet_update', async () => {
      await game.fetchPlanet()
    })
    
    websocket.on('attack_incoming', (event) => {
      // Show attack warning notification
      notifications.warning('Hạm đội đang tiến đến!', 'Hành tinh của bạn sắp bị tấn công', 10000)
      console.warn('[ATTACK INCOMING]', event.data)
    })
  }
}

// Watch buildQueue changes to update countdowns
watch(() => game.buildQueue.value, (newQueue) => {
  countdown.registerFromQueue(newQueue)
}, { deep: true })

onUnmounted(() => {
  countdown.stopTicker()
  websocket.disconnect()
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

    <!-- Toast Notifications -->
    <UiNotificationToast />

    <!-- Sidebar - Desktop only -->
    <aside
      class="fixed inset-y-0 left-0 z-40 w-64 hidden lg:block"
    >
      <!-- Sidebar inner with glassmorphism -->
      <div class="h-full bg-[#0D1117]/95 backdrop-blur-2xl border-r border-[rgba(0,209,255,0.15)]">
        <div class="flex flex-col h-full">
          <!-- Logo -->
          <div class="p-5 border-b border-[rgba(0,209,255,0.1)]">
            <NuxtLink to="/game/overview" class="flex items-center gap-3 group">
              <div class="w-11 h-11 relative">
                <!-- Neon ring effect -->
                <div class="absolute inset-0 rounded-lg border border-[#00D1FF]/60 group-hover:border-[#00D1FF] transition-colors" />
                <div class="absolute inset-0 rounded-lg bg-[#00D1FF]/5 group-hover:bg-[#00D1FF]/15 transition-colors" />
                <div class="absolute inset-0 flex items-center justify-center">
                  <IconsTenLua class="w-5 h-5 text-[#00D1FF]" />
                </div>
              </div>
              <div>
                <h1 class="font-display font-bold text-lg tracking-wider text-[#00D1FF] drop-shadow-[0_0_10px_rgba(0,209,255,0.5)]">
                  THÔN PHỆ
                </h1>
                <p class="text-[10px] text-neutral-500 tracking-[0.25em] uppercase">Tinh Không</p>
              </div>
            </NuxtLink>
          </div>

          <!-- Navigation -->
          <nav class="flex-1 py-3 px-2 overflow-y-auto space-y-0.5">
            <NuxtLink
              v-for="item in navigation"
              :key="item.href"
              :to="item.href"
              class="group flex items-center uppercase gap-3 px-3 py-2.5 rounded-sm text-sm font-medium tracking-wide transition-all duration-200"
              :class="isActiveRoute(item.href) 
                ? 'bg-[#00D1FF]/15 text-[#00D1FF] border-l-2 border-[#00D1FF] shadow-[inset_0_0_20px_rgba(0,209,255,0.1)]' 
                : 'text-neutral-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent hover:border-[#00D1FF]/30'"
            >
              <span class="w-5 h-5 flex items-center justify-center" :class="isActiveRoute(item.href) ? 'text-[#00D1FF] drop-shadow-[0_0_8px_rgba(0,209,255,0.7)]' : 'text-neutral-500 group-hover:text-[#00D1FF]/70'">
                <IconsTrungTamChiHuy v-if="item.iconType === 'dashboard'" class="w-5 h-5" />
                <IconsMoKhoang v-else-if="item.iconType === 'building'" class="w-5 h-5" />
                <IconsNghienCuu v-else-if="item.iconType === 'research'" class="w-5 h-5" />
                <IconsXuongDongTau v-else-if="item.iconType === 'shipyard'" class="w-5 h-5" />
                <IconsHamDoi v-else-if="item.iconType === 'fleet'" class="w-5 h-5" />
                <IconsPhongThu v-else-if="item.iconType === 'defense'" class="w-5 h-5" />
                <IconsThienHa v-else-if="item.iconType === 'galaxy'" class="w-5 h-5" />
                <IconsThamHiem v-else-if="item.iconType === 'expedition'" class="w-5 h-5" />
                <IconsBangXepHang v-else-if="item.iconType === 'highscore'" class="w-5 h-5" />
                <IconsLienMinh v-else-if="item.iconType === 'alliance'" class="w-5 h-5" />
                <IconsChienHuu v-else-if="item.iconType === 'buddies'" class="w-5 h-5" />
                <IconsTinNhan v-else-if="item.iconType === 'message'" class="w-5 h-5" />
              </span>
              <span>{{ item.name }}</span>
              <!-- Unread badge -->
              <span v-if="item.iconType === 'message' && unreadMessages > 0" class="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {{ unreadMessages }}
              </span>
              <!-- Active indicator glow -->
              <span v-if="isActiveRoute(item.href)" class="ml-auto w-1.5 h-1.5 rounded-full bg-[#00D1FF] shadow-[0_0_8px_#00D1FF]" />
            </NuxtLink>
          </nav>

          <!-- Footer -->
          <div class="p-3 border-t border-[rgba(0,209,255,0.1)]">
            <NuxtLink
              to="/game/settings"
              class="group flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium tracking-wide transition-all duration-200"
              :class="isActiveRoute('/game/settings') 
                ? 'bg-[#00D1FF]/15 text-[#00D1FF] border-l-2 border-[#00D1FF]' 
                : 'text-neutral-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'"
            >
              <IconsCaiDat class="w-5 h-5" :class="isActiveRoute('/game/settings') ? 'text-[#00D1FF]' : 'text-neutral-500 group-hover:text-[#00D1FF]/70'" />
              <span>Cài đặt</span>
            </NuxtLink>
            <button
              class="flex items-center gap-3 px-3 py-2.5 w-full rounded-sm text-sm font-medium text-[#FF3366] hover:bg-[#FF3366]/10 transition-all border-l-2 border-transparent hover:border-[#FF3366]/50"
              @click="handleLogout"
            >
              <IconsQuayLai class="w-5 h-5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- Overlay for mobile "More" menu -->
    <div
      v-if="isMoreMenuOpen"
      class="fixed inset-0 z-30 bg-space-950/80 backdrop-blur-sm lg:hidden"
      @click="isMoreMenuOpen = false"
    />

    <!-- Main content -->
    <main class="lg:ml-64 relative z-10 min-h-screen pb-20 lg:pb-0">
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
        <!-- Top bar with resources (Responsive) -->
        <header class="sticky top-0 z-20 bg-[#0D1117]/95 backdrop-blur-xl border-b border-[rgba(0,209,255,0.1)]">
          <div class="px-3 py-2">
            <!-- Mobile: Compact view (icons + numbers only) -->
            <div class="lg:hidden">
              <GameResourceBar
                :tinh-thach="resources.tinhThach"
                :nang-luong-vu-tru="resources.nangLuongVuTru"
                :hon-thach="resources.honThach"
                :dien-nang="resources.dienNang"
                :dien-nang-max="resources.dienNangMax"
                show-production
                :production="production"
                compact
              />
            </div>
            <!-- Desktop: Full view (with labels) -->
            <div class="hidden lg:block">
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
          </div>
        </header>

        <!-- Page content -->
        <div class="p-3 md:p-6">
          <slot />
        </div>

        <!-- Build Queue Floating Widget -->
        <GameBuildQueue />
      </template>
    </main>

    <!-- Mobile Bottom Tab Bar -->
    <nav class="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <!-- More menu popup -->
      <div 
        v-if="isMoreMenuOpen"
        class="absolute bottom-full left-0 right-0 mb-1 mx-2 bg-[#0D1117]/98 backdrop-blur-xl rounded-lg border border-[rgba(0,209,255,0.2)] shadow-2xl overflow-hidden"
      >
        <NuxtLink
          to="/game/research"
          class="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all"
          :class="isActiveRoute('/game/research') ? 'bg-[#00D1FF]/15 text-[#00D1FF]' : 'text-neutral-300 hover:bg-white/5'"
          @click="isMoreMenuOpen = false"
        >
          <IconsNghienCuu class="w-5 h-5" />
          <span>Nghiên cứu</span>
        </NuxtLink>
        <NuxtLink
          to="/game/galaxy"
          class="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all"
          :class="isActiveRoute('/game/galaxy') ? 'bg-[#00D1FF]/15 text-[#00D1FF]' : 'text-neutral-300 hover:bg-white/5'"
          @click="isMoreMenuOpen = false"
        >
          <IconsThienHa class="w-5 h-5" />
          <span>Thiên hà</span>
        </NuxtLink>
        <NuxtLink
          to="/game/settings"
          class="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all"
          :class="isActiveRoute('/game/settings') ? 'bg-[#00D1FF]/15 text-[#00D1FF]' : 'text-neutral-300 hover:bg-white/5'"
          @click="isMoreMenuOpen = false"
        >
          <IconsCaiDat class="w-5 h-5" />
          <span>Cài đặt</span>
        </NuxtLink>
        <button
          class="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-[#FF3366] hover:bg-[#FF3366]/10 transition-all"
          @click="handleLogout"
        >
          <IconsQuayLai class="w-5 h-5" />
          <span>Đăng xuất</span>
        </button>
      </div>

      <!-- Tab bar -->
      <div class="h-16 bg-[#0D1117]/98 backdrop-blur-xl border-t border-[rgba(0,209,255,0.15)] flex items-center justify-around px-1 safe-area-pb">
        <template v-for="item in mobileNav" :key="item.href || item.name">
          <!-- Regular nav items -->
          <NuxtLink
            v-if="item.href"
            :to="item.href"
            class="flex flex-col items-center justify-center w-14 h-14 rounded-lg transition-all duration-200"
            :class="isActiveRoute(item.href) 
              ? 'text-[#00D1FF]' 
              : 'text-neutral-500 active:bg-white/10'"
          >
            <span class="relative">
              <IconsTrungTamChiHuy v-if="item.iconType === 'dashboard'" class="w-6 h-6" />
              <IconsMoKhoang v-else-if="item.iconType === 'building'" class="w-6 h-6" />
              <IconsXuongDongTau v-else-if="item.iconType === 'shipyard'" class="w-6 h-6" />
              <IconsHamDoi v-else-if="item.iconType === 'fleet'" class="w-6 h-6" />
              <!-- Active glow -->
              <span 
                v-if="isActiveRoute(item.href)" 
                class="absolute -inset-1 bg-[#00D1FF]/20 blur-md rounded-full"
              />
            </span>
            <span class="text-[10px] mt-1 font-medium tracking-wide">{{ item.name }}</span>
          </NuxtLink>
          
          <!-- More button -->
          <button
            v-else
            class="flex flex-col items-center justify-center w-14 h-14 rounded-lg transition-all duration-200"
            :class="isMoreMenuOpen ? 'text-[#00D1FF]' : 'text-neutral-500 active:bg-white/10'"
            @click="toggleMoreMenu"
          >
            <span class="relative">
              <IconsMenu class="w-6 h-6" />
              <span 
                v-if="isMoreMenuOpen" 
                class="absolute -inset-1 bg-[#00D1FF]/20 blur-md rounded-full"
              />
            </span>
            <span class="text-[10px] mt-1 font-medium tracking-wide">{{ item.name }}</span>
          </button>
        </template>
      </div>
    </nav>
  </div>
</template>

<style scoped>
/* Safe area for notched phones */
.safe-area-pb {
  padding-bottom: env(safe-area-inset-bottom, 0);
}
</style>
