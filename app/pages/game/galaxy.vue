<script setup lang="ts">
import { FleetMission } from '~/types/game'
import { formatNumber } from '~/utils/gameFormulas'

definePageMeta({
  layout: 'game',
})

const router = useRouter()
const { player } = useAuth()
const { currentPlanet } = useGame()
const { currentGalaxy, currentSystem, systemView, isLoading, fetchSystem, changeGalaxy, changeSystem, jumpTo, formatCoords } = useGalaxy()
const { sendFleet } = useFleet()

// Fetch initial data
onMounted(() => {
  fetchSystem()
})

const navigateSystem = (direction: 'prev' | 'next') => {
  if (direction === 'prev') {
    if (currentSystem.value > 1) {
      changeSystem(-1)
    } else {
      currentSystem.value = 499
      if (currentGalaxy.value > 1) {
        changeGalaxy(-1)
      } else {
        currentGalaxy.value = 9
      }
      fetchSystem()
    }
  } else {
    if (currentSystem.value < 499) {
      changeSystem(1)
    } else {
      currentSystem.value = 1
      if (currentGalaxy.value < 9) {
        changeGalaxy(1)
      } else {
        currentGalaxy.value = 1
      }
      fetchSystem()
    }
  }
}

const goToSystem = () => {
  fetchSystem(currentGalaxy.value, currentSystem.value)
}

// Check if planet is owned by current player
const isOwnPlanet = (slot: any) => {
  return slot.owner?._id === player.value?._id || slot.owner?.username === player.value?.username
}

// Action error state
const actionError = ref<string | null>(null)
const actionSuccess = ref<string | null>(null)

// Handle spy mission
const handleSpy = async (slot: any) => {
  const ships = currentPlanet.value?.planet?.ships
  const spyProbes = ships?.TAU_DO_THAM || 0
  
  if (spyProbes === 0) {
    actionError.value = 'Bạn không có Tàu Do Thám nào!'
    setTimeout(() => actionError.value = null, 3000)
    return
  }

  const result = await sendFleet({
    originPlanetId: currentPlanet.value?.planet?.id,
    destination: { galaxy: currentGalaxy.value, system: currentSystem.value, position: slot.position },
    ships: [{ type: 'TAU_DO_THAM', count: Math.min(spyProbes, 5) }],
    mission: FleetMission.DO_THAM,
  }) as { success: boolean; error?: string }

  if (result.success) {
    actionSuccess.value = `Đã gửi hạm đội do thám đến ${slot.planet?.name || 'mục tiêu'}!`
    setTimeout(() => actionSuccess.value = null, 3000)
  } else {
    actionError.value = result.error || 'Gửi hạm đội thất bại'
    setTimeout(() => actionError.value = null, 3000)
  }
}

// Navigate to fleet page with pre-filled destination
const handleAttack = (slot: any) => {
  // Store destination in session storage for fleet page
  sessionStorage.setItem('fleetDestination', JSON.stringify({
    galaxy: currentGalaxy.value,
    system: currentSystem.value,
    position: slot.position,
    mission: FleetMission.TAN_CONG,
    targetName: slot.planet?.name
  }))
  router.push('/game/fleet')
}

const handleRecycle = (slot: any) => {
  sessionStorage.setItem('fleetDestination', JSON.stringify({
    galaxy: currentGalaxy.value,
    system: currentSystem.value,
    position: slot.position,
    mission: FleetMission.TAI_CHE,
    targetName: `Bãi phế liệu [${currentGalaxy.value}:${currentSystem.value}:${slot.position}]`
  }))
  router.push('/game/fleet')
}

const handleTransport = (slot: any) => {
  sessionStorage.setItem('fleetDestination', JSON.stringify({
    galaxy: currentGalaxy.value,
    system: currentSystem.value,
    position: slot.position,
    mission: FleetMission.VAN_CHUYEN,
    targetName: slot.planet?.name
  }))
  router.push('/game/fleet')
}

