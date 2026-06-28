<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-1" v-if="showLabel">
      <small class="fw-semibold" :style="{ color: labelColor }">{{ label }}</small>
      <small class="fw-bold" :style="{ color: labelColor }">{{ percentage }}%</small>
    </div>
    <div class="progress-custom" :class="[variant, { large: large }]">
      <div
        class="progress-bar"
        role="progressbar"
        :style="{ width: percentage + '%' }"
        :aria-valuenow="percentage"
        aria-valuemin="0"
        aria-valuemax="100"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  percentage: {
    type: Number,
    required: true,
    validator: (v) => v >= 0 && v <= 100
  },
  label: {
    type: String,
    default: 'Progress'
  },
  variant: {
    type: String,
    default: ''
  },
  large: {
    type: Boolean,
    default: false
  },
  showLabel: {
    type: Boolean,
    default: true
  }
})

const labelColor = computed(() => {
  if (props.variant === 'success') return 'var(--accent-success)'
  return 'var(--text-secondary)'
})
</script>
