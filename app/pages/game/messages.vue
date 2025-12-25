<script setup lang="ts">
import { format } from 'date-fns'

definePageMeta({
  layout: 'game',
})

const route = useRoute()

// Message types/tabs
const tabs = [
  { id: 'ALL', label: 'Tất Cả', icon: 'ThongTin' },
  { id: 'PLAYER', label: 'Người Chơi', icon: 'NguoiChoi' },
  { id: 'ESPIONAGE', label: 'Do Thám', icon: 'TauDoTham' },
  { id: 'COMBAT', label: 'Chiến Báo', icon: 'TanCong' },
  { id: 'ALLIANCE', label: 'Liên Minh', icon: 'ThienHa' },
  { id: 'SYSTEM', label: 'Hệ Thống', icon: 'CaiDat' },
]
const activeTab = ref('ALL')

const page = ref(1)
const limit = ref(20)
const selectedMessages = ref<string[]>([])
const isComposeOpen = ref(false)
const selectedMessage = ref<any>(null)

// Compose form
const composeForm = ref({
  recipientName: route.query.to as string || '',
  subject: '',
  content: '',
})

// Processing states
const isDeleting = ref(false)
const isMarking = ref(false)
const isSending = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

// Fetch messages
const { data: messagesData, refresh, pending } = await useFetch('/api/game/messages', {
  query: computed(() => ({
    page: page.value,
    limit: limit.value,
    type: activeTab.value,
  })),
})

const messages = computed(() => messagesData.value?.data || [])
const pagination = computed(() => messagesData.value?.pagination)
const unreadTotal = computed(() => messagesData.value?.unreadTotal || 0)

// Check if route has a recipient query
onMounted(() => {
  if (route.query.to) {
    isComposeOpen.value = true
  }
})

// Actions
const toggleSelection = (id: string) => {
  if (selectedMessages.value.includes(id)) {
    selectedMessages.value = selectedMessages.value.filter(m => m !== id)
  } else {
    selectedMessages.value.push(id)
  }
}

const toggleAll = () => {
  if (selectedMessages.value.length === messages.value.length) {
    selectedMessages.value = []
  } else {
    selectedMessages.value = messages.value.map((m: any) => m._id)
  }
}

const deleteSelected = async () => {
  if (selectedMessages.value.length === 0) return
  if (!confirm('Bạn có chắc muốn xóa các tin nhắn đã chọn?')) return

  isDeleting.value = true
  try {
    await $fetch('/api/game/messages/delete', {
      method: 'POST',
      body: { messageIds: selectedMessages.value },
    })
    success.value = `Đã xóa ${selectedMessages.value.length} tin nhắn`
    selectedMessages.value = []
    refresh()
    setTimeout(() => { success.value = null }, 3000)
  } catch (err: any) {
    error.value = err.data?.message || 'Lỗi khi xóa tin nhắn'
    setTimeout(() => { error.value = null }, 5000)
  } finally {
    isDeleting.value = false
  }
}

const markAsRead = async () => {
  if (selectedMessages.value.length === 0) return

  isMarking.value = true
  try {
    await $fetch('/api/game/messages/read', {
      method: 'POST',
      body: { messageIds: selectedMessages.value },
    })
    success.value = 'Đã đánh dấu đã đọc'
    selectedMessages.value = []
    refresh()
    setTimeout(() => { success.value = null }, 3000)
  } catch (err: any) {
    error.value = err.data?.message || 'Lỗi khi đánh dấu đã đọc'
    setTimeout(() => { error.value = null }, 5000)
  } finally {
    isMarking.value = false
  }
}

const sendMessage = async () => {
  if (!composeForm.value.recipientName || !composeForm.value.subject || !composeForm.value.content) {
    error.value = 'Vui lòng điền đầy đủ thông tin'
    setTimeout(() => { error.value = null }, 3000)
    return
  }

  isSending.value = true
  try {
    await $fetch('/api/game/messages/send', {
      method: 'POST',
      body: composeForm.value,
    })
    isComposeOpen.value = false
    composeForm.value = { recipientName: '', subject: '', content: '' }
    success.value = 'Đã gửi tin nhắn thành công!'
    if (activeTab.value === 'PLAYER' || activeTab.value === 'ALL') {
      refresh()
    }
    setTimeout(() => { success.value = null }, 3000)
  } catch (err: any) {
    error.value = err.data?.message || 'Lỗi khi gửi tin nhắn'
    setTimeout(() => { error.value = null }, 5000)
  } finally {
    isSending.value = false
  }
}

const openMessage = (message: any) => {
  selectedMessage.value = message
  // Mark as read if not read
  if (!message.isRead) {
    $fetch('/api/game/messages/read', {
      method: 'POST',
      body: { messageIds: [message._id] },
    }).then(() => refresh())
  }
}

const replyToMessage = (message: any) => {
  composeForm.value = {
    recipientName: message.sender?.username || '',
    subject: `RE: ${message.subject}`,
    content: '',
  }
  selectedMessage.value = null
  isComposeOpen.value = true
}

