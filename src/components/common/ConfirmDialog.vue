<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="show" class="modal-backdrop-custom" @click.self="handleCancel">
        <div class="modal-dialog-custom animate-fade-in-up">
          <div class="modal-content" style="border-radius: 16px;">
            <!-- Header -->
            <div class="modal-header border-0 pb-0">
              <div class="d-flex align-items-center gap-3">
                <div
                  class="d-flex align-items-center justify-content-center rounded-circle"
                  :style="{
                    width: '42px',
                    height: '42px',
                    background: iconBg
                  }"
                >
                  <i :class="iconClass" :style="{ color: iconColor, fontSize: '1.2rem' }"></i>
                </div>
                <h5 class="modal-title mb-0 fw-bold">{{ title }}</h5>
              </div>
              <button type="button" class="btn-close" @click="handleCancel"></button>
            </div>

            <!-- Body -->
            <div class="modal-body py-3">
              <p class="text-secondary mb-0" style="font-size: 0.9rem;">{{ message }}</p>
            </div>

            <!-- Footer -->
            <div class="modal-footer border-0 pt-0">
              <button class="btn btn-secondary-custom" @click="handleCancel">
                {{ cancelText }}
              </button>
              <button
                class="btn"
                :class="confirmBtnClass"
                @click="handleConfirm"
                :disabled="loading"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                {{ confirmText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Confirm'
  },
  message: {
    type: String,
    default: 'Are you sure?'
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  variant: {
    type: String,
    default: 'danger',
    validator: (v) => ['danger', 'warning', 'info', 'primary'].includes(v)
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const iconClass = computed(() => {
  const icons = {
    danger: 'bi bi-exclamation-triangle',
    warning: 'bi bi-exclamation-circle',
    info: 'bi bi-info-circle',
    primary: 'bi bi-question-circle'
  }
  return icons[props.variant]
})

const iconColor = computed(() => {
  const colors = {
    danger: 'var(--accent-danger)',
    warning: 'var(--accent-warning)',
    info: 'var(--accent-info)',
    primary: 'var(--accent-primary)'
  }
  return colors[props.variant]
})

const iconBg = computed(() => {
  const bgs = {
    danger: 'var(--accent-danger-light)',
    warning: 'var(--accent-warning-light)',
    info: 'var(--accent-info-light)',
    primary: 'var(--accent-primary-light)'
  }
  return bgs[props.variant]
})

const confirmBtnClass = computed(() => {
  const classes = {
    danger: 'btn-danger',
    warning: 'btn-warning',
    info: 'btn-info',
    primary: 'btn-primary-custom'
  }
  return classes[props.variant]
})

function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  emit('cancel')
}
</script>

<style scoped>
.modal-backdrop-custom {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1060;
  padding: 20px;
}

.modal-dialog-custom {
  width: 100%;
  max-width: 440px;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
