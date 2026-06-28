<template>
  <div class="d-flex justify-content-center align-items-center" :style="{ minHeight: fullPage ? '400px' : 'auto' }">
    <div class="text-center">
      <div class="spinner-custom" :class="{ sm: size === 'sm' }"></div>
      <p v-if="message" class="mt-3 text-muted" style="font-size: 0.875rem;">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md'].includes(v)
  },
  fullPage: {
    type: Boolean,
    default: false
  }
})
</script>
