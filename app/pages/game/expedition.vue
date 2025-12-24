<script setup lang="ts">
import { format } from 'date-fns'
import { SHIPS } from '~/config/gameConfig'
import { ShipType } from '~/types/game'
import { formatNumber } from '~/utils/gameFormulas'

definePageMeta({
  layout: 'game',
})

const { currentPlanet } = useGame()

// Tabs
const tabs = [
  { id: 'send', label: 'Gửi Thám Hiểm', icon: 'ThamHiem' },
  { id: 'active', label: 'Đang Hoạt Động', icon: 'ThoiGian' },
  { id: 'history', label: 'Lịch Sử', icon: 'ThongTin' },
  { id: 'stats', label: 'Thống Kê', icon: 'NghienCuu' },
]
const activeTab = ref('send')

// Fetch expeditions
const { data: expeditionData, refresh, pending } = await useFetch('/api/game/expedition', {
  lazy: true,
})

const expeditions = computed(() => expeditionData.value?.data || { active: [], recent: [], maxExpeditions: 1, currentCount: 0 })

// Available ships on current planet
const availableShips = computed(() => {
  const ships = currentPlanet.value?.planet?.ships as Record<string, number> | undefined
  if (!ships) return []
  return Object.entries(ships)
    .filter(([_, count]) => count > 0)
    .map(([type, count]) => ({
      type: type as ShipType,
      count: count as number,
      config: SHIPS[type as ShipType],
    }))
})

// Selected ships for expedition
const selectedShips = ref<Record<string, number>>({})

// Destination
const destination = reactive({
  galaxy: 1,
  system: 1,
})

const isSending = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const totalSelectedShips = computed(() => {
  return Object.values(selectedShips.value).reduce((sum, count) => sum + (count || 0), 0)
})

const canSendExpedition = computed(() => {
  return totalSelectedShips.value > 0 && 
         expeditions.value.currentCount < expeditions.value.maxExpeditions
})

const clearSelection = () => {
  selectedShips.value = {}
}

const selectAllShips = () => {
  availableShips.value.forEach(ship => {
    selectedShips.value[ship.type] = ship.count
  })
}

const sendExpedition = async () => {
  if (!canSendExpedition.value) return
  
  error.value = null
  success.value = null
  isSending.value = true
  
  try {
    const ships = Object.entries(selectedShips.value)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => ({ type, count }))
    
    const result = await $fetch('/api/game/expedition/send', {
      method: 'POST',
      body: {
        planetId: currentPlanet.value?.planet?._id,
        ships,
        destination,
      },
    }) as { success: boolean; message?: string }
    
    if (result.success) {
      success.value = 'Đã gửi hạm đội thám hiểm thành công!'
      clearSelection()
      activeTab.value = 'active'
      refresh()
      setTimeout(() => { success.value = null }, 5000)
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Lỗi khi gửi thám hiểm'
    setTimeout(() => { error.value = null }, 5000)
  } finally {
    isSending.value = false
  }
}

// Statistics computed
const stats = computed(() => {
  const recent = expeditions.value.recent || []
  const totalExpeditions = recent.length
  
  let totalMetal = 0
  let totalCrystal = 0
  let totalDeuterium = 0
  let shipsFound = 0
  let shipsLost = 0
  let emptyReturns = 0
  
  recent.forEach((exp: any) => {
    if (exp.result) {
      if (exp.result.resources) {
        totalMetal += exp.result.resources.tinhThach || 0
        totalCrystal += exp.result.resources.nangLuongVuTru || 0
        totalDeuterium += exp.result.resources.honThach || 0
      }
      if (exp.result.shipsFound) {
        shipsFound += exp.result.shipsFound.reduce((sum: number, s: any) => sum + s.count, 0)
      }
      if (exp.result.shipsLost) {
        shipsLost += exp.result.shipsLost.reduce((sum: number, s: any) => sum + s.count, 0)
      }
      if (exp.result.type === 'NOTHING') {
        emptyReturns++
      }
    }
  })
  
  return {
    totalExpeditions,
    totalMetal,
    totalCrystal,
    totalDeuterium,
    shipsFound,
    shipsLost,
    emptyReturns,
    successRate: totalExpeditions > 0 ? Math.round((totalExpeditions - emptyReturns) / totalExpeditions * 100) : 0,
  }
})

