<script setup lang="ts">
interface Props {
  label?: string
  type?: 'text' | 'email' | 'password' | 'number'
  placeholder?: string
  modelValue?: string | number
  error?: string
  disabled?: boolean
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

const inputValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value as string | number),
})

const inputId = `input-${Math.random().toString(36).substr(2, 9)}`
</script>

<template>
  <div class="w-full">
    <label v-if="label" :for="inputId" class="neo-label">
      {{ label }}
      <span v-if="required" class="text-alert-400">*</span>
    </label>
    
    <div class="relative">
      <input
        :id="inputId"
        v-model="inputValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        class="neo-input"
        :class="{
          'neo-input-error': error,
        }"
      >
    </div>
    
    <p v-if="error" class="mt-1.5 text-sm text-alert-400 font-medium">
      {{ error }}
    </p>
  </div>
</template>