const formatDate = (dateStr: string) => format(new Date(dateStr), 'HH:mm dd/MM/yyyy')

const getTypeStyle = (type: string) => {
  const styles: Record<string, string> = {
    PLAYER: 'bg-blue-500/20 text-blue-400',
    ESPIONAGE: 'bg-yellow-500/20 text-yellow-400',
    COMBAT: 'bg-red-500/20 text-red-400',
    ALLIANCE: 'bg-green-500/20 text-green-400',
    SYSTEM: 'bg-gray-500/20 text-gray-400',
  }
  return styles[type] || 'bg-neutral-500/20 text-neutral-400'
}

const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    PLAYER: 'Người chơi',
    ESPIONAGE: 'Do thám',
    COMBAT: 'Chiến báo',
    ALLIANCE: 'Liên minh',
    SYSTEM: 'Hệ thống',
  }
  return labels[type] || type
}

// Watch tab change
watch(activeTab, () => {
  page.value = 1
  selectedMessages.value = []
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-display font-bold text-gradient-cyan">Tin Nhắn</h1>
        <p class="text-neutral-500 mt-1">Liên lạc và nhận báo cáo hoạt động</p>
      </div>
      <div class="flex items-center gap-3">
        <div v-if="unreadTotal > 0" class="neo-card px-4 py-2 flex items-center gap-2 border-primary-500/30">
          <IconsThongTin class="w-5 h-5 text-primary-400" />
          <span class="text-neutral-500">Chưa đọc:</span>
          <span class="font-mono text-primary-400 text-lg">{{ unreadTotal }}</span>
        </div>
        <button class="neo-btn" @click="isComposeOpen = true">
          <IconsNangCap class="w-4 h-4 mr-2" />
          Soạn Tin Nhắn
        </button>
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
      </button>
    </div>

    <!-- Toolbar -->
    <div class="neo-card p-3 flex flex-wrap items-center gap-3">
      <label class="flex items-center gap-2 cursor-pointer">
        <input 
          type="checkbox" 
          :checked="selectedMessages.length > 0 && selectedMessages.length === messages.length"
          class="rounded border-neutral-600 bg-neutral-800 text-primary-500 focus:ring-primary-500"
          @change="toggleAll"
        >
        <span class="text-sm text-neutral-400">Chọn tất cả</span>
      </label>
      
      <div class="h-4 w-px bg-white/10"></div>
      
      <button 
        class="neo-btn-ghost text-sm px-3 py-1.5 flex items-center gap-2 text-alert-400 hover:bg-alert-400/10"
        :disabled="selectedMessages.length === 0 || isDeleting"
        :class="{ 'opacity-50 cursor-not-allowed': selectedMessages.length === 0 }"
        @click="deleteSelected"
      >
        <svg v-if="isDeleting" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        <IconsDong v-else class="w-4 h-4" />
        Xóa
      </button>
      
      <button 
        class="neo-btn-ghost text-sm px-3 py-1.5 flex items-center gap-2"
        :disabled="selectedMessages.length === 0 || isMarking"
        :class="{ 'opacity-50 cursor-not-allowed': selectedMessages.length === 0 }"
        @click="markAsRead"
      >
        <svg v-if="isMarking" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        <IconsHoanThanh v-else class="w-4 h-4" />
        Đánh dấu đã đọc
      </button>
      
      <div class="ml-auto text-sm text-neutral-500">
        {{ selectedMessages.length > 0 ? `Đã chọn ${selectedMessages.length} tin` : '' }}
        Tổng: {{ pagination?.total || 0 }}
      </div>
    </div>

    <!-- Message List -->
    <UiCard :padding="false" class="overflow-hidden">
      <div v-if="messages.length === 0 && !pending" class="p-12 text-center">
        <IconsThongTin class="w-16 h-16 mx-auto text-neutral-600 mb-4" />
        <p class="text-neutral-500">Không có tin nhắn nào</p>
        <p class="text-neutral-600 text-sm mt-2">Các tin nhắn mới sẽ hiển thị ở đây</p>
      </div>
      
      <div v-else class="divide-y divide-white/5">
        <div 
          v-for="message in messages" 
          :key="message._id"
          class="p-4 hover:bg-white/5 transition-colors cursor-pointer group"
          :class="{'bg-primary-500/5': !message.isRead}"
          @click="openMessage(message)"
        >
          <div class="flex items-start gap-4">
            <input 
              type="checkbox" 
              :checked="selectedMessages.includes(message._id)"
              class="mt-1 rounded border-neutral-600 bg-neutral-800 text-primary-500 focus:ring-primary-500"
              @click.stop
              @change="toggleSelection(message._id)"
            >
            
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-4 mb-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <span 
                    class="text-xs font-bold px-2 py-0.5 rounded"
                    :class="getTypeStyle(message.type)"
                  >
                    {{ getTypeLabel(message.type) }}
                  </span>
                  <span class="text-sm font-medium text-primary-300">
                    {{ message.sender ? message.sender.username : 'Hệ thống' }}
                  </span>
                  <span v-if="!message.isRead" class="w-2 h-2 rounded-full bg-primary-500"></span>
                </div>
                <span class="text-xs text-neutral-500 flex-shrink-0">{{ formatDate(message.createdAt) }}</span>
              </div>
              
              <h3 class="text-sm font-bold mb-1 truncate" :class="message.isRead ? 'text-neutral-300' : 'text-white'">
                {{ message.subject }}
              </h3>
              
              <p class="text-sm text-neutral-500 truncate">{{ message.content }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="pending" class="p-8 text-center">
        <svg class="animate-spin w-8 h-8 mx-auto text-primary-400" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      </div>

      <!-- Pagination -->
      <div v-if="pagination && pagination.pages > 1" class="p-4 border-t border-white/10 flex items-center justify-between">
        <p class="text-sm text-neutral-500">
          Trang {{ page }} / {{ pagination.pages }}
        </p>
        <div class="flex gap-1">
          <button 
            class="neo-btn-ghost px-3 py-1.5"
            :disabled="page <= 1"
            :class="{ 'opacity-50 cursor-not-allowed': page <= 1 }"
            @click="page--"
          >
            <IconsQuayLai class="w-4 h-4" />
          </button>
          <button 
            class="neo-btn-ghost px-3 py-1.5"
            :disabled="page >= pagination.pages"
            :class="{ 'opacity-50 cursor-not-allowed': page >= pagination.pages }"
            @click="page++"
          >
            <IconsMuiTen class="w-4 h-4" />
          </button>
        </div>
      </div>
    </UiCard>

    <!-- Compose Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="isComposeOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div class="neo-card w-full max-w-lg shadow-2xl shadow-primary-500/10" @click.stop>
            <div class="p-4 border-b border-white/10 flex justify-between items-center">
              <h3 class="text-lg font-display font-bold text-white">Soạn Tin Nhắn</h3>
              <button class="text-neutral-400 hover:text-white" @click="isComposeOpen = false">
                <IconsDong class="w-5 h-5" />
              </button>
            </div>
            
            <div class="p-4 space-y-4">
              <div>
                <label class="neo-label">Người nhận</label>
                <div class="relative">
                  <input 
                    v-model="composeForm.recipientName"
                    type="text" 
                    class="neo-input pl-10"
                    placeholder="Tên người chơi"
                  >
                  <IconsNguoiChoi class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                </div>
              </div>
              
              <div>
                <label class="neo-label">Tiêu đề</label>
                <input 
                  v-model="composeForm.subject"
                  type="text" 
                  class="neo-input"
                  placeholder="Tiêu đề tin nhắn"
                >
              </div>
              
              <div>
                <label class="neo-label">Nội dung</label>
                <textarea 
                  v-model="composeForm.content"
                  rows="5"
                  class="neo-input resize-none"
                  placeholder="Nhập nội dung tin nhắn..."
                ></textarea>
              </div>
            </div>
            
            <div class="p-4 border-t border-white/10 flex justify-end gap-2">
              <button class="neo-btn-ghost" @click="isComposeOpen = false">Hủy</button>
              <button 
                class="neo-btn-success flex items-center gap-2"
                :disabled="isSending"
                @click="sendMessage"
              >
                <svg v-if="isSending" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <IconsVanChuyen v-else class="w-4 h-4" />
                Gửi
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Message Detail Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="selectedMessage" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" @click="selectedMessage = null">
          <div class="neo-card w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl shadow-primary-500/10" @click.stop>
            <div class="p-4 border-b border-white/10 flex justify-between items-start">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span 
                    class="text-xs font-bold px-2 py-0.5 rounded"
                    :class="getTypeStyle(selectedMessage.type)"
                  >
                    {{ getTypeLabel(selectedMessage.type) }}
                  </span>
                  <span class="text-xs text-neutral-500">{{ formatDate(selectedMessage.createdAt) }}</span>
                </div>
                <h3 class="text-lg font-display font-bold text-white">{{ selectedMessage.subject }}</h3>
                <p class="text-sm text-primary-400 mt-1">
                  Từ: {{ selectedMessage.sender?.username || 'Hệ thống' }}
                </p>
              </div>
              <button class="text-neutral-400 hover:text-white" @click="selectedMessage = null">
                <IconsDong class="w-5 h-5" />
              </button>
            </div>
            
            <div class="flex-1 p-4 overflow-y-auto">
              <div class="prose prose-invert prose-sm max-w-none" v-html="selectedMessage.content"></div>
            </div>
            
            <div v-if="selectedMessage.type === 'PLAYER'" class="p-4 border-t border-white/10 flex justify-end">
              <button class="neo-btn flex items-center gap-2" @click="replyToMessage(selectedMessage)">
                <IconsQuayLai class="w-4 h-4" />
                Trả lời
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
