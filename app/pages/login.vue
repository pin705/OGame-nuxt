<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

const auth = useAuth()
const router = useRouter()

const form = reactive({
  email: '',
  password: '',
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

const handleLogin = async () => {
  isLoading.value = true
  error.value = ''
  
  try {
    await auth.login(form.email, form.password)
    await router.push('/game/overview')
  } catch (e: any) {
    error.value = e.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.'
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
          <div class="w-16 h-16 neo-card border-primary-500/50 flex items-center justify-center mx-auto mb-4 group-hover:glow-cyan transition-all">
            <IconsTenLua class="w-8 h-8 text-primary-500" />
          </div>
        </NuxtLink>
        <h1 class="text-2xl font-display font-bold text-gradient-cyan">THÔN PHỆ TINH KHÔNG</h1>
        <p class="text-neutral-500 mt-2">Đăng nhập để tiếp tục chinh phục vũ trụ</p>
      </div>

      <!-- Login Form -->
      <div class="neo-card p-6">
        <form @submit.prevent="handleLogin" class="space-y-5">
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

          <div class="flex items-center justify-between text-sm">
            <label class="flex items-center gap-2 text-neutral-500 cursor-pointer">
              <input type="checkbox" class="w-4 h-4 rounded-sm border-white/10 bg-space-800 text-primary-500 focus:ring-primary-500">
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <NuxtLink to="/forgot-password" class="text-primary-500 hover:text-primary-400 transition-colors">
              Quên mật khẩu?
            </NuxtLink>
          </div>

          <div v-if="error" class="p-3 neo-card border-alert-400/50 bg-alert-400/10 text-alert-400 text-sm">
            {{ error }}
          </div>

          <button
            type="submit"
            class="neo-btn-primary w-full flex items-center justify-center gap-2"
            :disabled="isLoading"
          >
            <IconsNguoiChoi class="w-5 h-5" />
            {{ isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập' }}
          </button>
        </form>

        <div class="neo-divider my-6"></div>
        
        <p class="text-center text-sm text-neutral-500">
          Chưa có tài khoản?
          <NuxtLink to="/register" class="text-primary-500 hover:text-primary-400 font-medium transition-colors">
            Đăng ký ngay
          </NuxtLink>
        </p>
      </div>

      <!-- Demo Login -->
      <div class="mt-6 text-center">
        <p class="text-sm text-neutral-500 mb-3">Hoặc dùng thử với tài khoản demo</p>
        <button class="neo-btn-ghost flex items-center justify-center gap-2 mx-auto" @click="navigateTo('/game/overview')">
          <IconsTenLua class="w-5 h-5" />
          Chơi Demo
        </button>
      </div>
    </div>
  </div>
</template>
