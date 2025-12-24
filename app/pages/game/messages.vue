<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { format } from 'date-fns'

definePageMeta({
  layout: 'game',
  middleware: 'auth',
})

const tabs = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'PLAYER', label: 'Người chơi' },
  { id: 'ESPIONAGE', label: 'Do thám' },
  { id: 'COMBAT', label: 'Chiến báo' },
  { id: 'SYSTEM', label: 'Hệ thống' },
  { id: 'ALLIANCE', label: 'Liên minh' },
]

const activeTab = ref('ALL')
const page = ref(1)
const limit = ref(20)
const selectedMessages = ref<string[]>([])
const isComposeOpen = ref(false)

// Compose form
const composeForm = ref({
  recipientName: '',
  subject: '',
  content: '',
})

// Fetch messages
const { data: messagesData, refresh } = await useFetch('/api/game/messages', {
  query: computed(() => ({
    page: page.value,
    limit: limit.value,
    type: activeTab.value,
  })),
})

const messages = computed(() => messagesData.value?.data || [])
const pagination = computed(() => messagesData.value?.pagination)
const unreadTotal = computed(() => messagesData.value?.unreadTotal || 0)

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

  try {
    await $fetch('/api/game/messages/delete', {
      method: 'POST',
      body: { messageIds: selectedMessages.value },
    })
    selectedMessages.value = []
    refresh()
  } catch (error) {
    alert('Lỗi khi xóa tin nhắn')
  }
}

const markAsRead = async () => {
  if (selectedMessages.value.length === 0) return

  try {
    await $fetch('/api/game/messages/read', {
      method: 'POST',
      body: { messageIds: selectedMessages.value },
    })
    selectedMessages.value = []
    refresh()
  } catch (error) {
    alert('Lỗi khi đánh dấu đã đọc')
  }
}

const sendMessage = async () => {
  try {
    await $fetch('/api/game/messages/send', {
      method: 'POST',
      body: composeForm.value,
    })
    isComposeOpen.value = false
    composeForm.value = { recipientName: '', subject: '', content: '' }
    alert('Đã gửi tin nhắn')
    if (activeTab.value === 'PLAYER' || activeTab.value === 'ALL') {
      refresh()
    }
  } catch (error: any) {
    alert(error.data?.message || 'Lỗi khi gửi tin nhắn')
  }
}

const formatDate = (dateStr: string) => {
  return format(new Date(dateStr), 'dd/MM/yyyy HH:mm')
}

// Watch tab change to reset selection
watch(activeTab, () => {
  page.value = 1
  selectedMessages.value = []
})
</script>

