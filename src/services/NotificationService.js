/**
 * NotificationService — Toast notification wrapper using vue-toastification
 */

let toastInstance = null

class NotificationService {
  /**
   * Initialize with the toast instance from vue-toastification
   * @param {Object} toast - vue-toastification useToast() instance
   */
  init(toast) {
    toastInstance = toast
  }

  /**
   * Show a success toast
   * @param {string} message - Message text
   * @param {Object} options - Toast options
   */
  success(message, options = {}) {
    if (!toastInstance) {
      console.log('[SUCCESS]', message)
      return
    }
    toastInstance.success(message, {
      timeout: 4000,
      ...options
    })
  }

  /**
   * Show an error toast
   * @param {string} message - Message text
   * @param {Object} options - Toast options
   */
  error(message, options = {}) {
    if (!toastInstance) {
      console.error('[ERROR]', message)
      return
    }
    toastInstance.error(message, {
      timeout: 6000,
      ...options
    })
  }

  /**
   * Show a warning toast
   * @param {string} message - Message text
   * @param {Object} options - Toast options
   */
  warning(message, options = {}) {
    if (!toastInstance) {
      console.warn('[WARNING]', message)
      return
    }
    toastInstance.warning(message, {
      timeout: 5000,
      ...options
    })
  }

  /**
   * Show an info toast
   * @param {string} message - Message text
   * @param {Object} options - Toast options
   */
  info(message, options = {}) {
    if (!toastInstance) {
      console.info('[INFO]', message)
      return
    }
    toastInstance.info(message, {
      timeout: 4000,
      ...options
    })
  }
}

export default new NotificationService()
