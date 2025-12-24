<script setup lang="ts">
import { format } from 'date-fns'

definePageMeta({
  layout: 'game',
})

// Fetch buddies data
const { data: buddyData, refresh } = await useFetch('/api/game/buddies')

const buddies = computed(() => buddyData.value?.data?.buddies || [])
const pendingRequests = computed(() => buddyData.value?.data?.pendingRequests || [])
const sentRequests = computed(() => buddyData.value?.data?.sentRequests || [])

// Search & add buddy
const searchName = ref('')
const addMessage = ref('')
const isSending = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

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
      refresh()
      setTimeout(() => { success.value = null }, 3000)
    }
  } catch (err: any) {
    error.value = err.data?.message || 'Lỗi khi gửi lời mời'
    setTimeout(() => { error.value = null }, 5000)
  } finally {
    isSending.value = false
  }
}

const respondToRequest = async (requestId: string, action: 'ACCEPT' | 'REJECT') => {
  try {
    await $fetch('/api/game/buddies/respond', {
      method: 'POST',
      body: { requestId, action },
    })
    refresh()
  } catch (err: any) {
    error.value = err.data?.message || 'Lỗi khi xử lý lời mời'
    setTimeout(() => { error.value = null }, 5000)
  }
}

const formatDate = (dateStr: string) => format(new Date(dateStr), 'dd/MM/yyyy')

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
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-display font-bold text-gradient-cyan">Chiến Hữu</h1>
      <p class="text-neutral-500 mt-1">Kết bạn và cùng nhau chinh phục vũ trụ</p>
    </div>

    <!-- Messages -->
    <div v-if="error" class="neo-card p-4 border-l-2 border-alert-400 bg-alert-400/10">
      <p class="text-alert-400">{{ error }}</p>
    </div>
    <div v-if="success" class="neo-card p-4 border-l-2 border-success-400 bg-success-400/10">
      <p class="text-success-400">{{ success }}</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Add Buddy -->
      <UiCard title="Thêm Chiến Hữu" subtitle="Gửi lời mời kết bạn">
        <div class="space-y-4">
          <div>
            <label class="neo-label">Tên Người Chơi</label>
            <input 
              v-model="searchName"
              type="text"
              class="neo-input"
              placeholder="Nhập tên chiến sĩ..."
            >
          </div>
          <div>
            <label class="neo-label">Tin nhắn (tùy chọn)</label>
            <textarea 
              v-model="addMessage"
              class="neo-input"
              rows="2"
              placeholder="Lời nhắn gửi kèm lời mời..."
              maxlength="200"
            ></textarea>
          </div>
          <UiButton 
            variant="primary"
            class="w-full"
            :disabled="!searchName.trim() || isSending"
            @click="sendBuddyRequest"
          >
            {{ isSending ? 'Đang gửi...' : 'Gửi Lời Mời' }}
          </UiButton>
        </div>
      </UiCard>

      <!-- Pending Requests -->
      <UiCard title="Lời Mời Chờ Xử Lý" :subtitle="`${pendingRequests.length} lời mời`">
        <div v-if="pendingRequests.length === 0" class="text-center py-8 text-neutral-500">
          Không có lời mời nào
        </div>
        
        <div class="space-y-3">
          <div 
            v-for="req in pendingRequests" 
            :key="req._id"
            class="neo-card p-4"
          >
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="font-bold text-white">{{ req.from.username }}</p>
                <p class="text-xs text-neutral-500">
                  {{ getRankName(req.from.rank) }} • Cấp {{ req.from.level }}
                </p>
              </div>
              <span class="text-xs text-neutral-500">{{ formatDate(req.createdAt) }}</span>
            </div>
            
            <p v-if="req.message" class="text-sm text-neutral-400 mb-3 italic">
              "{{ req.message }}"
            </p>
            
            <div class="flex gap-2">
              <UiButton 
                size="sm" 
                variant="primary"
                @click="respondToRequest(req._id, 'ACCEPT')"
              >
                Chấp nhận
              </UiButton>
              <UiButton 
                size="sm" 
                variant="ghost"
                @click="respondToRequest(req._id, 'REJECT')"
              >
                Từ chối
              </UiButton>
            </div>
          </div>
        </div>
      </UiCard>
    </div>

    <!-- Buddy List -->
    <UiCard title="Danh Sách Chiến Hữu" :subtitle="`${buddies.length} chiến hữu`">
      <div v-if="buddies.length === 0" class="text-center py-12 text-neutral-500">
        <IconsNguoiChoi class="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p>Bạn chưa có chiến hữu nào</p>
        <p class="text-sm">Gửi lời mời để kết bạn với các chiến sĩ khác!</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          v-for="buddy in buddies" 
          :key="buddy._id"
          class="neo-card p-4 flex items-center gap-4"
        >
          <div class="w-12 h-12 neo-card flex items-center justify-center border-primary-500/30">
            <IconsNguoiChoi class="w-6 h-6 text-primary-500" />
          </div>
          <div class="flex-1">
            <p class="font-bold text-white">{{ buddy.friend.username }}</p>
            <p class="text-xs text-neutral-500">
              {{ getRankName(buddy.friend.rank) }} • Cấp {{ buddy.friend.level }}
            </p>
          </div>
          <div class="text-right text-xs text-neutral-500">
            Kết bạn: {{ formatDate(buddy.acceptedAt) }}
          </div>
        </div>
      </div>
    </UiCard>

    <!-- Sent Requests -->
    <UiCard v-if="sentRequests.length > 0" title="Lời Mời Đã Gửi" :subtitle="`${sentRequests.length} đang chờ`">
      <div class="space-y-2">
        <div 
          v-for="req in sentRequests" 
          :key="req._id"
          class="neo-card p-3 flex justify-between items-center"
        >
          <div>
            <span class="font-medium text-white">{{ req.to.username }}</span>
            <span class="text-xs text-neutral-500 ml-2">{{ formatDate(req.createdAt) }}</span>
          </div>
          <span class="text-xs text-warning-400">Đang chờ phản hồi</span>
        </div>
      </div>
    </UiCard>
  </div>
</template>