const formatDate = (dateStr: string) => format(new Date(dateStr), 'HH:mm:ss dd/MM')

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    TRAVELING: 'Đang di chuyển',
    EXPLORING: 'Đang thám hiểm',
    RETURNING: 'Đang quay về',
    COMPLETED: 'Hoàn thành',
    LOST: 'Mất tích',
  }
  return labels[status] || status
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    TRAVELING: 'text-primary-400 bg-primary-400/10',
    EXPLORING: 'text-warning-400 bg-warning-400/10',
    RETURNING: 'text-success-400 bg-success-400/10',
    COMPLETED: 'text-neutral-400 bg-neutral-400/10',
    LOST: 'text-alert-400 bg-alert-400/10',
  }
  return colors[status] || 'text-neutral-400'
}

const getResultLabel = (type: string) => {
  const labels: Record<string, string> = {
    NOTHING: 'Không tìm thấy gì',
    RESOURCES: 'Tìm thấy tài nguyên!',
    FLEET: 'Tìm thấy tàu!',
    DARK_MATTER: 'Hắc Ám Vật Chất!',
    ALIEN_ATTACK: 'Bị tấn công!',
    PIRATES: 'Gặp cướp biển!',
    DELAY: 'Bị chậm trễ',
    EARLY_RETURN: 'Về sớm',
    MERCHANT: 'Gặp thương nhân',
    BLACK_HOLE: 'Rơi vào hố đen!',
  }
  return labels[type] || type
}

const getResultColor = (type: string) => {
  if (type === 'NOTHING') return 'text-neutral-500'
  if (['ALIEN_ATTACK', 'PIRATES', 'BLACK_HOLE'].includes(type)) return 'text-alert-400'
  return 'text-success-400'
}

