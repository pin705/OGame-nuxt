/**
 * Theme management composable
 * Supports dark/light mode with persistence
 */

type Theme = 'dark' | 'light'

const STORAGE_KEY = 'game-theme'

// Global state - shared across all instances
const currentTheme = ref<Theme>('dark')
const isInitialized = ref(false)

export const useTheme = () => {
  /**
   * Initialize theme from storage or system preference
   */
  const init = () => {
    if (isInitialized.value || !import.meta.client) return
    
    // Check localStorage first
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (stored && (stored === 'dark' || stored === 'light')) {
      currentTheme.value = stored
    } else {
      // Fall back to system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      currentTheme.value = prefersDark ? 'dark' : 'light'
    }
    
    applyTheme(currentTheme.value)
    isInitialized.value = true
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    })
  }
  
  /**
   * Apply theme to document
   */
  const applyTheme = (theme: Theme) => {
    if (!import.meta.client) return
    
    document.documentElement.setAttribute('data-theme', theme)
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#050608' : '#f8fafc')
    }
  }
  
  /**
   * Set and persist theme
   */
  const setTheme = (theme: Theme) => {
    currentTheme.value = theme
    applyTheme(theme)
    
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, theme)
    }
  }
  
  /**
   * Toggle between dark and light
   */
  const toggleTheme = () => {
    setTheme(currentTheme.value === 'dark' ? 'light' : 'dark')
  }
  
  /**
   * Check if dark mode
   */
  const isDark = computed(() => currentTheme.value === 'dark')
  
  return {
    theme: readonly(currentTheme),
    isDark,
    init,
    setTheme,
    toggleTheme,
  }
}
