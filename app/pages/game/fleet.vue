<script setup lang="ts">
import { ShipType, FleetMission } from '~/types/game'
import { SHIPS } from '~/config/gameConfig'
import { formatNumber, formatCoordinates } from '~/utils/gameFormulas'

definePageMeta({
  layout: 'game',
})

// Available ships on current planet
const availableShips = ref([
  { type: ShipType.TIEU_CHIEN_HAM, count: 150 },
  { type: ShipType.TRUNG_CHIEN_HAM, count: 45 },
  { type: ShipType.TUAN_DUONG_HAM, count: 20 },
  { type: ShipType.THIET_GIAP_HAM, count: 5 },
  { type: ShipType.VAN_TAI_NHO, count: 100 },
  { type: ShipType.VAN_TAI_LON, count: 30 },
  { type: ShipType.TAU_DO_THAM, count: 50 },
  { type: ShipType.TAU_TAI_CHE, count: 10 },
])

const selectedShips = ref<Record<string, number>>({})

// Active fleets
const activeFleets = ref([
  {
    id: '1',
    mission: FleetMission.TAN_CONG,
    origin: { galaxy: 1, system: 250, position: 8 },
    destination: { galaxy: 1, system: 245, position: 7 },
    ships: [
      { type: ShipType.TIEU_CHIEN_HAM, count: 50 },
      { type: ShipType.TRUNG_CHIEN_HAM, count: 20 },
    ],
    departureTime: new Date(Date.now() - 1800000),
    arrivalTime: new Date(Date.now() + 1800000),
    status: 'DEPARTING',
  },
  {
    id: '2',
    mission: FleetMission.VAN_CHUYEN,
    origin: { galaxy: 1, system: 250, position: 8 },
    destination: { galaxy: 1, system: 260, position: 4 },
    ships: [
      { type: ShipType.VAN_TAI_LON, count: 10 },
    ],
    resources: { tinhThach: 100000, nangLuongVuTru: 50000, honThach: 25000 },
    departureTime: new Date(Date.now() - 3600000),
    arrivalTime: new Date(Date.now() - 600000),
    returnTime: new Date(Date.now() + 2400000),
    status: 'RETURNING',
  },
])

// Fleet dispatch form
const dispatch = reactive({
  destination: { galaxy: 1, system: 1, position: 1 },
  mission: FleetMission.TAN_CONG,
  speed: 100,
  resources: { tinhThach: 0, nangLuongVuTru: 0, honThach: 0 },
})

const missions = [
  { value: FleetMission.TAN_CONG, label: 'Tấn công', icon: 'mdi:sword' },
  { value: FleetMission.VAN_CHUYEN, label: 'Vận chuyển', icon: 'mdi:truck' },
  { value: FleetMission.TRIEN_KHAI, label: 'Triển khai', icon: 'mdi:flag' },
  { value: FleetMission.DO_THAM, label: 'Do thám', icon: 'mdi:eye' },
  { value: FleetMission.TAI_CHE, label: 'Tái chế', icon: 'mdi:recycle' },
  { value: FleetMission.THUOC_DIA, label: 'Thuộc địa', icon: 'mdi:earth-plus' },
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

const getMissionIcon = (mission: FleetMission) => {
  const found = missions.find(m => m.value === mission)
  return found?.icon || 'mdi:rocket'
}

const getMissionLabel = (mission: FleetMission) => {
  const found = missions.find(m => m.value === mission)
  return found?.label || mission
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-display font-bold">Hạm Đội</h1>
      <p class="text-slate-400">Quản lý và điều khiển hạm đội của bạn</p>
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

        <div class="space-y-2">
          <div
            v-for="ship in availableShips"
            :key="ship.type"
            class="flex items-center gap-4 p-3 rounded-lg bg-space-700/30"
          >
            <div class="w-10 h-10 rounded-lg bg-space-700 flex items-center justify-center flex-shrink-0">
              <Icon name="mdi:rocket" class="text-xl text-slate-400" />
            </div>
            
            <div class="flex-1">
              <p class="font-medium text-slate-200 text-sm">{{ SHIPS[ship.type].name }}</p>
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
                <Icon :name="mission.icon" class="text-xl" />
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
                <label class="text-xs text-slate-500">Tinh Thạch</label>
                <input
                  v-model.number="dispatch.resources.tinhThach"
                  type="number"
                  min="0"
                  class="input text-sm"
                >
              </div>
              <div>
                <label class="text-xs text-slate-500">Năng Lượng VT</label>
                <input
                  v-model.number="dispatch.resources.nangLuongVuTru"
                  type="number"
                  min="0"
                  class="input text-sm"
                >
              </div>
              <div>
                <label class="text-xs text-slate-500">Hồn Thạch</label>
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
            :disabled="totalSelectedShips === 0"
            class="btn-primary w-full"
            :class="{ 'opacity-50 cursor-not-allowed': totalSelectedShips === 0 }"
          >
            <Icon name="mdi:rocket-launch" />
            Xuất phát hạm đội
          </button>
        </div>
      </UiCard>
    </div>

    <!-- Active Fleets -->
    <UiCard title="Hạm Đội Đang Hoạt Động" :subtitle="`${activeFleets.length} hạm đội đang di chuyển`">
      <div v-if="activeFleets.length === 0" class="text-center py-8 text-slate-500">
        <Icon name="mdi:ship-wheel" class="text-5xl mb-3 opacity-50" />
        <p>Không có hạm đội nào đang hoạt động</p>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="fleet in activeFleets"
          :key="fleet.id"
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
              <Icon :name="getMissionIcon(fleet.mission)" class="text-2xl text-primary-400" />
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
              
              <p class="text-sm text-slate-400">
                {{ formatCoordinates(fleet.origin) }}
                <Icon name="mdi:arrow-right" class="mx-1" />
                {{ formatCoordinates(fleet.destination) }}
              </p>

              <!-- Ships in fleet -->
              <div class="flex flex-wrap gap-2 mt-2">
                <span
                  v-for="ship in fleet.ships"
                  :key="ship.type"
                  class="text-xs px-2 py-1 rounded bg-space-700 text-slate-300"
                >
                  {{ SHIPS[ship.type].name }} x{{ ship.count }}
                </span>
              </div>
            </div>

            <!-- Time & Actions -->
            <div class="text-right">
              <p class="text-xs text-slate-500">
                {{ fleet.status === 'RETURNING' ? 'Về lúc' : 'Đến lúc' }}
              </p>
              <p class="font-mono text-lg text-accent-400">30:00</p>
              <button class="btn-ghost text-xs text-red-400 hover:bg-red-500/10 mt-2">
                <Icon name="mdi:keyboard-return" />
                Thu hồi
              </button>
            </div>
          </div>

          <!-- Resources (if transport) -->
          <div v-if="fleet.resources" class="flex gap-4 mt-3 pt-3 border-t border-space-700">
            <span class="resource-metal text-xs">
              <Icon name="mdi:gold" />
              {{ formatNumber(fleet.resources.tinhThach) }}
            </span>
            <span class="resource-crystal text-xs">
              <Icon name="mdi:diamond-stone" />
              {{ formatNumber(fleet.resources.nangLuongVuTru) }}
            </span>
            <span class="resource-deuterium text-xs">
              <Icon name="mdi:water" />
              {{ formatNumber(fleet.resources.honThach) }}
            </span>
          </div>
        </div>
      </div>
    </UiCard>
  </div>
</template>
