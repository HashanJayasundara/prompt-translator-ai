<template>
  <div class="stat-card" :class="variant">
    <div class="stat-card-icon" :class="variant">
      <i :class="icon"></i>
    </div>
    <div class="stat-card-content">
      <h3>{{ formattedValue }}</h3>
      <p>{{ label }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: [Number, String],
    required: true
  },
  label: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'bi bi-bar-chart'
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'success', 'warning', 'danger', 'info'].includes(v)
  },
  suffix: {
    type: String,
    default: ''
  }
})

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString() + props.suffix
  }
  return props.value + props.suffix
})
</script>
