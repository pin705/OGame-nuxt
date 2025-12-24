<script setup lang="ts">
import { ref, computed } from 'vue'
import { format } from 'date-fns'

definePageMeta({
  layout: 'game',
  middleware: 'auth',
})

const { data: allianceData, refresh } = await useFetch('/api/game/alliance/index')

const hasAlliance = computed(() => allianceData.value?.hasAlliance || false)
const alliance = computed(() => allianceData.value?.data)
const isOwner = computed(() => allianceData.value?.isOwner || false)

// Create Form
const createForm = ref({ name: '', tag: '' })
const isCreating = ref(false)

// Search
const searchQuery = ref('')
const searchResults = ref<any[]>([])
const isSearching = ref(false)

// Application
const applyMessage = ref('')
const selectedAllianceId = ref('')
const isApplyModalOpen = ref(false)

// Actions
const createAlliance = async () => {
  try {
    isCreating.value = true
    await $fetch('/api/game/alliance/create', {
      method: 'POST',
      body: createForm.value,
    })
    await refresh()
  } catch (error: any) {
    alert(error.data?.message || 'Lỗi khi tạo liên minh')
  } finally {
    isCreating.value = false
  }
}

const searchAlliance = async () => {
  try {
    isSearching.value = true
    const res: any = await $fetch('/api/game/alliance/list', {
      query: { search: searchQuery.value },
    })
    searchResults.value = res.data
  } catch (error) {
    console.error(error)
  } finally {
    isSearching.value = false
  }
}

const openApplyModal = (id: string) => {
  selectedAllianceId.value = id
  isApplyModalOpen.value = true
}

const sendApplication = async () => {
  try {
    await $fetch('/api/game/alliance/apply', {
      method: 'POST',
      body: {
        allianceId: selectedAllianceId.value,
        message: applyMessage.value,
      },
    })
    isApplyModalOpen.value = false
    alert('Đã gửi đơn xin gia nhập')
  } catch (error: any) {
    alert(error.data?.message || 'Lỗi khi gửi đơn')
  }
}

const handleApplication = async (appId: string, action: 'ACCEPT' | 'REJECT') => {
  try {
    await $fetch('/api/game/alliance/manage', {
      method: 'POST',
      body: { applicationId: appId, action },
    })
    await refresh()
  } catch (error: any) {
    alert(error.data?.message || 'Lỗi xử lý')
  }
}

const leaveAlliance = async () => {
  if (!confirm('Bạn có chắc muốn rời liên minh?')) return
  try {
    await $fetch('/api/game/alliance/leave', { method: 'POST' })
    await refresh()
  } catch (error: any) {
    alert(error.data?.message || 'Lỗi khi rời liên minh')
  }
}

const formatDate = (dateStr: string) => format(new Date(dateStr), 'dd/MM/yyyy')
</script>