const handleColonize = (slot: any) => {
  const ships = currentPlanet.value?.planet?.ships
  const colonyShips = ships?.TAU_THUOC_DIA || 0
  
  if (colonyShips === 0) {
    actionError.value = 'Bạn không có Tàu Thuộc Địa nào!'
    setTimeout(() => actionError.value = null, 3000)
    return
  }

  sessionStorage.setItem('fleetDestination', JSON.stringify({
    galaxy: currentGalaxy.value,
    system: currentSystem.value,
    position: slot.position,
    mission: FleetMission.THUOC_DIA
  }))
  router.push('/game/fleet')
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-display font-bold text-gradient-cyan">Thiên Hà</h1>
        <p class="text-neutral-500 mt-1">Khám phá vũ trụ và tìm kiếm mục tiêu</p>
      </div>
      
      <!-- Navigation Controls -->
      <div class="flex items-center gap-2">
        <button
          class="neo-btn-ghost"
          @click="navigateSystem('prev')"
        >
          <IconsMuiTen class="w-5 h-5 rotate-180" />
        </button>
        
        <div class="flex items-center gap-2 neo-card px-4 py-2">
          <label class="text-sm text-neutral-500">Thiên hà:</label>
          <select
            v-model="currentGalaxy"
            class="neo-input py-1 px-2 w-16"
            @change="goToSystem"
          >
            <option v-for="g in 9" :key="g" :value="g">{{ g }}</option>
          </select>
          
          <label class="text-sm text-neutral-500 ml-2">Hệ sao:</label>
          <input
            v-model.number="currentSystem"
            type="number"
            min="1"
            max="499"
            class="neo-input w-20 py-1 px-2"
            @change="goToSystem"
          >
        </div>
        
        <button
          class="neo-btn-ghost"
          @click="navigateSystem('next')"
        >
          <IconsMuiTen class="w-5 h-5" />
        </button>
        
        <button class="neo-btn-primary flex items-center gap-2" @click="goToSystem">
          <IconsThienHa class="w-4 h-4" />
          Đi đến
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="neo-spinner"></div>
    </div>

    <!-- Galaxy View -->
    <div v-if="!isLoading && systemView.length > 0" class="neo-card overflow-hidden">
      <!-- Table Header -->
      <div class="grid grid-cols-12 gap-2 p-4 bg-space-900/50 border-b border-white/5 text-sm font-medium text-neutral-500 uppercase tracking-wider font-display">
        <div class="col-span-1 text-center">Vị trí</div>
        <div class="col-span-3">Hành tinh</div>
        <div class="col-span-2">Người chơi</div>
        <div class="col-span-1 text-center">Cấp</div>
        <div class="col-span-2">Liên minh</div>
        <div class="col-span-3 text-center">Hành động</div>
      </div>

      <!-- Planet Rows -->
      <div class="divide-y divide-white/5">
        <div
          v-for="slot in systemView"
          :key="slot.position"
          class="grid grid-cols-12 gap-2 p-4 items-center transition-colors"
          :class="{
            'bg-space-800/30': slot.planet,
            'hover:bg-primary-500/5': slot.planet,
            'bg-primary-500/10': isOwnPlanet(slot),
          }"
        >
          <!-- Position -->
          <div class="col-span-1 text-center">
            <span class="font-mono text-neutral-500">
              {{ currentGalaxy }}:{{ currentSystem }}:{{ slot.position }}
            </span>
          </div>

          <!-- Planet -->
          <div class="col-span-3">
            <template v-if="slot.planet">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 neo-card flex items-center justify-center"
                  :class="isOwnPlanet(slot) ? 'border-primary-500/50' : 'border-neutral-500/20'"
                >
                  <IconsHanhTinh class="w-6 h-6" :class="isOwnPlanet(slot) ? 'text-primary-500' : 'text-neutral-500'" />
                </div>
                <div>
                  <p class="font-medium">{{ slot.planet.name }}</p>
                  <p v-if="isOwnPlanet(slot)" class="text-xs text-primary-500">Hành tinh của bạn</p>
                  <div v-if="slot.hasDebris" class="flex items-center gap-1 text-xs text-slate-400 mt-1" title="Bãi phế liệu">
                    <IconsTauTaiChe class="w-3 h-3" />
                    <span>{{ formatNumber((slot.debris?.tinhThach || 0) + (slot.debris?.nangLuongVuTru || 0)) }}</span>
                  </div>
                </div>
              </div>
            </template>
            <template v-else>
              <span class="text-neutral-600">— Trống —</span>
            </template>
          </div>

          <!-- Owner -->
          <div class="col-span-2">
            <template v-if="slot.planet && slot.owner">
              <span
                class="font-medium"
                :class="isOwnPlanet(slot) ? 'text-primary-500' : 'text-neutral-400'"
              >
                {{ slot.owner.username }}
              </span>
            </template>
          </div>

          <!-- Level -->
          <div class="col-span-1 text-center">
            <template v-if="slot.owner">
              <span class="font-mono text-neutral-400">{{ slot.owner.level || '?' }}</span>
            </template>
          </div>

          <!-- Alliance -->
          <div class="col-span-2">
            <!-- Alliance info not in current API - placeholder -->
          </div>

          <!-- Actions -->
          <div class="col-span-3 flex items-center justify-center gap-1 flex-wrap">
            <template v-if="slot.planet && !isOwnPlanet(slot)">
                <button class="neo-btn-ghost text-xs p-1.5 flex items-center gap-1" title="Do thám" @click="handleSpy(slot)">
                  <IconsTauDoTham class="w-4 h-4" />
                </button>
                <button class="neo-btn-ghost text-xs p-1.5 text-alert-400 hover:bg-alert-400/10 flex items-center gap-1" title="Tấn công" @click="handleAttack(slot)">
                  <IconsTanCong class="w-4 h-4" />
                </button>
                <button class="neo-btn-ghost text-xs p-1.5 flex items-center gap-1" title="Vận chuyển" @click="handleTransport(slot)">
                  <IconsHamDoi class="w-4 h-4" />
                </button>
            </template>
            <template v-else-if="!slot.planet">
                <button class="neo-btn-ghost text-xs p-1.5 text-success-400 hover:bg-success-400/10 flex items-center gap-1" title="Thuộc địa hóa" @click="handleColonize(slot)">
                  <IconsHanhTinh class="w-4 h-4" />
                </button>
            </template>
            
            <!-- Recycle -->
            <button v-if="slot.hasDebris" class="neo-btn-ghost text-xs p-1.5 text-green-400 hover:bg-green-400/10 flex items-center gap-1" title="Thu gom phế liệu" @click="handleRecycle(slot)">
              <IconsTauTaiChe class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="actionSuccess" class="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 neo-card p-4 border-l-2 border-success-400 bg-space-900/95">
      <div class="flex items-center gap-3">
        <IconsHoanThanh class="w-5 h-5 text-success-400" />
        <p class="text-success-400">{{ actionSuccess }}</p>
      </div>
    </div>
    
    <div v-if="actionError" class="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 neo-card p-4 border-l-2 border-alert-400 bg-space-900/95">
      <div class="flex items-center gap-3">
        <IconsCanhBao class="w-5 h-5 text-alert-400" />
        <p class="text-alert-400">{{ actionError }}</p>
      </div>
    </div>

    <!-- Legend -->
    <div class="flex flex-wrap gap-6 text-sm text-neutral-500">
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 neo-card border-primary-500/50" />
        <span>Hành tinh của bạn</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 neo-card border-neutral-500/20" />
        <span>Hành tinh của người chơi khác</span>
      </div>
      <div class="flex items-center gap-2">
        <IconsHanhTinh class="w-4 h-4 text-success-400" />
        <span>Có thể thuộc địa hóa</span>
      </div>
    </div>
  </div>
</template>
