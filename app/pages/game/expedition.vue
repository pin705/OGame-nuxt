<script setup lang="ts">
import { format } from 'date-fns'
import { SHIPS } from '~/config/gameConfig'
import { ShipType } from '~/types/game'
import { formatNumber } from '~/utils/gameFormulas'

definePageMeta({
  layout: 'game',
})

const { currentPlanet } = useGame()

// Fetch expeditions
const { data: expeditionData, refresh } = await useFetch('/api/game/expedition')

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
      success.value = 'Đã gửi hạm đội thám hiểm!'
      clearSelection()
      refresh()
      setTimeout(() => { success.value = null }, 3000)
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Lỗi khi gửi thám hiểm'
    setTimeout(() => { error.value = null }, 5000)
  } finally {
    isSending.value = false
  }
}

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
    TRAVELING: 'text-primary-400',
    EXPLORING: 'text-warning-400',
    RETURNING: 'text-success-400',
    COMPLETED: 'text-neutral-400',
    LOST: 'text-alert-400',
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

// Auto refresh every 30 seconds
let refreshInterval: NodeJS.Timeout | null = null
onMounted(() => {
  refreshInterval = setInterval(refresh, 30000)
})
onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-display font-bold text-gradient-cyan">Thám Hiểm</h1>
        <p class="text-neutral-500 mt-1">Khám phá vùng không gian sâu và tìm kiếm kho báu</p>
      </div>
      <div class="neo-card px-4 py-2">
        <span class="text-neutral-500">Thám hiểm: </span>
        <span class="font-mono text-primary-400">{{ expeditions.currentCount }}</span>
        <span class="text-neutral-500">/</span>
        <span class="font-mono">{{ expeditions.maxExpeditions }}</span>
      </div>
    </div>

    <!-- Messages -->
    <div v-if="error" class="neo-card p-4 border-l-2 border-alert-400 bg-alert-400/10">
      <p class="text-alert-400">{{ error }}</p>
    </div>
    <div v-if="success" class="neo-card p-4 border-l-2 border-success-400 bg-success-400/10">
      <p class="text-success-400">{{ success }}</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Send Expedition -->
      <UiCard title="Gửi Thám Hiểm" subtitle="Chọn tàu và tọa độ đích">
        <!-- Ship Selection -->
        <div class="space-y-3 mb-4">
          <div v-if="availableShips.length === 0" class="text-center py-4 text-neutral-500">
            Không có tàu nào trên hành tinh
          </div>
          <div 
            v-for="ship in availableShips" 
            :key="ship.type"
            class="flex items-center gap-4 p-3 neo-card"
          >
            <div class="w-10 h-10 neo-card flex items-center justify-center">
              <IconsChienHam class="w-6 h-6 text-primary-500" />
            </div>
            <div class="flex-1">
              <p class="font-medium text-sm">{{ SHIPS[ship.type]?.name || ship.type }}</p>
              <p class="text-xs text-neutral-500">Có sẵn: {{ ship.count }}</p>
            </div>
            <input
              v-model.number="selectedShips[ship.type]"
              type="number"
              min="0"
              :max="ship.count"
              class="neo-input w-20 text-center"
              placeholder="0"
            >
          </div>
        </div>

        <!-- Destination -->
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="neo-label">Thiên hà</label>
            <select v-model="destination.galaxy" class="neo-input">
              <option v-for="g in 9" :key="g" :value="g">{{ g }}</option>
            </select>
          </div>
          <div>
            <label class="neo-label">Hệ sao</label>
            <input v-model.number="destination.system" type="number" min="1" max="499" class="neo-input">
          </div>
        </div>

        <!-- Send Button -->
        <UiButton 
          variant="primary" 
          class="w-full"
          :disabled="!canSendExpedition || isSending"
          @click="sendExpedition"
        >
          {{ isSending ? 'Đang gửi...' : 'Gửi Thám Hiểm' }}
        </UiButton>
        
        <p v-if="expeditions.currentCount >= expeditions.maxExpeditions" class="text-warning-400 text-sm text-center mt-2">
          Đã đạt giới hạn thám hiểm. Nâng cấp Công Nghệ Siêu Không Gian để mở thêm.
        </p>
      </UiCard>

      <!-- Active Expeditions -->
      <UiCard title="Thám Hiểm Đang Hoạt Động" subtitle="Theo dõi các chuyến thám hiểm">
        <div v-if="expeditions.active.length === 0" class="text-center py-8 text-neutral-500">
          Không có thám hiểm nào đang hoạt động
        </div>
        
        <div class="space-y-3">
          <div 
            v-for="exp in expeditions.active" 
            :key="exp._id"
            class="neo-card p-4"
          >
            <div class="flex justify-between items-start mb-2">
              <div>
                <span class="font-mono text-sm text-primary-400">
                  [{{ exp.destination.galaxy }}:{{ exp.destination.system }}:16]
                </span>
                <span class="ml-2 text-sm" :class="getStatusColor(exp.status)">
                  {{ getStatusLabel(exp.status) }}
                </span>
              </div>
            </div>
            
            <div class="text-xs text-neutral-500 space-y-1">
              <div>Từ: {{ exp.originPlanet?.name }}</div>
              <div v-if="exp.status === 'TRAVELING'">
                Đến nơi: {{ formatDate(exp.arrivalTime) }}
              </div>
              <div v-if="exp.status === 'EXPLORING'">
                Kết thúc: {{ formatDate(exp.explorationEndTime) }}
              </div>
              <div v-if="exp.status === 'RETURNING'">
                Quay về: {{ formatDate(exp.returnTime) }}
              </div>
            </div>

            <div class="flex flex-wrap gap-1 mt-2">
              <span 
                v-for="ship in exp.ships" 
                :key="ship.type"
                class="text-xs bg-white/5 px-2 py-0.5 rounded"
              >
                {{ SHIPS[ship.type as ShipType]?.name || ship.type }}: {{ ship.count }}
              </span>
            </div>
          </div>
        </div>
      </UiCard>
    </div>

    <!-- Recent Expeditions -->
    <UiCard v-if="expeditions.recent.length > 0" title="Thám Hiểm Gần Đây" subtitle="Kết quả 24 giờ qua">
      <div class="space-y-3">
        <div 
          v-for="exp in expeditions.recent" 
          :key="exp._id"
          class="neo-card p-4"
        >
          <div class="flex justify-between items-start mb-2">
            <div>
              <span class="font-mono text-sm text-neutral-400">
                [{{ exp.destination.galaxy }}:{{ exp.destination.system }}:16]
              </span>
              <span v-if="exp.result?.type" class="ml-2 text-sm font-medium"
                    :class="exp.result.type === 'NOTHING' ? 'text-neutral-500' : 
                            exp.result.type.includes('ATTACK') || exp.result.type === 'BLACK_HOLE' ? 'text-alert-400' : 
                            'text-success-400'">
                {{ getResultLabel(exp.result.type) }}
              </span>
            </div>
            <span class="text-xs text-neutral-500">{{ formatDate(exp.createdAt) }}</span>
          </div>
          
          <p v-if="exp.result?.description" class="text-sm text-neutral-400">
            {{ exp.result.description }}
          </p>

          <!-- Resources found -->
          <div v-if="exp.result?.resources" class="flex gap-4 mt-2 text-sm">
            <span v-if="exp.result.resources.tinhThach" class="text-neutral-300">
              +{{ formatNumber(exp.result.resources.tinhThach) }} Tinh Thạch
            </span>
            <span v-if="exp.result.resources.nangLuongVuTru" class="text-primary-400">
              +{{ formatNumber(exp.result.resources.nangLuongVuTru) }} Năng Lượng VT
            </span>
            <span v-if="exp.result.resources.honThach" class="text-success-400">
              +{{ formatNumber(exp.result.resources.honThach) }} Hồn Thạch
            </span>
          </div>

          <!-- Ships found/lost -->
          <div v-if="exp.result?.shipsFound?.length" class="mt-2">
            <span class="text-xs text-success-400">Tìm được: </span>
            <span v-for="ship in exp.result.shipsFound" :key="ship.type" class="text-xs">
              {{ ship.count }}x {{ SHIPS[ship.type as ShipType]?.name || ship.type }}
            </span>
          </div>
          <div v-if="exp.result?.shipsLost?.length" class="mt-2">
            <span class="text-xs text-alert-400">Mất: </span>
            <span v-for="ship in exp.result.shipsLost" :key="ship.type" class="text-xs">
              {{ ship.count }}x {{ SHIPS[ship.type as ShipType]?.name || ship.type }}
            </span>
          </div>
        </div>
      </div>
    </UiCard>
  </div>
</template>
