import type { Player, Planet } from '~/types/game'

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  player: Player | null
  homePlanet: Planet | null
  token: string | null
}

export const useAuth = () => {
  const state = useState<AuthState>('auth', () => ({
    isAuthenticated: false,
    isLoading: true,
    player: null,
    homePlanet: null,
    token: null,
  }))

  const router = useRouter()

  /**
   * Initialize auth state from cookie
   */
  const init = async () => {
    state.value.isLoading = true
    try {
      const { data, error } = await useFetch('/api/auth/me', {
        credentials: 'include',
      })

      if (!error.value && data.value?.success) {
        state.value.isAuthenticated = true
        state.value.player = data.value.data.player as Player
        state.value.homePlanet = data.value.data.player.homePlanet as Planet
      } else {
        state.value.isAuthenticated = false
        state.value.player = null
        state.value.homePlanet = null
      }
    } catch {
      state.value.isAuthenticated = false
      state.value.player = null
      state.value.homePlanet = null
    } finally {
      state.value.isLoading = false
    }
  }

  /**
   * Login with email and password
   */
  const login = async (email: string, password: string) => {
    const { data, error } = await useFetch('/api/auth/login', {
      method: 'POST',
      body: { email, password },
      credentials: 'include',
    })

    if (error.value) {
      throw new Error(error.value.data?.message || 'Login failed')
    }

    if (data.value?.success) {
      state.value.isAuthenticated = true
      state.value.player = data.value.data.player as Player
      state.value.homePlanet = data.value.data.homePlanet as Planet
      state.value.token = data.value.data.token
      return data.value.data
    }

    throw new Error('Login failed')
  }

  /**
   * Register a new account
   */
  const register = async (username: string, email: string, password: string) => {
    const { data, error } = await useFetch('/api/auth/register', {
      method: 'POST',
      body: { username, email, password },
      credentials: 'include',
    })

    if (error.value) {
      throw new Error(error.value.data?.message || 'Registration failed')
    }

    if (data.value?.success) {
      state.value.isAuthenticated = true
      state.value.player = data.value.data.player as Player
      state.value.token = data.value.data.token
      return data.value.data
    }

    throw new Error('Registration failed')
  }

  /**
   * Logout
   */
  const logout = async () => {
    try {
      await $fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // Ignore logout errors
    }

    state.value.isAuthenticated = false
    state.value.player = null
    state.value.homePlanet = null
    state.value.token = null
  }

  /**
   * Check if user is authenticated
   */
  const checkAuth = async () => {
    if (state.value.isLoading) {
      await init()
    }
    return state.value.isAuthenticated
  }

  return {
    // State
    isAuthenticated: computed(() => state.value.isAuthenticated),
    isLoading: computed(() => state.value.isLoading),
    player: computed(() => state.value.player),
    homePlanet: computed(() => state.value.homePlanet),
    token: computed(() => state.value.token),

    // Methods
    init,
    login,
    register,
    logout,
    checkAuth,
  }
}