// Auto refresh every 15 seconds
let refreshInterval: NodeJS.Timeout | null = null
onMounted(() => {
  refreshInterval = setInterval(refresh, 15000)
})
onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-display font-bold text-gradient-cyan">Thám Hiểm Vũ Trụ</h1>
        <p class="text-neutral-500 mt-1">Khám phá vùng không gian sâu và tìm kiếm kho báu bí ẩn</p>
      </div>
      <div class="neo-card px-4 py-3 flex items-center gap-4">
        <div class="flex items-center gap-2">
          <IconsThamHiem class="w-5 h-5 text-primary-400" />
          <span class="text-neutral-500">Thám hiểm: </span>
          <span class="font-mono text-primary-400 text-lg">{{ expeditions.currentCount }}</span>
          <span class="text-neutral-500">/</span>
          <span class="font-mono text-lg">{{ expeditions.maxExpeditions }}</span>
        </div>
        <button @click="refresh()" class="neo-btn-ghost p-2" :class="{ 'animate-spin': pending }">
          <IconsTaiDang class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Messages -->
    <Transition name="fade">
      <div v-if="error" class="neo-card p-4 border-l-2 border-alert-400 bg-alert-400/10 flex items-center gap-3">
        <IconsCanhBao class="w-5 h-5 text-alert-400 flex-shrink-0" />
        <p class="text-alert-400">{{ error }}</p>
      </div>
    </Transition>
    <Transition name="fade">
      <div v-if="success" class="neo-card p-4 border-l-2 border-success-400 bg-success-400/10 flex items-center gap-3">
        <IconsHoanThanh class="w-5 h-5 text-success-400 flex-shrink-0" />
        <p class="text-success-400">{{ success }}</p>
      </div>
    </Transition>

    <!-- Tabs -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="flex items-center gap-2 px-4 py-2.5 transition-all duration-200"
        :class="activeTab === tab.id ? 'neo-btn' : 'neo-btn-ghost'"
        @click="activeTab = tab.id"
      >
        <component :is="`Icons${tab.icon}`" class="w-5 h-5" />
        {{ tab.label }}
        <span v-if="tab.id === 'active' && expeditions.currentCount > 0" 
              class="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary-500/20 text-primary-400">
          {{ expeditions.currentCount }}
        </span>
      </button>
    </div>

    <!-- Send Expedition Tab -->
    <div v-if="activeTab === 'send'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Ship Selection -->
      <UiCard title="Chọn Tàu Thám Hiểm" subtitle="Chọn tàu từ hành tinh hiện tại">
        <template #header-actions>
          <div class="flex gap-2">
            <button class="text-xs text-primary-400 hover:text-primary-300" @click="selectAllShips">
              Chọn tất cả
            </button>
            <button class="text-xs text-neutral-400 hover:text-neutral-300" @click="clearSelection">
              Xóa chọn
            </button>
          </div>
        </template>
        
        <div class="space-y-3">
          <div v-if="availableShips.length === 0" class="text-center py-8">
            <IconsChienHam class="w-12 h-12 mx-auto text-neutral-600 mb-3" />
            <p class="text-neutral-500">Không có tàu nào trên hành tinh</p>
            <p class="text-xs text-neutral-600 mt-1">Xây dựng tàu tại Xưởng Đóng Tàu</p>
          </div>
          
          <div 
            v-for="ship in availableShips" 
            :key="ship.type"
            class="flex items-center gap-4 p-3 neo-card neo-card-hover"
            :class="{ 'ring-1 ring-primary-500/50': (selectedShips[ship.type] || 0) > 0 }"
          >
            <div class="w-12 h-12 neo-card flex items-center justify-center border-primary-500/20">
              <IconsChienHam class="w-6 h-6 text-primary-500" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-display font-semibold truncate">{{ ship.config?.name || ship.type }}</p>
              <p class="text-xs text-neutral-500">
                Có sẵn: <span class="text-primary-400 font-mono">{{ ship.count }}</span>
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button 
                class="neo-btn-ghost p-1 w-8 h-8"
                @click="selectedShips[ship.type] = Math.max(0, (selectedShips[ship.type] || 0) - 1)"
              >
                -
              </button>
              <input
                v-model.number="selectedShips[ship.type]"
                type="number"
                min="0"
                :max="ship.count"
                class="neo-input w-20 text-center"
                placeholder="0"
              >
              <button 
                class="neo-btn-ghost p-1 w-8 h-8"
                @click="selectedShips[ship.type] = Math.min(ship.count, (selectedShips[ship.type] || 0) + 1)"
              >
                +
              </button>
            </div>
          </div>
        </div>
        
        <div v-if="totalSelectedShips > 0" class="mt-4 p-3 bg-primary-500/10 rounded-lg">
          <p class="text-sm text-primary-400">
            Đã chọn: <span class="font-mono font-bold">{{ totalSelectedShips }}</span> tàu
          </p>
        </div>
      </UiCard>

      <!-- Destination & Send -->
      <UiCard title="Tọa Độ Đích" subtitle="Chọn vị trí thám hiểm">
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="neo-label">Thiên Hà</label>
              <select v-model="destination.galaxy" class="neo-input">
                <option v-for="g in 9" :key="g" :value="g">Thiên hà {{ g }}</option>
              </select>
            </div>
            <div>
              <label class="neo-label">Hệ Sao</label>
              <input 
                v-model.number="destination.system" 
                type="number" 
                min="1" 
                max="499" 
                class="neo-input"
              >
            </div>
          </div>

          <div class="p-4 neo-card bg-space-800/50">
            <p class="text-xs text-neutral-500 uppercase tracking-wider mb-2">Thông tin thám hiểm</p>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-neutral-400">Tọa độ đích:</span>
                <span class="font-mono text-primary-400">[{{ destination.galaxy }}:{{ destination.system }}:16]</span>
              </div>
              <div class="flex justify-between">
                <span class="text-neutral-400">Thời gian thám hiểm:</span>
                <span class="font-mono">~1 giờ</span>
              </div>
              <div class="flex justify-between">
                <span class="text-neutral-400">Slot còn lại:</span>
                <span class="font-mono" :class="expeditions.currentCount >= expeditions.maxExpeditions ? 'text-alert-400' : 'text-success-400'">
                  {{ expeditions.maxExpeditions - expeditions.currentCount }}
                </span>
              </div>
            </div>
          </div>

          <!-- Send Button -->
          <button 
            class="w-full py-3 neo-btn-success flex items-center justify-center gap-2"
            :class="{ 'opacity-50 cursor-not-allowed': !canSendExpedition || isSending }"
            :disabled="!canSendExpedition || isSending"
            @click="sendExpedition"
          >
            <svg v-if="isSending" class="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <IconsThamHiem v-else class="w-5 h-5" />
            {{ isSending ? 'Đang gửi...' : 'Gửi Thám Hiểm' }}
          </button>
          
          <p v-if="expeditions.currentCount >= expeditions.maxExpeditions" class="text-warning-400 text-sm text-center">
            Đã đạt giới hạn thám hiểm. Nâng cấp Công Nghệ Siêu Không Gian để mở thêm slot.
          </p>
        </div>
      </UiCard>
    </div>

    <!-- Active Expeditions Tab -->
    <div v-if="activeTab === 'active'" class="space-y-4">
      <div v-if="expeditions.active.length === 0" class="neo-card p-12 text-center">
        <IconsThamHiem class="w-16 h-16 mx-auto text-neutral-600 mb-4" />
        <p class="text-neutral-500 text-lg">Không có thám hiểm nào đang hoạt động</p>
        <p class="text-neutral-600 text-sm mt-2">Gửi hạm đội để bắt đầu thám hiểm vũ trụ!</p>
        <button class="neo-btn mt-4" @click="activeTab = 'send'">
          <IconsThamHiem class="w-4 h-4 mr-2" />
          Gửi Thám Hiểm
        </button>
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          v-for="exp in expeditions.active" 
          :key="exp._id"
          class="neo-card neo-card-hover p-5"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <span class="font-mono text-lg text-primary-400">
                [{{ exp.destination.galaxy }}:{{ exp.destination.system }}:16]
              </span>
              <span class="ml-3 px-2 py-1 rounded text-xs font-medium" :class="getStatusColor(exp.status)">
                {{ getStatusLabel(exp.status) }}
              </span>
            </div>
          </div>
          
          <div class="space-y-2 text-sm mb-4">
            <div class="flex items-center gap-2 text-neutral-400">
              <IconsHanhTinh class="w-4 h-4" />
              <span>Từ: {{ exp.originPlanet?.name }}</span>
            </div>
            <div v-if="exp.status === 'TRAVELING'" class="flex items-center gap-2">
              <IconsThoiGian class="w-4 h-4 text-primary-400 animate-pulse" />
              <span class="text-neutral-400">Đến nơi:</span>
              <span class="font-mono text-primary-400">{{ formatDate(exp.arrivalTime) }}</span>
            </div>
            <div v-if="exp.status === 'EXPLORING'" class="flex items-center gap-2">
              <IconsThamHiem class="w-4 h-4 text-warning-400 animate-pulse" />
              <span class="text-neutral-400">Kết thúc:</span>
              <span class="font-mono text-warning-400">{{ formatDate(exp.explorationEndTime) }}</span>
            </div>
            <div v-if="exp.status === 'RETURNING'" class="flex items-center gap-2">
              <IconsQuayLai class="w-4 h-4 text-success-400 animate-pulse" />
              <span class="text-neutral-400">Quay về:</span>
              <span class="font-mono text-success-400">{{ formatDate(exp.returnTime) }}</span>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <span 
              v-for="ship in exp.ships" 
              :key="ship.type"
              class="text-xs bg-white/5 px-2 py-1 rounded flex items-center gap-1"
            >
              <IconsChienHam class="w-3 h-3 text-primary-400" />
              {{ SHIPS[ship.type as ShipType]?.name || ship.type }}: {{ ship.count }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- History Tab -->
    <div v-if="activeTab === 'history'" class="space-y-4">
      <div v-if="expeditions.recent.length === 0" class="neo-card p-12 text-center">
        <IconsThongTin class="w-16 h-16 mx-auto text-neutral-600 mb-4" />
        <p class="text-neutral-500">Chưa có lịch sử thám hiểm</p>
        <p class="text-neutral-600 text-sm mt-2">Lịch sử 24 giờ gần nhất sẽ hiển thị ở đây</p>
      </div>
      
      <div v-else class="space-y-3">
        <div 
          v-for="exp in expeditions.recent" 
          :key="exp._id"
          class="neo-card p-4"
        >
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
            <div class="flex items-center gap-3">
              <span class="font-mono text-neutral-400">
                [{{ exp.destination.galaxy }}:{{ exp.destination.system }}:16]
              </span>
              <span v-if="exp.result?.type" class="font-medium" :class="getResultColor(exp.result.type)">
                {{ getResultLabel(exp.result.type) }}
              </span>
            </div>
            <span class="text-xs text-neutral-500">{{ formatDate(exp.createdAt) }}</span>
          </div>
          
          <p v-if="exp.result?.description" class="text-sm text-neutral-400 mb-3">
            {{ exp.result.description }}
          </p>

          <!-- Resources found -->
          <div v-if="exp.result?.resources" class="flex flex-wrap gap-4 text-sm">
            <span v-if="exp.result.resources.tinhThach" class="flex items-center gap-1">
              <IconsTinhThach class="w-4 h-4" />
              <span class="text-neutral-300">+{{ formatNumber(exp.result.resources.tinhThach) }}</span>
            </span>
            <span v-if="exp.result.resources.nangLuongVuTru" class="flex items-center gap-1">
              <IconsNangLuong class="w-4 h-4 text-primary-400" />
              <span class="text-primary-300">+{{ formatNumber(exp.result.resources.nangLuongVuTru) }}</span>
            </span>
            <span v-if="exp.result.resources.honThach" class="flex items-center gap-1">
              <IconsHonThach class="w-4 h-4 text-success-400" />
              <span class="text-success-300">+{{ formatNumber(exp.result.resources.honThach) }}</span>
            </span>
          </div>

          <!-- Ships found/lost -->
          <div v-if="exp.result?.shipsFound?.length" class="mt-2 flex items-center gap-2">
            <span class="text-xs text-success-400">Tìm được:</span>
            <span v-for="ship in exp.result.shipsFound" :key="ship.type" class="text-xs text-success-300">
              {{ ship.count }}x {{ SHIPS[ship.type as ShipType]?.name || ship.type }}
            </span>
          </div>
          <div v-if="exp.result?.shipsLost?.length" class="mt-2 flex items-center gap-2">
            <span class="text-xs text-alert-400">Mất:</span>
            <span v-for="ship in exp.result.shipsLost" :key="ship.type" class="text-xs text-alert-300">
              {{ ship.count }}x {{ SHIPS[ship.type as ShipType]?.name || ship.type }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Tab -->
    <div v-if="activeTab === 'stats'" class="space-y-6">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="neo-card p-4 text-center">
          <p class="text-3xl font-mono font-bold text-primary-400">{{ stats.totalExpeditions }}</p>
          <p class="text-xs text-neutral-500 uppercase tracking-wider mt-1">Tổng thám hiểm</p>
        </div>
        <div class="neo-card p-4 text-center">
          <p class="text-3xl font-mono font-bold text-success-400">{{ stats.successRate }}%</p>
          <p class="text-xs text-neutral-500 uppercase tracking-wider mt-1">Tỷ lệ thành công</p>
        </div>
        <div class="neo-card p-4 text-center">
          <p class="text-3xl font-mono font-bold text-warning-400">{{ stats.shipsFound }}</p>
          <p class="text-xs text-neutral-500 uppercase tracking-wider mt-1">Tàu tìm được</p>
        </div>
        <div class="neo-card p-4 text-center">
          <p class="text-3xl font-mono font-bold text-alert-400">{{ stats.shipsLost }}</p>
          <p class="text-xs text-neutral-500 uppercase tracking-wider mt-1">Tàu mất</p>
        </div>
      </div>

      <UiCard title="Tài Nguyên Thu Được" subtitle="Tổng từ các chuyến thám hiểm gần đây">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="neo-card p-4 flex items-center gap-4">
            <div class="w-12 h-12 neo-card flex items-center justify-center">
              <IconsTinhThach class="w-6 h-6" />
            </div>
            <div>
              <p class="text-2xl font-mono font-bold">{{ formatNumber(stats.totalMetal) }}</p>
              <p class="text-xs text-neutral-500">Tinh Thạch</p>
            </div>
          </div>
          <div class="neo-card p-4 flex items-center gap-4">
            <div class="w-12 h-12 neo-card flex items-center justify-center border-primary-500/30">
              <IconsNangLuong class="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <p class="text-2xl font-mono font-bold text-primary-400">{{ formatNumber(stats.totalCrystal) }}</p>
              <p class="text-xs text-neutral-500">Năng Lượng Vũ Trụ</p>
            </div>
          </div>
          <div class="neo-card p-4 flex items-center gap-4">
            <div class="w-12 h-12 neo-card flex items-center justify-center border-success-500/30">
              <IconsHonThach class="w-6 h-6 text-success-400" />
            </div>
            <div>
              <p class="text-2xl font-mono font-bold text-success-400">{{ formatNumber(stats.totalDeuterium) }}</p>
              <p class="text-xs text-neutral-500">Hồn Thạch</p>
            </div>
          </div>
        </div>
      </UiCard>

      <div class="text-center text-sm text-neutral-500">
        <p>Thống kê dựa trên {{ stats.totalExpeditions }} chuyến thám hiểm trong 24 giờ qua</p>
      </div>
    </div>
  </div>
</template>
