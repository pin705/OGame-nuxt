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
      <div class="w-12 h-12 neo-card flex items-center justify-center border-primary-500/30">
        <IconsCaiDat class="w-6 h-6 text-primary-500" />
      </div>
      <div>
        <h1 class="text-2xl font-display font-bold text-gradient-cyan">Cài Đặt</h1>
        <p class="text-neutral-500 mt-1">Quản lý tài khoản và tùy chỉnh trải nghiệm game</p>
      </div>
    </div>

    <!-- Message -->
    <div v-if="message" 
         class="p-4 neo-card"
         :class="messageType === 'success' ? 'border-success-400/50 bg-success-400/10 text-success-400' : 'border-alert-400/50 bg-alert-400/10 text-alert-400'">
      {{ message }}
    </div>

    <!-- Profile Settings -->
    <div class="neo-card p-5">
      <div class="neo-section-header">
        <div>
          <h3 class="neo-section-title">Thông Tin Cá Nhân</h3>
          <p class="text-sm text-neutral-500 mt-1">Cập nhật thông tin tài khoản của bạn</p>
        </div>
      </div>
      <form @submit.prevent="saveProfile" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="neo-label">Tên Chiến Sĩ</label>
            <input 
              v-model="profileForm.username"
              type="text" 
              class="neo-input"
              placeholder="Tên chiến sĩ"
            />
          </div>
          <div>
            <label class="neo-label">Email</label>
            <input 
              v-model="profileForm.email"
              type="email" 
              class="neo-input"
              placeholder="email@example.com"
            />
          </div>
        </div>
        
        <div class="flex justify-end">
          <button 
            type="submit" 
            class="neo-btn"
            :disabled="isSaving"
          >
            <IconsTaiDang v-if="isSaving" class="w-4 h-4 animate-spin" />
            Lưu Thay Đổi
          </button>
        </div>
      </form>
    </div>

    <!-- Player Stats -->
    <div class="neo-card p-5">
      <div class="neo-section-header">
        <div>
          <h3 class="neo-section-title">Thống Kê Người Chơi</h3>
          <p class="text-sm text-neutral-500 mt-1">Thông tin và thành tích của bạn</p>
        </div>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="neo-card p-4 text-center">
          <div class="text-2xl font-display font-bold text-primary-500">{{ auth.player.value?.level || 1 }}</div>
          <div class="text-xs text-neutral-500 uppercase tracking-wider mt-1">Cấp độ</div>
        </div>
        <div class="neo-card p-4 text-center">
          <div class="text-2xl font-display font-bold text-success-400">{{ auth.player.value?.experience || 0 }}</div>
          <div class="text-xs text-neutral-500 uppercase tracking-wider mt-1">Kinh nghiệm</div>
        </div>
        <div class="neo-card p-4 text-center">
          <div class="text-2xl font-display font-bold text-warning-400">{{ auth.player.value?.planets?.length || 1 }}</div>
          <div class="text-xs text-neutral-500 uppercase tracking-wider mt-1">Hành tinh</div>
        </div>
        <div class="neo-card p-4 text-center">
          <div class="text-base font-display font-bold text-success-400">{{ auth.player.value?.rank || 'Chiến Binh Sơ Cấp' }}</div>
          <div class="text-xs text-neutral-500 uppercase tracking-wider mt-1">Cấp bậc</div>
        </div>
      </div>
    </div>

    <!-- Game Settings -->
    <div class="neo-card p-5">
      <div class="neo-section-header">
        <div>
          <h3 class="neo-section-title">Cài Đặt Game</h3>
          <p class="text-sm text-neutral-500 mt-1">Tùy chỉnh trải nghiệm chơi game</p>
        </div>
      </div>
      <div class="space-y-3">
        <div class="flex items-center justify-between p-3 neo-card">
          <div>
            <div class="font-medium">Âm thanh</div>
            <div class="text-sm text-neutral-500">Bật/tắt hiệu ứng âm thanh</div>
          </div>
          <button 
            @click="settings.soundEnabled = !settings.soundEnabled"
            class="w-12 h-6 rounded-full transition-colors relative"
            :class="settings.soundEnabled ? 'bg-primary-500/30 border border-primary-500/50' : 'bg-space-700 border border-white/10'"
          >
            <div 
              class="w-5 h-5 rounded-full shadow transform transition-transform absolute top-0.5"
              :class="settings.soundEnabled ? 'translate-x-6 bg-primary-500' : 'translate-x-0.5 bg-neutral-500'"
            />
          </button>
        </div>

        <div class="flex items-center justify-between p-3 neo-card">
          <div>
            <div class="font-medium">Nhạc nền</div>
            <div class="text-sm text-neutral-500">Bật/tắt nhạc nền</div>
          </div>
          <button 
            @click="settings.musicEnabled = !settings.musicEnabled"
            class="w-12 h-6 rounded-full transition-colors relative"
            :class="settings.musicEnabled ? 'bg-primary-500/30 border border-primary-500/50' : 'bg-space-700 border border-white/10'"
          >
            <div 
              class="w-5 h-5 rounded-full shadow transform transition-transform absolute top-0.5"
              :class="settings.musicEnabled ? 'translate-x-6 bg-primary-500' : 'translate-x-0.5 bg-neutral-500'"
            />
          </button>
        </div>

        <div class="flex items-center justify-between p-3 neo-card">
          <div>
            <div class="font-medium">Thông báo</div>
            <div class="text-sm text-neutral-500">Nhận thông báo khi có sự kiện quan trọng</div>
          </div>
          <button 
            @click="settings.notificationsEnabled = !settings.notificationsEnabled"
            class="w-12 h-6 rounded-full transition-colors relative"
            :class="settings.notificationsEnabled ? 'bg-primary-500/30 border border-primary-500/50' : 'bg-space-700 border border-white/10'"
          >
            <div 
              class="w-5 h-5 rounded-full shadow transform transition-transform absolute top-0.5"
              :class="settings.notificationsEnabled ? 'translate-x-6 bg-primary-500' : 'translate-x-0.5 bg-neutral-500'"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Change Password -->
    <div class="neo-card p-5">
      <div class="neo-section-header">
        <div>
          <h3 class="neo-section-title">Đổi Mật Khẩu</h3>
          <p class="text-sm text-neutral-500 mt-1">Cập nhật mật khẩu để bảo vệ tài khoản</p>
        </div>
      </div>
      <form @submit.prevent="changePassword" class="space-y-4">
        <div>
          <label class="neo-label">Mật khẩu hiện tại</label>
          <input 
            v-model="passwordForm.currentPassword"
            type="password" 
            class="neo-input"
            placeholder="••••••••"
          />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="neo-label">Mật khẩu mới</label>
            <input 
              v-model="passwordForm.newPassword"
              type="password" 
              class="neo-input"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label class="neo-label">Xác nhận mật khẩu mới</label>
            <input 
              v-model="passwordForm.confirmPassword"
              type="password" 
              class="neo-input"
              placeholder="••••••••"
            />
          </div>
        </div>
        
        <div class="flex justify-end">
          <button 
            type="submit" 
            class="neo-btn-success"
            :disabled="isSaving"
          >
            Đổi Mật Khẩu
          </button>
        </div>
      </form>
    </div>

    <!-- Danger Zone -->
    <div class="neo-card p-5">
      <div class="neo-section-header">
        <div>
          <h3 class="neo-section-title text-alert-400">Vùng Nguy Hiểm</h3>
          <p class="text-sm text-neutral-500 mt-1">Các hành động không thể hoàn tác</p>
        </div>
      </div>
      <div class="p-4 neo-card border-alert-400/30 bg-alert-400/5">
        <div class="flex items-center justify-between">
          <div>
            <div class="font-display font-semibold text-alert-400">Xóa Tài Khoản</div>
            <div class="text-sm text-neutral-500">Xóa vĩnh viễn tài khoản và tất cả dữ liệu</div>
          </div>
          <button 
            @click="deleteAccount"
            class="neo-btn-alert"
          >
            Xóa Tài Khoản
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
