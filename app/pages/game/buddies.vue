<script setup lang="ts">
import { format } from 'date-fns'

definePageMeta({
  layout: 'game',
  middleware: 'auth',
})

// Tabs
const tabs = [
  { id: 'list', label: 'Danh Sách', icon: 'NguoiChoi' },
  { id: 'add', label: 'Thêm Bạn', icon: 'NangCap' },
  { id: 'pending', label: 'Lời Mời', icon: 'ThoiGian' },
  { id: 'sent', label: 'Đã Gửi', icon: 'VanChuyen' },
]
const activeTab = ref('list')

// Fetch buddies data
const { data: buddyData, refresh, pending } = await useFetch('/api/game/buddies')

const buddies = computed(() => buddyData.value?.data?.buddies || [])
const pendingRequests = computed(() => buddyData.value?.data?.pendingRequests || [])
const sentRequests = computed(() => buddyData.value?.data?.sentRequests || [])

// Search & add buddy
const searchName = ref('')
const addMessage = ref('')
const isSending = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

// Action states
const processingIds = ref<Set<string>>(new Set())

const sendBuddyRequest = async () => {
  if (!searchName.value.trim()) return
  
  error.value = null
  success.value = null
  isSending.value = true
  
  try {
    const result = await $fetch('/api/game/buddies/request', {
      method: 'POST',
      body: {
        recipientName: searchName.value.trim(),
        message: addMessage.value.trim(),
      },
    }) as { success: boolean; message?: string }
    
    if (result.success) {
      success.value = 'Đã gửi lời mời chiến hữu!'
      searchName.value = ''
      addMessage.value = ''
      activeTab.value = 'sent'
      refresh()
      setTimeout(() => { success.value = null }, 5000)
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Lỗi khi gửi lời mời'
    setTimeout(() => { error.value = null }, 5000)
  } finally {
    isSending.value = false
  }
}

const respondToRequest = async (requestId: string, action: 'ACCEPT' | 'REJECT') => {
  processingIds.value.add(requestId)
  try {
    await $fetch('/api/game/buddies/respond', {
      method: 'POST',
      body: { requestId, action },
    })
    success.value = action === 'ACCEPT' ? 'Đã chấp nhận lời mời!' : 'Đã từ chối lời mời'
    refresh()
    setTimeout(() => { success.value = null }, 3000)
  } catch (err: any) {
    error.value = err.data?.message || 'Lỗi khi xử lý lời mời'
    setTimeout(() => { error.value = null }, 5000)
  } finally {
    processingIds.value.delete(requestId)
  }
}

const removeBuddy = async (buddyId: string) => {
  if (!confirm('Bạn có chắc muốn xóa chiến hữu này?')) return
  
  processingIds.value.add(buddyId)
  try {
    await $fetch('/api/game/buddies/remove', {
      method: 'POST',
      body: { buddyId },
    })
    success.value = 'Đã xóa chiến hữu'
    refresh()
    setTimeout(() => { success.value = null }, 3000)
  } catch (err: any) {
    error.value = err.data?.message || 'Lỗi khi xóa chiến hữu'
    setTimeout(() => { error.value = null }, 5000)
  } finally {
    processingIds.value.delete(buddyId)
  }
}

const cancelRequest = async (requestId: string) => {
  processingIds.value.add(requestId)
  try {
    await $fetch('/api/game/buddies/cancel', {
      method: 'POST',
      body: { requestId },
    })
    success.value = 'Đã hủy lời mời'
    refresh()
    setTimeout(() => { success.value = null }, 3000)
  } catch (err: any) {
    error.value = err.data?.message || 'Lỗi khi hủy lời mời'
    setTimeout(() => { error.value = null }, 5000)
  } finally {
    processingIds.value.delete(requestId)
  }
}

const formatDate = (dateStr: string) => format(new Date(dateStr), 'dd/MM/yyyy')
const formatDateTime = (dateStr: string) => format(new Date(dateStr), 'HH:mm dd/MM/yyyy')

const getRankName = (rank: string) => {
  const names: Record<string, string> = {
    CHIEN_BINH_SO_CAP: 'Chiến Binh Sơ Cấp',
    CHIEN_TUONG: 'Chiến Tướng',
    DAI_TUONG: 'Đại Tướng',
    NGUYEN_SOAI: 'Nguyên Soái',
    DAI_DE: 'Đại Đế',
    VU_TRU_CAP: 'Vũ Trụ Cấp',
  }
  return names[rank] || rank
}

const getRankColor = (rank: string) => {
  const colors: Record<string, string> = {
    CHIEN_BINH_SO_CAP: 'text-neutral-400',
    CHIEN_TUONG: 'text-green-400',
    DAI_TUONG: 'text-blue-400',
    NGUYEN_SOAI: 'text-purple-400',
    DAI_DE: 'text-yellow-400',
    VU_TRU_CAP: 'text-red-400',
  }
  return colors[rank] || 'text-neutral-400'
}

// Send message to buddy
const sendMessageTo = (username: string) => {
  navigateTo({ path: '/game/messages', query: { to: username } })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-display font-bold text-gradient-cyan">Chiến Hữu</h1>
        <p class="text-neutral-500 mt-1">Kết bạn và cùng nhau chinh phục vũ trụ</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="neo-card px-4 py-2 flex items-center gap-2">
          <IconsNguoiChoi class="w-5 h-5 text-primary-400" />
          <span class="text-neutral-500">Chiến hữu:</span>
          <span class="font-mono text-primary-400 text-lg">{{ buddies.length }}</span>
        </div>
        <button @click="refresh()" class="neo-btn-ghost p-2.5" :class="{ 'animate-spin': pending }">
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
        <span v-if="tab.id === 'pending' && pendingRequests.length > 0" 
              class="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-warning-500/20 text-warning-400">
          {{ pendingRequests.length }}
        </span>
        <span v-if="tab.id === 'sent' && sentRequests.length > 0" 
              class="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary-500/20 text-primary-400">
          {{ sentRequests.length }}
        </span>
      </button>
    </div>

    <!-- Buddy List Tab -->
    <div v-if="activeTab === 'list'" class="space-y-4">
      <div v-if="buddies.length === 0" class="neo-card p-12 text-center">
        <IconsNguoiChoi class="w-16 h-16 mx-auto text-neutral-600 mb-4" />
        <p class="text-neutral-500 text-lg">Bạn chưa có chiến hữu nào</p>
        <p class="text-neutral-600 text-sm mt-2">Gửi lời mời để kết bạn với các chiến sĩ khác!</p>
        <button class="neo-btn mt-4" @click="activeTab = 'add'">
          <IconsNangCap class="w-4 h-4 mr-2" />
          Thêm Chiến Hữu
        </button>
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div 
          v-for="buddy in buddies" 
          :key="buddy._id"
          class="neo-card neo-card-hover p-4"
        >
          <div class="flex items-start gap-4">
            <div class="w-14 h-14 neo-card flex items-center justify-center border-primary-500/30 flex-shrink-0">
              <IconsNguoiChoi class="w-7 h-7 text-primary-500" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <p class="font-display font-bold text-white truncate">{{ buddy.friend.username }}</p>
                <!-- Online status -->
                <span v-if="buddy.friend.isOnline" class="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]"></span>
                <span v-else class="w-2 h-2 rounded-full bg-neutral-600"></span>
              </div>
              <p class="text-sm" :class="getRankColor(buddy.friend.rank)">
                {{ getRankName(buddy.friend.rank) }}
              </p>
              <p class="text-xs text-neutral-500 mt-1">
                Cấp {{ buddy.friend.level }} • Kết bạn: {{ formatDate(buddy.acceptedAt) }}
              </p>
            </div>
          </div>
          
          <div class="flex gap-2 mt-4">
            <button 
              class="flex-1 neo-btn-ghost text-sm flex items-center justify-center gap-1"
              @click="sendMessageTo(buddy.friend.username)"
            >
              <IconsThongTin class="w-4 h-4" />
              Nhắn tin
            </button>
            <button 
              class="neo-btn-ghost text-sm px-3 text-alert-400 hover:bg-alert-400/10"
              :disabled="processingIds.has(buddy._id)"
              @click="removeBuddy(buddy._id)"
            >
              <svg v-if="processingIds.has(buddy._id)" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <IconsDong v-else class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Buddy Tab -->
    <div v-if="activeTab === 'add'" class="max-w-lg mx-auto">
      <UiCard title="Thêm Chiến Hữu" subtitle="Gửi lời mời kết bạn đến người chơi khác">
        <div class="space-y-4">
          <div>
            <label class="neo-label">Tên Người Chơi</label>
            <div class="relative">
              <input 
                v-model="searchName"
                type="text"
                class="neo-input pl-10"
                placeholder="Nhập tên chính xác của người chơi..."
              >
              <IconsNguoiChoi class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            </div>
          </div>
          <div>
            <label class="neo-label">Tin nhắn (tùy chọn)</label>
            <textarea 
              v-model="addMessage"
              class="neo-input resize-none"
              rows="3"
              placeholder="Lời nhắn gửi kèm lời mời..."
              maxlength="200"
            ></textarea>
            <p class="text-xs text-neutral-500 text-right mt-1">{{ addMessage.length }}/200</p>
          </div>
          <button 
            class="w-full neo-btn-success flex items-center justify-center gap-2"
            :class="{ 'opacity-50 cursor-not-allowed': !searchName.trim() || isSending }"
            :disabled="!searchName.trim() || isSending"
            @click="sendBuddyRequest"
          >
            <svg v-if="isSending" class="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <IconsNangCap v-else class="w-5 h-5" />
            {{ isSending ? 'Đang gửi...' : 'Gửi Lời Mời' }}
          </button>
        </div>
      </UiCard>
    </div>

    <!-- Pending Requests Tab -->
    <div v-if="activeTab === 'pending'" class="space-y-4">
      <div v-if="pendingRequests.length === 0" class="neo-card p-12 text-center">
        <IconsThoiGian class="w-16 h-16 mx-auto text-neutral-600 mb-4" />
        <p class="text-neutral-500">Không có lời mời nào đang chờ xử lý</p>
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          v-for="req in pendingRequests" 
          :key="req._id"
          class="neo-card p-4"
        >
          <div class="flex items-start gap-4 mb-3">
            <div class="w-12 h-12 neo-card flex items-center justify-center border-warning-500/30 flex-shrink-0">
              <IconsNguoiChoi class="w-6 h-6 text-warning-500" />
            </div>
            <div class="flex-1">
              <p class="font-display font-bold text-white">{{ req.from.username }}</p>
              <p class="text-sm" :class="getRankColor(req.from.rank)">
                {{ getRankName(req.from.rank) }} • Cấp {{ req.from.level }}
              </p>
              <p class="text-xs text-neutral-500 mt-1">{{ formatDateTime(req.createdAt) }}</p>
            </div>
          </div>
          
          <p v-if="req.message" class="text-sm text-neutral-400 mb-4 p-3 bg-white/5 rounded italic">
            "{{ req.message }}"
          </p>
          
          <div class="flex gap-2">
            <button 
              class="flex-1 neo-btn-success text-sm flex items-center justify-center gap-2"
              :disabled="processingIds.has(req._id)"
              @click="respondToRequest(req._id, 'ACCEPT')"
            >
              <svg v-if="processingIds.has(req._id)" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <IconsHoanThanh v-else class="w-4 h-4" />
              Chấp nhận
            </button>
            <button 
              class="flex-1 neo-btn-ghost text-sm flex items-center justify-center gap-2"
              :disabled="processingIds.has(req._id)"
              @click="respondToRequest(req._id, 'REJECT')"
            >
              <IconsDong class="w-4 h-4" />
              Từ chối
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Sent Requests Tab -->
    <div v-if="activeTab === 'sent'" class="space-y-4">
      <div v-if="sentRequests.length === 0" class="neo-card p-12 text-center">
        <IconsVanChuyen class="w-16 h-16 mx-auto text-neutral-600 mb-4" />
        <p class="text-neutral-500">Không có lời mời nào đã gửi</p>
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          v-for="req in sentRequests" 
          :key="req._id"
          class="neo-card p-4"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 neo-card flex items-center justify-center border-primary-500/30">
                <IconsNguoiChoi class="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <p class="font-display font-semibold text-white">{{ req.to.username }}</p>
                <p class="text-xs text-neutral-500">{{ formatDateTime(req.createdAt) }}</p>
              </div>
            </div>
            <span class="text-xs text-warning-400 bg-warning-400/10 px-2 py-1 rounded">
              Đang chờ
            </span>
          </div>
          
          <p v-if="req.message" class="text-sm text-neutral-400 mb-3 p-2 bg-white/5 rounded italic truncate">
            "{{ req.message }}"
          </p>
          
          <button 
            class="w-full neo-btn-ghost text-sm text-alert-400 hover:bg-alert-400/10 flex items-center justify-center gap-2"
            :disabled="processingIds.has(req._id)"
            @click="cancelRequest(req._id)"
          >
            <svg v-if="processingIds.has(req._id)" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <IconsDong v-else class="w-4 h-4" />
            Hủy lời mời
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