<template>
  <div class="container mx-auto p-4 max-w-6xl">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-white font-display tracking-wider">
        HỆ THỐNG LIÊN MINH
      </h1>
      <p class="text-neutral-400 text-sm mt-1">
        Hợp tác cùng phát triển và chinh phục vũ trụ
      </p>
    </div>

    <!-- NO ALLIANCE VIEW -->
    <div v-if="!hasAlliance" class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Create Alliance -->
      <UiCard title="Thành lập Liên minh">
        <div class="space-y-4">
          <div>
            <label class="block text-xs uppercase text-neutral-500 mb-1">Tên Liên minh</label>
            <input 
              v-model="createForm.name"
              type="text" 
              class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
              placeholder="Ví dụ: Thôn Phệ Tinh Không"
            >
          </div>
          <div>
            <label class="block text-xs uppercase text-neutral-500 mb-1">Tag (Viết tắt)</label>
            <input 
              v-model="createForm.tag"
              type="text" 
              class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white focus:border-primary-500 focus:outline-none uppercase"
              placeholder="Ví dụ: TPTK"
              maxlength="8"
            >
          </div>
          <UiButton variant="primary" class="w-full" :disabled="isCreating" @click="createAlliance">
            {{ isCreating ? 'Đang tạo...' : 'Thành lập' }}
          </UiButton>
        </div>
      </UiCard>

      <!-- Find Alliance -->
      <UiCard title="Tìm kiếm Liên minh">
        <div class="flex gap-2 mb-4">
          <input 
            v-model="searchQuery"
            type="text" 
            class="flex-1 bg-black/30 border border-white/10 rounded px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
            placeholder="Nhập tên hoặc tag..."
            @keyup.enter="searchAlliance"
          >
          <UiButton variant="secondary" @click="searchAlliance">Tìm</UiButton>
        </div>

        <div class="space-y-2 max-h-[300px] overflow-y-auto">
          <div 
            v-for="item in searchResults" 
            :key="item._id"
            class="p-3 bg-white/5 rounded border border-white/5 flex justify-between items-center"
          >
            <div>
              <div class="font-bold text-white">[{{ item.tag }}] {{ item.name }}</div>
              <div class="text-xs text-neutral-500">{{ item.memberCount }} thành viên</div>
            </div>
            <UiButton size="sm" variant="secondary" @click="openApplyModal(item._id)">
              Xin vào
            </UiButton>
          </div>
          <div v-if="searchResults.length === 0 && !isSearching" class="text-center text-neutral-500 py-4">
            Nhập từ khóa để tìm kiếm
          </div>
        </div>
      </UiCard>
    </div>

    <!-- HAS ALLIANCE VIEW -->
    <div v-else class="space-y-6">
      <!-- Header -->
      <div class="bg-space-900/80 backdrop-blur border border-primary-500/30 p-6 rounded-lg relative overflow-hidden">
        <div class="absolute top-0 right-0 p-4 opacity-10">
          <IconsThienHa class="w-32 h-32" />
        </div>
        <div class="relative z-10">
          <div class="flex items-center gap-4 mb-2">
            <h2 class="text-3xl font-bold text-white">[{{ alliance.tag }}] {{ alliance.name }}</h2>
            <span class="px-2 py-1 bg-primary-500/20 text-primary-400 text-xs rounded border border-primary-500/30">
              {{ alliance.members.length }} thành viên
            </span>
          </div>
          <p class="text-neutral-400 max-w-2xl">{{ alliance.description || 'Chưa có mô tả' }}</p>
          
          <div class="mt-6 flex gap-3">
            <UiButton variant="danger" @click="leaveAlliance">
              {{ isOwner ? 'Giải tán Liên minh' : 'Rời Liên minh' }}
            </UiButton>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Members List -->
        <div class="lg:col-span-2">
          <UiCard title="Thành viên" :padding="false">
            <table class="w-full text-left text-sm">
              <thead class="bg-white/5 text-neutral-400 uppercase font-medium">
                <tr>
                  <th class="px-4 py-3">Tên</th>
                  <th class="px-4 py-3">Hạng</th>
                  <th class="px-4 py-3 text-right">Điểm</th>
                  <th class="px-4 py-3 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr v-for="member in alliance.members" :key="member._id" class="hover:bg-white/5">
                  <td class="px-4 py-3 font-medium text-white">
                    {{ member.username }}
                    <span v-if="member._id === alliance.owner" class="ml-2 text-xs text-yellow-500 border border-yellow-500/30 px-1 rounded">CHỦ MINH</span>
                  </td>
                  <td class="px-4 py-3 text-neutral-400">{{ member.rank }}</td>
                  <td class="px-4 py-3 text-right font-mono text-primary-300">{{ member.points }}</td>
                  <td class="px-4 py-3 text-center">
                    <span class="w-2 h-2 rounded-full inline-block" :class="member.isOnline ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-neutral-600'"></span>
                  </td>
                </tr>
              </tbody>
            </table>
          </UiCard>
        </div>

        <!-- Admin Panel (Owner Only) -->
        <div v-if="isOwner">
          <UiCard title="Quản lý đơn xin gia nhập">
            <div v-if="alliance.applications.length === 0" class="text-neutral-500 text-center py-4">
              Không có đơn xin gia nhập nào
            </div>
            <div v-else class="space-y-4">
              <div 
                v-for="app in alliance.applications" 
                :key="app._id"
                class="bg-white/5 p-3 rounded border border-white/10"
              >
                <div class="flex justify-between items-start mb-2">
                  <span class="font-bold text-white">{{ app.player.username }}</span>
                  <span class="text-xs text-neutral-500">{{ formatDate(app.createdAt) }}</span>
                </div>
                <p class="text-sm text-neutral-400 mb-3 italic">"{{ app.message }}"</p>
                <div class="flex gap-2">
                  <button 
                    class="flex-1 py-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded text-xs font-medium"
                    @click="handleApplication(app._id, 'ACCEPT')"
                  >
                    Chấp nhận
                  </button>
                  <button 
                    class="flex-1 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded text-xs font-medium"
                    @click="handleApplication(app._id, 'REJECT')"
                  >
                    Từ chối
                  </button>
                </div>
              </div>
            </div>
          </UiCard>
        </div>
      </div>
    </div>

    <!-- Apply Modal -->
    <div v-if="isApplyModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div class="bg-space-900 border border-primary-500/30 rounded-lg w-full max-w-md">
        <div class="p-4 border-b border-white/10">
          <h3 class="text-lg font-bold text-white">Xin gia nhập Liên minh</h3>
        </div>
        <div class="p-4">
          <label class="block text-xs uppercase text-neutral-500 mb-1">Lời nhắn</label>
          <textarea 
            v-model="applyMessage"
            rows="4"
            class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white focus:border-primary-500 focus:outline-none resize-none"
            placeholder="Xin chào, cho mình vào bang với..."
          ></textarea>
        </div>
        <div class="p-4 border-t border-white/10 flex justify-end gap-2">
          <UiButton variant="secondary" @click="isApplyModalOpen = false">Hủy</UiButton>
          <UiButton variant="primary" @click="sendApplication">Gửi đơn</UiButton>
        </div>
      </div>
    </div>
  </div>
</template>