<template>
  <div class="container mx-auto p-4 max-w-6xl">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-white font-display tracking-wider">
          HỆ THỐNG TIN NHẮN
        </h1>
        <p class="text-neutral-400 text-sm mt-1">
          Liên lạc và báo cáo hoạt động
        </p>
      </div>
      <UiButton variant="primary" @click="isComposeOpen = true">
        Soạn tin nhắn
      </UiButton>
    </div>

    <!-- Tabs -->
    <div class="flex gap-2 mb-4 overflow-x-auto pb-2">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="px-4 py-2 rounded-sm text-sm font-medium transition-colors whitespace-nowrap"
        :class="activeTab === tab.id ? 'bg-primary-600 text-white' : 'bg-white/5 text-neutral-400 hover:bg-white/10'"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Toolbar -->
    <div class="bg-white/5 p-3 rounded-t-sm flex items-center gap-3 border-b border-white/10">
      <input 
        type="checkbox" 
        :checked="selectedMessages.length > 0 && selectedMessages.length === messages.length"
        @change="toggleAll"
        class="rounded border-neutral-600 bg-neutral-800 text-primary-500 focus:ring-primary-500"
      >
      <div class="flex gap-2">
        <button 
          class="px-3 py-1 text-xs font-medium rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-50"
          :disabled="selectedMessages.length === 0"
          @click="deleteSelected"
        >
          Xóa
        </button>
        <button 
          class="px-3 py-1 text-xs font-medium rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 disabled:opacity-50"
          :disabled="selectedMessages.length === 0"
          @click="markAsRead"
        >
          Đánh dấu đã đọc
        </button>
      </div>
      <div class="ml-auto text-xs text-neutral-500">
        Tổng: {{ pagination?.total || 0 }} | Chưa đọc: {{ unreadTotal }}
      </div>
    </div>

    <!-- Message List -->
    <div class="bg-space-900/50 backdrop-blur-sm border border-white/10 rounded-b-sm min-h-[400px]">
      <div v-if="messages.length === 0" class="p-8 text-center text-neutral-500">
        Không có tin nhắn nào
      </div>
      
      <div v-else class="divide-y divide-white/5">
        <div 
          v-for="message in messages" 
          :key="message._id"
          class="p-4 hover:bg-white/5 transition-colors group"
          :class="{'bg-primary-500/5': !message.isRead}"
        >
          <div class="flex items-start gap-4">
            <input 
              type="checkbox" 
              :checked="selectedMessages.includes(message._id)"
              @change="toggleSelection(message._id)"
              class="mt-1 rounded border-neutral-600 bg-neutral-800 text-primary-500 focus:ring-primary-500"
            >
            
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-2">
                  <span 
                    class="text-xs font-bold px-1.5 py-0.5 rounded"
                    :class="{
                      'bg-blue-500/20 text-blue-400': message.type === 'PLAYER',
                      'bg-yellow-500/20 text-yellow-400': message.type === 'ESPIONAGE',
                      'bg-red-500/20 text-red-400': message.type === 'COMBAT',
                      'bg-green-500/20 text-green-400': message.type === 'ALLIANCE',
                      'bg-gray-500/20 text-gray-400': message.type === 'SYSTEM',
                    }"
                  >
                    {{ message.type }}
                  </span>
                  <span class="text-sm font-medium text-primary-300">
                    {{ message.sender ? message.sender.username : 'Hệ thống' }}
                  </span>
                </div>
                <span class="text-xs text-neutral-500">{{ formatDate(message.createdAt) }}</span>
              </div>
              
              <h3 class="text-sm font-bold text-white mb-1" :class="{'text-primary-200': !message.isRead}">
                {{ message.subject }}
              </h3>
              
              <div class="text-sm text-neutral-400 whitespace-pre-wrap break-words" v-html="message.content"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination && pagination.pages > 1" class="mt-4 flex justify-center gap-2">
      <button 
        v-for="p in pagination.pages" 
        :key="p"
        class="w-8 h-8 rounded flex items-center justify-center text-sm font-medium transition-colors"
        :class="page === p ? 'bg-primary-600 text-white' : 'bg-white/5 text-neutral-400 hover:bg-white/10'"
        @click="page = p"
      >
        {{ p }}
      </button>
    </div>

    <!-- Compose Modal -->
    <div v-if="isComposeOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div class="bg-space-900 border border-primary-500/30 rounded-lg w-full max-w-lg shadow-2xl shadow-primary-500/10">
        <div class="p-4 border-b border-white/10 flex justify-between items-center">
          <h3 class="text-lg font-bold text-white">Soạn tin nhắn</h3>
          <button @click="isComposeOpen = false" class="text-neutral-400 hover:text-white">
            <IconsDong class="w-5 h-5" />
          </button>
        </div>
        
        <div class="p-4 space-y-4">
          <div>
            <label class="block text-xs uppercase text-neutral-500 mb-1">Người nhận</label>
            <input 
              v-model="composeForm.recipientName"
              type="text" 
              class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
              placeholder="Tên người chơi"
            >
          </div>
          
          <div>
            <label class="block text-xs uppercase text-neutral-500 mb-1">Tiêu đề</label>
            <input 
              v-model="composeForm.subject"
              type="text" 
              class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
              placeholder="Tiêu đề tin nhắn"
            >
          </div>
          
          <div>
            <label class="block text-xs uppercase text-neutral-500 mb-1">Nội dung</label>
            <textarea 
              v-model="composeForm.content"
              rows="5"
              class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white focus:border-primary-500 focus:outline-none resize-none"
              placeholder="Nhập nội dung..."
            ></textarea>
          </div>
        </div>
        
        <div class="p-4 border-t border-white/10 flex justify-end gap-2">
          <UiButton variant="secondary" @click="isComposeOpen = false">Hủy</UiButton>
          <UiButton variant="primary" @click="sendMessage">Gửi tin nhắn</UiButton>
        </div>
      </div>
    </div>
  </div>
</template>
