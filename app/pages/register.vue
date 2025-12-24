<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const auth = useAuth()
const router = useRouter()

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const isLoading = ref(false)
const error = ref('')

// Redirect if already logged in
onMounted(async () => {
  await auth.init()
  if (auth.isAuthenticated.value) {
    router.push('/game/overview')
  }
})

const handleRegister = async () => {
  if (form.password !== form.confirmPassword) {
    error.value = 'Mật khẩu xác nhận không khớp!'
    return
  }

  if (form.password.length < 6) {
    error.value = 'Mật khẩu phải có ít nhất 6 ký tự!'
    return
  }

  if (form.username.length < 3 || form.username.length > 20) {
    error.value = 'Tên chiến sĩ phải từ 3-20 ký tự!'
    return
  }

  isLoading.value = true
  error.value = ''
  
  try {
    await auth.register(form.username, form.email, form.password)
    await router.push('/game/overview')
  } catch (e: any) {
    error.value = e.message || 'Đăng ký thất bại. Vui lòng thử lại.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-12 bg-grid">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-block group">
          <div class="w-16 h-16 neo-card border-success-400/50 flex items-center justify-center mx-auto mb-4 group-hover:glow-green transition-all">
            <IconsTenLua class="w-8 h-8 text-success-400" />
          </div>
        </NuxtLink>
        <h1 class="text-2xl font-display font-bold text-gradient-cyan">Tạo Tài Khoản Mới</h1>
        <p class="text-neutral-500 mt-2">Nhận ngay hành tinh đầu tiên miễn phí!</p>
      </div>

      <!-- Register Form -->
      <div class="neo-card p-6">
        <form @submit.prevent="handleRegister" class="space-y-5">
          <UiInput
            v-model="form.username"
            label="Tên Chiến Sĩ"
            type="text"
            placeholder="La Phong"
            required
          />

          <UiInput
            v-model="form.email"
            label="Email"
            type="email"
            placeholder="warrior@universe.com"
            required
          />

          <UiInput
            v-model="form.password"
            label="Mật khẩu"
            type="password"
            placeholder="••••••••"
            required
          />

          <UiInput
            v-model="form.confirmPassword"
            label="Xác nhận mật khẩu"
            type="password"
            placeholder="••••••••"
            required
          />

          <div v-if="error" class="p-3 neo-card border-alert-400/50 bg-alert-400/10 text-alert-400 text-sm">
            {{ error }}
          </div>

          <div class="text-xs text-neutral-500">
            Bằng việc đăng ký, bạn đồng ý với
            <a href="#" class="text-primary-500 hover:text-primary-400">Điều khoản sử dụng</a>
            và
            <a href="#" class="text-primary-500 hover:text-primary-400">Chính sách bảo mật</a>.
          </div>

          <button
            type="submit"
            class="neo-btn-success w-full flex items-center justify-center gap-2"
            :disabled="isLoading"
          >
            <IconsTaiDang v-if="isLoading" class="w-5 h-5 animate-spin" />
            <IconsTenLua v-else class="w-5 h-5" />
            {{ isLoading ? 'Đang tạo...' : 'Tạo Tài Khoản & Bắt Đầu' }}
          </button>
        </form>

        <div class="neo-divider my-6"></div>
        
        <p class="text-center text-sm text-neutral-500">
          Đã có tài khoản?
          <NuxtLink to="/login" class="text-primary-500 hover:text-primary-400 font-medium transition-colors">
            Đăng nhập
          </NuxtLink>
        </p>
      </div>

      <!-- Benefits -->
      <div class="mt-8 neo-card p-5">
        <h3 class="text-sm font-display font-semibold mb-4 uppercase tracking-wider text-neutral-400">Khi đăng ký, bạn nhận được:</h3>
        <ul class="space-y-3 text-sm">
          <li class="flex items-center gap-3">
            <div class="w-6 h-6 neo-card flex items-center justify-center border-success-400/30">
              <IconsHoanThanh class="w-3.5 h-3.5 text-success-400" />
            </div>
            <span class="text-neutral-400">1 Hành tinh với 163 ô đất</span>
          </li>
          <li class="flex items-center gap-3">
            <div class="w-6 h-6 neo-card flex items-center justify-center border-success-400/30">
              <IconsHoanThanh class="w-3.5 h-3.5 text-success-400" />
            </div>
            <span class="text-neutral-400">500 Tinh Thạch + 500 Năng Lượng Vũ Trụ</span>
          </li>
          <li class="flex items-center gap-3">
            <div class="w-6 h-6 neo-card flex items-center justify-center border-success-400/30">
              <IconsHoanThanh class="w-3.5 h-3.5 text-success-400" />
            </div>
            <span class="text-neutral-400">Hướng dẫn chi tiết cho người mới</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
