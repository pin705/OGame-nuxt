<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  icon?: string
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  iconPosition: 'left',
  fullWidth: false,
})

const variantClasses = computed(() => {
  const variants: Record<string, string> = {
    primary: 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg hover:shadow-glow-primary',
    secondary: 'bg-secondary-600 hover:bg-secondary-500 text-white shadow-lg hover:shadow-glow-secondary',
    accent: 'bg-accent-600 hover:bg-accent-500 text-white shadow-lg hover:shadow-glow-accent',
    outline: 'border-2 border-primary-500 text-primary-400 hover:bg-primary-500/20',
    ghost: 'text-slate-300 hover:bg-space-700 hover:text-white',
    danger: 'bg-red-600 hover:bg-red-500 text-white shadow-lg hover:shadow-glow-danger',
  }
  return variants[props.variant]
})

const sizeClasses = computed(() => {
  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  }
  return sizes[props.size]
})
</script>

<template>
  <button
    :disabled="disabled || loading"
    class="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    :class="[
      variantClasses,
      sizeClasses,
      { 'w-full': fullWidth },
    ]"
  >
    <Icon v-if="loading" name="mdi:loading" class="animate-spin" />
    <template v-else>
      <Icon v-if="icon && iconPosition === 'left'" :name="icon" />
      <slot />
      <Icon v-if="icon && iconPosition === 'right'" :name="icon" />
    </template>
  </button>
</template>
