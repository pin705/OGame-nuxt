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
  <div class="min-h-screen flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-block">
          <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mx-auto mb-4">
            <IconsTenLua class="w-10 h-10 text-white" />
          </div>
        </NuxtLink>
        <h1 class="text-2xl font-display font-bold text-gradient">Thôn Phệ Tinh Không</h1>
        <p class="text-slate-400 mt-2">Đăng nhập để tiếp tục chinh phục vũ trụ</p>
      </div>

      <!-- Login Form -->
      <UiCard>
        <form @submit.prevent="handleLogin" class="space-y-6">
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
            <label class="flex items-center gap-2 text-slate-400">
              <input type="checkbox" class="rounded border-space-600 bg-space-700 text-primary-500 focus:ring-primary-500">
              Ghi nhớ đăng nhập
            </label>
            <NuxtLink to="/forgot-password" class="text-primary-400 hover:text-primary-300">
              Quên mật khẩu?
            </NuxtLink>
          </div>

          <div v-if="error" class="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {{ error }}
          </div>

          <button
            type="submit"
            class="btn-primary w-full flex items-center justify-center gap-2"
            :disabled="isLoading"
          >
            <IconsNguoiChoi class="w-5 h-5" />
            {{ isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập' }}
          </button>
        </form>

        <template #footer>
          <p class="text-center text-sm text-slate-400">
            Chưa có tài khoản?
            <NuxtLink to="/register" class="text-primary-400 hover:text-primary-300 font-medium">
              Đăng ký ngay
            </NuxtLink>
          </p>
        </template>
      </UiCard>

      <!-- Demo Login -->
      <div class="mt-6 text-center">
        <p class="text-sm text-slate-500 mb-3">Hoặc dùng thử với tài khoản demo</p>
        <button class="btn-outline flex items-center justify-center gap-2 mx-auto" @click="navigateTo('/game/overview')">
          <IconsTenLua class="w-5 h-5" />
          Chơi Demo
        </button>
      </div>
    </div>
  </div>
</template>
