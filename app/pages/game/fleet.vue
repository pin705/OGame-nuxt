<script setup lang="ts">
import { ShipType, FleetMission } from '~/types/game'
import { SHIPS } from '~/config/gameConfig'
import { formatNumber, formatCoordinates } from '~/utils/gameFormulas'

definePageMeta({
  layout: 'game',
})

const { currentPlanet, isLoading } = useGame()
const { fleets, isLoading: fleetsLoading, fetchFleets, sendFleet, recallFleet, getFleetCountdown } = useFleet()

// Fetch fleets on mount
onMounted(() => {
  fetchFleets()
})

// Available ships on current planet
const availableShips = computed(() => {
  if (!currentPlanet.value?.ships) return []
  const ships = currentPlanet.value.ships as Record<string, number>
  return Object.entries(ships)
    .filter(([_, count]) => count > 0)
    .map(([type, count]) => ({
      type: type as ShipType,
      count: count as number,
    }))
})

const selectedShips = ref<Record<string, number>>({})

// Fleet dispatch form
const dispatch = reactive({
  destination: { galaxy: 1, system: 1, position: 1 },
  mission: FleetMission.TAN_CONG,
  speed: 100,
  resources: { tinhThach: 0, nangLuongVuTru: 0, honThach: 0 },
})

const missions = [
  { value: FleetMission.TAN_CONG, label: 'Tấn công' },
  { value: FleetMission.VAN_CHUYEN, label: 'Vận chuyển' },
  { value: FleetMission.TRIEN_KHAI, label: 'Triển khai' },
  { value: FleetMission.DO_THAM, label: 'Do thám' },
  { value: FleetMission.TAI_CHE, label: 'Tái chế' },
  { value: FleetMission.THUOC_DIA, label: 'Thuộc địa' },
]

const totalSelectedShips = computed(() => {
  return Object.values(selectedShips.value).reduce((sum, count) => sum + (count || 0), 0)
})

const selectAllShips = () => {
  availableShips.value.forEach(ship => {
    selectedShips.value[ship.type] = ship.count
  })
}

const clearSelection = () => {
  selectedShips.value = {}
}

const getMissionLabel = (mission: FleetMission) => {
  const found = missions.find(m => m.value === mission)
  return found?.label || mission
}

const fleetError = ref<string | null>(null)
const isSending = ref(false)

const handleSendFleet = async () => {
  if (totalSelectedShips.value === 0) return
  
  fleetError.value = null
  isSending.value = true
  
  try {
    // Prepare ships array
    const ships = Object.entries(selectedShips.value)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => ({
        type: type as ShipType,
        count: count as number,
      }))
    
    const result = await sendFleet({
      ships,
      destination: dispatch.destination,
      mission: dispatch.mission,
      speed: dispatch.speed,
      resources: dispatch.mission === FleetMission.VAN_CHUYEN ? dispatch.resources : undefined,
    })
    
    if (!result.success) {
      fleetError.value = result.error || 'Gửi hạm đội thất bại'
      setTimeout(() => {
        fleetError.value = null
      }, 3000)
    } else {
      // Reset selection
      clearSelection()
    }
  } finally {
    isSending.value = false
  }
}

