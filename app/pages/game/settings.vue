<script setup lang="ts">
definePageMeta({
  layout: 'game',
})

const auth = useAuth()
const router = useRouter()

// User settings
const settings = reactive({
  soundEnabled: true,
  musicEnabled: true,
  notificationsEnabled: true,
  language: 'vi',
  theme: 'dark',
})

// Profile form
const profileForm = reactive({
  username: '',
  email: '',
})

// Password form
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const isSaving = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

onMounted(() => {
  if (auth.player.value) {
    profileForm.username = auth.player.value.username
    profileForm.email = auth.player.value.email
  }
})

const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
  message.value = msg
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

const saveProfile = async () => {
  isSaving.value = true
  try {
    // TODO: Implement profile update API
    showMessage('Cập nhật thông tin thành công!', 'success')
  } catch {
    showMessage('Có lỗi xảy ra, vui lòng thử lại.', 'error')
  } finally {
    isSaving.value = false
  }
}

const changePassword = async () => {
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    showMessage('Mật khẩu xác nhận không khớp!', 'error')
    return
  }
  if (passwordForm.newPassword.length < 6) {
    showMessage('Mật khẩu mới phải có ít nhất 6 ký tự!', 'error')
    return
  }
  
  isSaving.value = true
  try {
    // TODO: Implement password change API
    showMessage('Đổi mật khẩu thành công!', 'success')
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
  } catch {
    showMessage('Mật khẩu hiện tại không đúng.', 'error')
  } finally {
    isSaving.value = false
  }
}

