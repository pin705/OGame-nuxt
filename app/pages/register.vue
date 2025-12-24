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
  <div class="min-h-screen flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-block">
          <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mx-auto mb-4">
            <Icon name="mdi:rocket-launch-outline" class="text-4xl text-white" />
          </div>
        </NuxtLink>
        <h1 class="text-2xl font-display font-bold text-gradient">Tạo Tài Khoản Mới</h1>
        <p class="text-slate-400 mt-2">Nhận ngay hành tinh đầu tiên miễn phí!</p>
      </div>

      <!-- Register Form -->
      <UiCard>
        <form @submit.prevent="handleRegister" class="space-y-5">
          <UiInput
            v-model="form.username"
            label="Tên Chiến Sĩ"
            type="text"
            placeholder="La Phong"
            icon="mdi:account"
            required
          />

          <UiInput
            v-model="form.email"
            label="Email"
            type="email"
            placeholder="warrior@universe.com"
            icon="mdi:email"
            required
          />

          <UiInput
            v-model="form.password"
            label="Mật khẩu"
            type="password"
            placeholder="••••••••"
            icon="mdi:lock"
            required
          />

          <UiInput
            v-model="form.confirmPassword"
            label="Xác nhận mật khẩu"
            type="password"
            placeholder="••••••••"
            icon="mdi:lock-check"
            required
          />

          <div v-if="error" class="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {{ error }}
          </div>

          <div class="text-xs text-slate-500">
            Bằng việc đăng ký, bạn đồng ý với
            <a href="#" class="text-primary-400">Điều khoản sử dụng</a>
            và
            <a href="#" class="text-primary-400">Chính sách bảo mật</a>.
          </div>

          <UiButton
            type="submit"
            variant="primary"
            full-width
            :loading="isLoading"
          >
            <Icon name="mdi:rocket-launch" />
            Tạo Tài Khoản & Bắt Đầu
          </UiButton>
        </form>

        <template #footer>
          <p class="text-center text-sm text-slate-400">
            Đã có tài khoản?
            <NuxtLink to="/login" class="text-primary-400 hover:text-primary-300 font-medium">
              Đăng nhập
            </NuxtLink>
          </p>
        </template>
      </UiCard>

      <!-- Benefits -->
      <div class="mt-8 glass-card p-4">
        <h3 class="text-sm font-semibold text-slate-300 mb-3">Khi đăng ký, bạn nhận được:</h3>
        <ul class="space-y-2 text-sm text-slate-400">
          <li class="flex items-center gap-2">
            <Icon name="mdi:check-circle" class="text-green-400" />
            1 Hành tinh với 163 ô đất
          </li>
          <li class="flex items-center gap-2">
            <Icon name="mdi:check-circle" class="text-green-400" />
            500 Tinh Thạch + 500 Năng Lượng Vũ Trụ
          </li>
          <li class="flex items-center gap-2">
            <Icon name="mdi:check-circle" class="text-green-400" />
            Hướng dẫn chi tiết cho người mới
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
