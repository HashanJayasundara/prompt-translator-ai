<template>
  <div class="animate-fade-in-up">
    <!-- Page header -->
    <div class="page-header">
      <h2>Dashboard</h2>
      <p>Overview of your AI prompt translation progress</p>
    </div>

    <!-- Statistics cards -->
    <div class="row g-3 mb-4 stagger-children">
      <div class="col-6 col-lg-3">
        <StatCard
          :value="promptStore.totalCategories"
          label="Total Categories"
          icon="bi bi-folder2"
          variant="primary"
        />
      </div>
      <div class="col-6 col-lg-3">
        <StatCard
          :value="promptStore.totalPrompts"
          label="Total Prompts"
          icon="bi bi-file-text"
          variant="info"
        />
      </div>
      <div class="col-6 col-lg-3">
        <StatCard
          :value="promptStore.translatedCount"
          label="Translated"
          icon="bi bi-check-circle"
          variant="success"
        />
      </div>
      <div class="col-6 col-lg-3">
        <StatCard
          :value="promptStore.remainingCount"
          label="Remaining"
          icon="bi bi-hourglass-split"
          variant="warning"
        />
      </div>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-6 col-lg-3">
        <StatCard
          :value="promptStore.failedCount"
          label="Failed"
          icon="bi bi-x-circle"
          variant="danger"
        />
      </div>
      <div class="col-6 col-lg-3">
        <StatCard
          :value="promptStore.progressPercentage"
          label="Progress"
          icon="bi bi-pie-chart"
          variant="primary"
          suffix="%"
        />
      </div>
      <div class="col-6 col-lg-3">
        <div class="stat-card info">
          <div class="stat-card-icon info">
            <i class="bi bi-key"></i>
          </div>
          <div class="stat-card-content">
            <h3 :style="{ fontSize: '1rem' }">
              <span :class="settingsStore.hasApiKey ? 'text-success' : 'text-danger'">
                {{ settingsStore.hasApiKey ? 'Connected' : 'Not Set' }}
              </span>
            </h3>
            <p>API Key Status</p>
          </div>
        </div>
      </div>
      <div class="col-6 col-lg-3">
        <div class="stat-card primary">
          <div class="stat-card-icon primary">
            <i class="bi bi-cpu"></i>
          </div>
          <div class="stat-card-content">
            <h3 :style="{ fontSize: '0.9rem' }">{{ settingsStore.model }}</h3>
            <p>Gemini Model</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Overall Progress -->
    <div class="row g-3 mb-4">
      <div class="col-12">
        <div class="card-custom">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="fw-bold mb-0">
                <i class="bi bi-graph-up me-2 text-primary"></i>
                Overall Translation Progress
              </h6>
              <span class="badge-status badge-completed" v-if="promptStore.progressPercentage === 100">
                Complete
              </span>
            </div>
            <ProgressBar
              :percentage="promptStore.progressPercentage"
              label="Translation Progress"
              :variant="promptStore.progressPercentage === 100 ? 'success' : ''"
              :large="true"
            />
            <div class="row mt-3 text-center" style="font-size: 0.8rem;">
              <div class="col-3">
                <div class="fw-bold text-primary">{{ promptStore.translatedCount }}</div>
                <div class="text-muted">Completed</div>
              </div>
              <div class="col-3">
                <div class="fw-bold text-warning">{{ promptStore.pendingCount }}</div>
                <div class="text-muted">Pending</div>
              </div>
              <div class="col-3">
                <div class="fw-bold text-danger">{{ promptStore.failedCount }}</div>
                <div class="text-muted">Failed</div>
              </div>
              <div class="col-3">
                <div class="fw-bold text-info">{{ promptStore.translatingCount }}</div>
                <div class="text-muted">In Progress</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Category breakdown & Recent Activity -->
    <div class="row g-3">
      <!-- Categories -->
      <div class="col-lg-7">
        <div class="card-custom">
          <div class="card-header d-flex justify-content-between align-items-center">
            <span><i class="bi bi-folder2-open me-2"></i>Categories</span>
            <span class="badge rounded-pill bg-primary">{{ promptStore.totalCategories }}</span>
          </div>
          <div class="card-body p-0">
            <div v-if="categoryStats.length === 0" class="empty-state" style="padding: 40px;">
              <i class="bi bi-folder-x d-block"></i>
              <h5>No Categories</h5>
              <p>Upload a file to get started</p>
            </div>
            <div v-else class="table-responsive" style="max-height: 350px; overflow-y: auto;">
              <table class="table table-sm mb-0">
                <thead>
                  <tr>
                    <th style="padding: 10px 16px; font-size: 0.75rem; color: var(--text-secondary);">Category</th>
                    <th style="padding: 10px 16px; font-size: 0.75rem; color: var(--text-secondary); text-align: center;">Total</th>
                    <th style="padding: 10px 16px; font-size: 0.75rem; color: var(--text-secondary); text-align: center;">Done</th>
                    <th style="padding: 10px 16px; font-size: 0.75rem; color: var(--text-secondary); width: 30%;">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="cat in categoryStats" :key="cat.name">
                    <td style="padding: 10px 16px;">
                      <span class="fw-semibold" style="font-size: 0.85rem;">{{ cat.name }}</span>
                    </td>
                    <td style="padding: 10px 16px; text-align: center;">
                      <span class="text-muted">{{ cat.total }}</span>
                    </td>
                    <td style="padding: 10px 16px; text-align: center;">
                      <span class="text-success fw-semibold">{{ cat.completed }}</span>
                    </td>
                    <td style="padding: 10px 16px;">
                      <ProgressBar
                        :percentage="cat.percentage"
                        :show-label="false"
                        :variant="cat.percentage === 100 ? 'success' : ''"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="col-lg-5">
        <div class="card-custom">
          <div class="card-header d-flex justify-content-between align-items-center">
            <span><i class="bi bi-activity me-2"></i>Recent Activity</span>
            <router-link to="/logs" class="text-decoration-none" style="font-size: 0.8rem;">
              View All <i class="bi bi-arrow-right"></i>
            </router-link>
          </div>
          <div class="card-body p-0">
            <div v-if="recentLogs.length === 0" class="empty-state" style="padding: 40px;">
              <i class="bi bi-journal d-block"></i>
              <h5>No Activity</h5>
              <p>Activity will appear here as you work</p>
            </div>
            <div v-else style="max-height: 350px; overflow-y: auto; padding: 12px;">
              <div
                v-for="log in recentLogs"
                :key="log.id"
                class="log-entry"
                :class="log.type"
              >
                <span class="log-time">{{ formatLogTime(log.timestamp) }}</span>
                <span class="log-message">{{ log.message }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="row g-3 mt-3">
      <div class="col-12">
        <div class="card-custom">
          <div class="card-body">
            <h6 class="fw-bold mb-3">
              <i class="bi bi-lightning me-2" style="color: var(--accent-warning);"></i>
              Quick Actions
            </h6>
            <div class="d-flex flex-wrap gap-2">
              <router-link to="/upload" class="btn btn-primary-custom">
                <i class="bi bi-cloud-upload me-2"></i>Upload Prompts
              </router-link>
              <router-link
                to="/translation"
                class="btn btn-primary-custom"
                :class="{ disabled: promptStore.totalPrompts === 0 }"
              >
                <i class="bi bi-translate me-2"></i>Start Translation
              </router-link>
              <router-link
                to="/export"
                class="btn btn-secondary-custom"
                :class="{ disabled: promptStore.translatedCount === 0 }"
              >
                <i class="bi bi-download me-2"></i>Export
              </router-link>
              <router-link to="/settings" class="btn btn-secondary-custom">
                <i class="bi bi-gear me-2"></i>Settings
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePromptStore } from '@/stores/promptStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useLogStore } from '@/stores/logStore'
import { TRANSLATION_STATUS } from '@/config/constants'
import StatCard from '@/components/common/StatCard.vue'
import ProgressBar from '@/components/common/ProgressBar.vue'
import { calculatePercentage } from '@/utils/helpers'

const promptStore = usePromptStore()
const settingsStore = useSettingsStore()
const logStore = useLogStore()

/** Category statistics */
const categoryStats = computed(() => {
  return promptStore.categories.map(catName => {
    const catPrompts = promptStore.prompts.filter(p => p.category === catName)
    const completed = catPrompts.filter(p => p.status === TRANSLATION_STATUS.COMPLETED).length
    return {
      name: catName,
      total: catPrompts.length,
      completed,
      percentage: calculatePercentage(completed, catPrompts.length)
    }
  }).sort((a, b) => b.total - a.total)
})

/** Recent logs (last 10) */
const recentLogs = computed(() => logStore.recentLogs.slice(0, 10))

/** Format log timestamp */
function formatLogTime(timestamp) {
  const d = new Date(timestamp)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}
</script>
