<script setup lang="ts">
interface Props {
  label?: string
  type?: 'text' | 'email' | 'password' | 'number'
  placeholder?: string
  modelValue?: string | number
  error?: string
  disabled?: boolean
  required?: boolean
  icon?: string
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
    <label v-if="label" :for="inputId" class="label">
      {{ label }}
      <span v-if="required" class="text-red-400">*</span>
    </label>
    
    <div class="relative">
      <div v-if="icon" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon :name="icon" class="text-slate-500" />
      </div>
      
      <input
        :id="inputId"
        v-model="inputValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        class="input"
        :class="{
          'pl-10': icon,
          'input-error': error,
        }"
      >
    </div>
    
    <p v-if="error" class="mt-1 text-sm text-red-400">
      {{ error }}
    </p>
  </div>
</template>