const deleteAccount = async () => {
  const confirmed = window.confirm('Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác!')
  if (!confirmed) return
  
  try {
    // TODO: Implement account deletion API
    await auth.logout()
    router.push('/')
  } catch {
    showMessage('Có lỗi xảy ra, vui lòng thử lại.', 'error')
  }
}
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Page Header -->
    <div class="flex items-center gap-4">
      <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
        <IconsCaiDat class="w-7 h-7 text-white" />
      </div>
      <div>
        <h1 class="text-2xl font-display font-bold text-gradient">Cài Đặt</h1>
        <p class="text-slate-400">Quản lý tài khoản và tùy chỉnh trải nghiệm game</p>
      </div>
    </div>

    <!-- Message -->
    <div v-if="message" 
         class="p-4 rounded-lg"
         :class="messageType === 'success' ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'">
      {{ message }}
    </div>

    <!-- Profile Settings -->
    <UiCard title="Thông Tin Cá Nhân" subtitle="Cập nhật thông tin tài khoản của bạn">
      <form @submit.prevent="saveProfile" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Tên Chiến Sĩ</label>
            <input 
              v-model="profileForm.username"
              type="text" 
              class="w-full px-4 py-2 rounded-lg bg-space-800 border border-space-600 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition"
              placeholder="Tên chiến sĩ"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input 
              v-model="profileForm.email"
              type="email" 
              class="w-full px-4 py-2 rounded-lg bg-space-800 border border-space-600 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition"
              placeholder="email@example.com"
            />
          </div>
        </div>
        
        <div class="flex justify-end">
          <button 
            type="submit" 
            class="px-6 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-medium transition disabled:opacity-50"
            :disabled="isSaving"
          >
            <IconsTaiDang v-if="isSaving" class="w-4 h-4 animate-spin inline mr-2" />
            Lưu Thay Đổi
          </button>
        </div>
      </form>
    </UiCard>

    <!-- Player Stats -->
    <UiCard title="Thống Kê Người Chơi" subtitle="Thông tin và thành tích của bạn">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="glass-card p-4 text-center">
          <div class="text-2xl font-bold text-primary-400">{{ auth.player.value?.level || 1 }}</div>
          <div class="text-sm text-slate-400">Cấp độ</div>
        </div>
        <div class="glass-card p-4 text-center">
          <div class="text-2xl font-bold text-secondary-400">{{ auth.player.value?.experience || 0 }}</div>
          <div class="text-sm text-slate-400">Kinh nghiệm</div>
        </div>
        <div class="glass-card p-4 text-center">
          <div class="text-2xl font-bold text-accent-400">{{ auth.player.value?.planets?.length || 1 }}</div>
          <div class="text-sm text-slate-400">Hành tinh</div>
        </div>
        <div class="glass-card p-4 text-center">
          <div class="text-lg font-bold text-green-400">{{ auth.player.value?.rank || 'Chiến Binh Sơ Cấp' }}</div>
          <div class="text-sm text-slate-400">Cấp bậc</div>
        </div>
      </div>
    </UiCard>

    <!-- Game Settings -->
    <UiCard title="Cài Đặt Game" subtitle="Tùy chỉnh trải nghiệm chơi game">
      <div class="space-y-4">
        <div class="flex items-center justify-between p-3 rounded-lg bg-space-800">
          <div>
            <div class="font-medium">Âm thanh</div>
            <div class="text-sm text-slate-400">Bật/tắt hiệu ứng âm thanh</div>
          </div>
          <button 
            @click="settings.soundEnabled = !settings.soundEnabled"
            class="w-12 h-6 rounded-full transition-colors"
            :class="settings.soundEnabled ? 'bg-primary-600' : 'bg-space-600'"
          >
            <div 
              class="w-5 h-5 rounded-full bg-white shadow transform transition-transform mx-0.5"
              :class="settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'"
            />
          </button>
        </div>

        <div class="flex items-center justify-between p-3 rounded-lg bg-space-800">
          <div>
            <div class="font-medium">Nhạc nền</div>
            <div class="text-sm text-slate-400">Bật/tắt nhạc nền</div>
          </div>
          <button 
            @click="settings.musicEnabled = !settings.musicEnabled"
            class="w-12 h-6 rounded-full transition-colors"
            :class="settings.musicEnabled ? 'bg-primary-600' : 'bg-space-600'"
          >
            <div 
              class="w-5 h-5 rounded-full bg-white shadow transform transition-transform mx-0.5"
              :class="settings.musicEnabled ? 'translate-x-6' : 'translate-x-0'"
            />
          </button>
        </div>

        <div class="flex items-center justify-between p-3 rounded-lg bg-space-800">
          <div>
            <div class="font-medium">Thông báo</div>
            <div class="text-sm text-slate-400">Nhận thông báo khi có sự kiện quan trọng</div>
          </div>
          <button 
            @click="settings.notificationsEnabled = !settings.notificationsEnabled"
            class="w-12 h-6 rounded-full transition-colors"
            :class="settings.notificationsEnabled ? 'bg-primary-600' : 'bg-space-600'"
          >
            <div 
              class="w-5 h-5 rounded-full bg-white shadow transform transition-transform mx-0.5"
              :class="settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-0'"
            />
          </button>
        </div>
      </div>
    </UiCard>

    <!-- Change Password -->
    <UiCard title="Đổi Mật Khẩu" subtitle="Cập nhật mật khẩu để bảo vệ tài khoản">
      <form @submit.prevent="changePassword" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">Mật khẩu hiện tại</label>
          <input 
            v-model="passwordForm.currentPassword"
            type="password" 
            class="w-full px-4 py-2 rounded-lg bg-space-800 border border-space-600 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition"
            placeholder="••••••••"
          />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Mật khẩu mới</label>
            <input 
              v-model="passwordForm.newPassword"
              type="password" 
              class="w-full px-4 py-2 rounded-lg bg-space-800 border border-space-600 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-300 mb-2">Xác nhận mật khẩu mới</label>
            <input 
              v-model="passwordForm.confirmPassword"
              type="password" 
              class="w-full px-4 py-2 rounded-lg bg-space-800 border border-space-600 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition"
              placeholder="••••••••"
            />
          </div>
        </div>
        
        <div class="flex justify-end">
          <button 
            type="submit" 
            class="px-6 py-2 rounded-lg bg-secondary-600 hover:bg-secondary-500 text-white font-medium transition disabled:opacity-50"
            :disabled="isSaving"
          >
            Đổi Mật Khẩu
          </button>
        </div>
      </form>
    </UiCard>

    <!-- Danger Zone -->
    <UiCard title="Vùng Nguy Hiểm" subtitle="Các hành động không thể hoàn tác">
      <div class="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium text-red-400">Xóa Tài Khoản</div>
            <div class="text-sm text-slate-400">Xóa vĩnh viễn tài khoản và tất cả dữ liệu</div>
          </div>
          <button 
            @click="deleteAccount"
            class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium transition"
          >
            Xóa Tài Khoản
          </button>
        </div>
      </div>
    </UiCard>
  </div>
</template>
