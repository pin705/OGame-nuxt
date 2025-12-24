<script setup lang="ts">
interface Props {
  text: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  variant?: 'default' | 'warning' | 'info' | 'success'
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top',
  variant: 'default',
})

const positionClasses = computed(() => {
  switch (props.position) {
    case 'bottom':
      return 'top-full mt-2 left-1/2 -translate-x-1/2'
    case 'left':
      return 'right-full mr-2 top-1/2 -translate-y-1/2'
    case 'right':
      return 'left-full ml-2 top-1/2 -translate-y-1/2'
    default:
      return 'bottom-full mb-2 left-1/2 -translate-x-1/2'
  }
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'warning':
      return 'bg-warning-900/95 border-warning-500/30 text-warning-200'
    case 'info':
      return 'bg-primary-900/95 border-primary-500/30 text-primary-200'
    case 'success':
      return 'bg-success-900/95 border-success-500/30 text-success-200'
    default:
      return 'bg-space-800/95 border-neutral-500/30 text-neutral-200'
  }
})
</script>

<template>
  <div class="relative group/tooltip inline-flex">
    <slot />
    <div 
      class="absolute z-50 px-3 py-2 text-xs rounded-lg border backdrop-blur-sm whitespace-nowrap opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 pointer-events-none"
      :class="[positionClasses, variantClasses]"
    >
      {{ text }}
      <!-- Arrow -->
      <div 
        v-if="position === 'top'"
        class="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-current opacity-50"
      />
      <div 
        v-else-if="position === 'bottom'"
        class="absolute bottom-full left-1/2 -translate-x-1/2 mb-px border-4 border-transparent border-b-current opacity-50"
      />
    </div>
  </div>
</template>
