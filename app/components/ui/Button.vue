<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'outline' | 'ghost' | 'danger' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  fullWidth: false,
})

const variantClasses = computed(() => {
  const variants: Record<string, string> = {
    primary: 'neo-btn',
    secondary: 'neo-btn-ghost',
    success: 'neo-btn-success',
    outline: 'neo-btn',
    ghost: 'neo-btn-ghost',
    danger: 'neo-btn-alert',
    warning: 'neo-btn-warning',
  }
  return variants[props.variant]
})

const sizeClasses = computed(() => {
  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }
  return sizes[props.size]
})
</script>

<template>
  <button
    :disabled="disabled || loading"
    :class="[
      variantClasses,
      sizeClasses,
      { 'w-full': fullWidth },
    ]"
  >
    <IconsTaiDang v-if="loading" class="w-4 h-4 animate-spin" />
    <template v-else>
      <slot />
    </template>
  </button>
</template>