const handleRecallFleet = async (fleetId: string) => {
  const result = await recallFleet(fleetId)
  if (!result.success) {
    fleetError.value = result.error || 'Thu hồi hạm đội thất bại'
    setTimeout(() => {
      fleetError.value = null
    }, 3000)
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-display font-bold">Hạm Đội</h1>
      <p class="text-slate-400">Quản lý và điều khiển hạm đội của bạn</p>
    </div>

    <!-- Error Message -->
    <div v-if="fleetError" class="glass-card p-4 border-l-4 border-red-500">
      <div class="flex items-center gap-3">
        <IconsCanhBao class="w-6 h-6 text-red-400" />
        <p class="text-red-400">{{ fleetError }}</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="(isLoading || fleetsLoading) && !currentPlanet" class="flex items-center justify-center py-12">
      <div class="animate-spin w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"></div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Ship Selection -->
      <UiCard title="Chọn Tàu" subtitle="Chọn tàu để triển khai hạm đội">
        <template #header-actions>
          <div class="flex gap-2">
            <button class="btn-ghost text-xs" @click="selectAllShips">
              Chọn tất cả
            </button>
            <button class="btn-ghost text-xs" @click="clearSelection">
              Xóa
            </button>
          </div>
        </template>

        <div v-if="availableShips.length === 0" class="text-center py-8 text-slate-500">
          <IconsChienHam class="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Không có tàu nào trên hành tinh này</p>
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="ship in availableShips"
            :key="ship.type"
            class="flex items-center gap-4 p-3 rounded-lg bg-space-700/30"
          >
            <div class="w-10 h-10 rounded-lg bg-space-700 flex items-center justify-center flex-shrink-0">
              <IconsChienHam class="w-6 h-6 text-slate-400" />
            </div>
            
            <div class="flex-1">
              <p class="font-medium text-slate-200 text-sm">{{ SHIPS[ship.type]?.name || ship.type }}</p>
              <p class="text-xs text-slate-500">Sẵn có: {{ ship.count }}</p>
            </div>

            <input
              v-model.number="selectedShips[ship.type]"
              type="number"
              min="0"
              :max="ship.count"
              placeholder="0"
              class="input w-20 text-center text-sm"
            >
          </div>
        </div>

        <div class="mt-4 p-3 rounded-lg bg-space-700/50">
          <p class="text-sm text-slate-400">
            Tổng số tàu đã chọn: 
            <span class="font-mono font-bold text-primary-400">{{ totalSelectedShips }}</span>
          </p>
        </div>
      </UiCard>

      <!-- Mission Configuration -->
      <UiCard title="Nhiệm Vụ" subtitle="Cấu hình đích đến và nhiệm vụ">
        <div class="space-y-4">
          <!-- Destination -->
          <div>
            <label class="label">Tọa độ đích</label>
            <div class="flex items-center gap-2">
              <input
                v-model.number="dispatch.destination.galaxy"
                type="number"
                min="1"
                max="9"
                placeholder="Thiên hà"
                class="input w-20 text-center"
              >
              <span class="text-slate-500">:</span>
              <input
                v-model.number="dispatch.destination.system"
                type="number"
                min="1"
                max="499"
                placeholder="Hệ sao"
                class="input w-24 text-center"
              >
              <span class="text-slate-500">:</span>
              <input
                v-model.number="dispatch.destination.position"
                type="number"
                min="1"
                max="15"
                placeholder="Vị trí"
                class="input w-20 text-center"
              >
            </div>
          </div>

          <!-- Mission Type -->
          <div>
            <label class="label">Loại nhiệm vụ</label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="mission in missions"
                :key="mission.value"
                class="flex flex-col items-center gap-1 p-3 rounded-lg border transition-all duration-200"
                :class="
                  dispatch.mission === mission.value
                    ? 'bg-primary-500/20 border-primary-500/50 text-primary-400'
                    : 'border-space-600 text-slate-400 hover:bg-space-700'
                "
                @click="dispatch.mission = mission.value"
              >
                <IconsHamDoi class="w-5 h-5" />
                <span class="text-xs">{{ mission.label }}</span>
              </button>
            </div>
          </div>

          <!-- Speed -->
          <div>
            <label class="label">Tốc độ: {{ dispatch.speed }}%</label>
            <input
              v-model.number="dispatch.speed"
              type="range"
              min="10"
              max="100"
              step="10"
              class="w-full"
            >
            <div class="flex justify-between text-xs text-slate-500">
              <span>10%</span>
              <span>100%</span>
            </div>
          </div>

          <!-- Resources (for transport missions) -->
          <div v-if="dispatch.mission === FleetMission.VAN_CHUYEN">
            <label class="label">Tài nguyên vận chuyển</label>
            <div class="grid grid-cols-3 gap-2">
              <div>
                <label class="text-xs text-slate-500 flex items-center gap-1">
                  <IconsTinhThach class="w-3 h-3" />
                  Tinh Thạch
                </label>
                <input
                  v-model.number="dispatch.resources.tinhThach"
                  type="number"
                  min="0"
                  class="input text-sm"
                >
              </div>
              <div>
                <label class="text-xs text-slate-500 flex items-center gap-1">
                  <IconsNangLuong class="w-3 h-3" />
                  Năng Lượng VT
                </label>
                <input
                  v-model.number="dispatch.resources.nangLuongVuTru"
                  type="number"
                  min="0"
                  class="input text-sm"
                >
              </div>
              <div>
                <label class="text-xs text-slate-500 flex items-center gap-1">
                  <IconsHonThach class="w-3 h-3" />
                  Hồn Thạch
                </label>
                <input
                  v-model.number="dispatch.resources.honThach"
                  type="number"
                  min="0"
                  class="input text-sm"
                >
              </div>
            </div>
          </div>

          <!-- Launch Button -->
          <button
            :disabled="totalSelectedShips === 0 || isSending"
            class="btn-primary w-full flex items-center justify-center gap-2"
            :class="{ 'opacity-50 cursor-not-allowed': totalSelectedShips === 0 || isSending }"
            @click="handleSendFleet"
          >
            <IconsHamDoi class="w-5 h-5" />
            {{ isSending ? 'Đang gửi...' : 'Xuất phát hạm đội' }}
          </button>
        </div>
      </UiCard>
    </div>

    <!-- Active Fleets -->
    <UiCard title="Hạm Đội Đang Hoạt Động" :subtitle="`${fleets.length} hạm đội đang di chuyển`">
      <div v-if="fleets.length === 0" class="text-center py-8 text-slate-500">
        <IconsHamDoi class="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Không có hạm đội nào đang hoạt động</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="fleet in fleets"
          :key="fleet._id"
          class="glass-card p-4"
          :class="{
            'border-l-4 border-red-500': fleet.mission === FleetMission.TAN_CONG,
            'border-l-4 border-blue-500': fleet.mission === FleetMission.VAN_CHUYEN,
            'border-l-4 border-yellow-500': fleet.status === 'RETURNING',
          }"
        >
          <div class="flex flex-wrap items-center gap-4">
            <!-- Mission Icon -->
            <div class="w-12 h-12 rounded-lg bg-space-700 flex items-center justify-center">
              <IconsHamDoi class="w-8 h-8 text-primary-400" />
            </div>

            <!-- Fleet Info -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-display font-semibold text-slate-200">
                  {{ getMissionLabel(fleet.mission) }}
                </span>
                <span
                  class="badge"
                  :class="{
                    'badge-warning': fleet.status === 'DEPARTING',
                    'badge-info': fleet.status === 'RETURNING',
                  }"
                >
                  {{ fleet.status === 'DEPARTING' ? 'Đang đi' : 'Đang về' }}
                </span>
              </div>
              
              <p class="text-sm text-slate-400 flex items-center gap-1">
                {{ formatCoordinates(fleet.origin) }}
                <IconsMuiTen class="w-4 h-4 mx-1" />
                {{ formatCoordinates(fleet.destination) }}
              </p>

              <!-- Ships in fleet -->
              <div class="flex flex-wrap gap-2 mt-2">
                <span
                  v-for="ship in fleet.ships"
                  :key="ship.type"
                  class="text-xs px-2 py-1 rounded bg-space-700 text-slate-300"
                >
                  {{ SHIPS[ship.type]?.name || ship.type }} x{{ ship.count }}
                </span>
              </div>
            </div>

            <!-- Time & Actions -->
            <div class="text-right">
              <p class="text-xs text-slate-500">
                {{ fleet.status === 'RETURNING' ? 'Về lúc' : 'Đến lúc' }}
              </p>
              <p class="font-mono text-lg text-accent-400">{{ getFleetCountdown(fleet) }}</p>
              <button 
                v-if="fleet.status === 'DEPARTING'"
                class="btn-ghost text-xs text-red-400 hover:bg-red-500/10 mt-2 flex items-center gap-1"
                @click="handleRecallFleet(fleet._id)"
              >
                <IconsQuayLai class="w-4 h-4" />
                Thu hồi
              </button>
            </div>
          </div>

          <!-- Resources (if transport) -->
          <div v-if="fleet.resources" class="flex gap-4 mt-3 pt-3 border-t border-space-700">
            <span class="resource-metal text-xs flex items-center gap-1">
              <IconsTinhThach class="w-4 h-4" />
              {{ formatNumber(fleet.resources.tinhThach) }}
            </span>
            <span class="resource-crystal text-xs flex items-center gap-1">
              <IconsNangLuong class="w-4 h-4" />
              {{ formatNumber(fleet.resources.nangLuongVuTru) }}
            </span>
            <span class="resource-deuterium text-xs flex items-center gap-1">
              <IconsHonThach class="w-4 h-4" />
              {{ formatNumber(fleet.resources.honThach) }}
            </span>
          </div>
        </div>
      </div>
    </UiCard>
  </div>
</template>
