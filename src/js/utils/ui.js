/**
 * Centralized UI Utility for RestB Frontend
 * Handles notifications, loading states, and common UI interactions
 */

class UIManager {
    /**
     * Show a notification message
     * @param {string} message - Message to display
     * @param {string} type - 'success', 'error', 'warning', 'info'
     * @param {number} duration - Duration in milliseconds (default: 3000)
     * @param {string} position - 'top-right', 'top-center', 'bottom-right' (default: 'top-right')
     */
    static showNotification(message, type = 'info', duration = 3000, position = 'top-right') {
        // Remove any existing notifications first
        this.removeNotifications();

        const notification = document.createElement('div');
        notification.className = `restb-notification restb-notification--${type}`;
        notification.setAttribute('role', 'alert');
        
        // Set styles based on type
        const colors = {
            success: { bg: '#27ae60', border: '#229954' },
            error: { bg: '#e74c3c', border: '#c0392b' },
            warning: { bg: '#f39c12', border: '#d68910' },
            info: { bg: '#3498db', border: '#2980b9' }
        };

        const color = colors[type] || colors.info;
        
        // Position styles
        const positions = {
            'top-right': 'top: 20px; right: 20px;',
            'top-center': 'top: 20px; left: 50%; transform: translateX(-50%);',
            'bottom-right': 'bottom: 20px; right: 20px;'
        };

        const positionStyle = positions[position] || positions['top-right'];

        notification.style.cssText = `
            ${positionStyle}
            background: ${color.bg};
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            border-left: 4px solid ${color.border};
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 400px;
            word-wrap: break-word;
            animation: slideInRight 0.3s ease-out;
        `;

        notification.textContent = message;
        
        // Add animation styles if not already added
        if (!document.querySelector('#restb-notification-styles')) {
            const style = document.createElement('style');
            style.id = 'restb-notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
                .restb-notification {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 14px;
                    line-height: 1.4;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification);
            }, duration);
        }

        return notification;
    }

    /**
     * Show success notification
     * @param {string} message - Success message
     * @param {number} duration - Duration in milliseconds
     */
    static showSuccess(message, duration = 3000) {
        return this.showNotification(message, 'success', duration);
    }

    /**
     * Show error notification
     * @param {string} message - Error message
     * @param {number} duration - Duration in milliseconds (0 for persistent)
     */
    static showError(message, duration = 5000) {
        return this.showNotification(message, 'error', duration);
    }

    /**
     * Show warning notification
     * @param {string} message - Warning message
     * @param {number} duration - Duration in milliseconds
     */
    static showWarning(message, duration = 4000) {
        return this.showNotification(message, 'warning', duration);
    }

    /**
     * Show info notification
     * @param {string} message - Info message
     * @param {number} duration - Duration in milliseconds
     */
    static showInfo(message, duration = 3000) {
        return this.showNotification(message, 'info', duration);
    }

    /**
     * Remove a specific notification
     * @param {HTMLElement} notification - Notification element to remove
     */
    static removeNotification(notification) {
        if (notification && notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }

    /**
     * Remove all notifications
     */
    static removeNotifications() {
        const notifications = document.querySelectorAll('.restb-notification');
        notifications.forEach(notification => {
            this.removeNotification(notification);
        });
    }

    /**
     * Show loading state on a button
     * @param {HTMLElement|string} button - Button element or selector
     * @param {string} loadingText - Text to show while loading
     */
    static setButtonLoading(button, loadingText = 'Loading...') {
        const btn = typeof button === 'string' ? document.querySelector(button) : button;
        if (!btn) return;

        // Store original state
        btn.dataset.originalText = btn.textContent;
        btn.dataset.originalDisabled = btn.disabled;
        
        btn.textContent = loadingText;
        btn.disabled = true;
        btn.classList.add('loading');
    }

    /**
     * Reset button to original state
     * @param {HTMLElement|string} button - Button element or selector
     */
    static resetButton(button) {
        const btn = typeof button === 'string' ? document.querySelector(button) : button;
        if (!btn) return;

        btn.textContent = btn.dataset.originalText || btn.textContent;
        btn.disabled = btn.dataset.originalDisabled === 'true';
        btn.classList.remove('loading');
        
        // Clean up dataset
        delete btn.dataset.originalText;
        delete btn.dataset.originalDisabled;
    }

    /**
     * Show loading overlay on a container
     * @param {HTMLElement|string} container - Container element or selector
     * @param {string} message - Loading message
     */
    static showLoadingOverlay(container, message = 'Loading...') {
        const element = typeof container === 'string' ? document.querySelector(container) : container;
        if (!element) return;

        // Remove existing overlay
        this.hideLoadingOverlay(container);

        const overlay = document.createElement('div');
        overlay.className = 'restb-loading-overlay';
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            z-index: 9999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        const spinner = document.createElement('div');
        spinner.style.cssText = `
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 10px;
        `;

        const text = document.createElement('div');
        text.textContent = message;
        text.style.cssText = `
            color: #333;
            font-size: 14px;
        `;

        // Add spinner animation if not already added
        if (!document.querySelector('#restb-spinner-styles')) {
            const style = document.createElement('style');
            style.id = 'restb-spinner-styles';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }

        overlay.appendChild(spinner);
        overlay.appendChild(text);
        
        // Make sure container has relative positioning
        if (getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }
        
        element.appendChild(overlay);
    }

    /**
     * Hide loading overlay
     * @param {HTMLElement|string} container - Container element or selector
     */
    static hideLoadingOverlay(container) {
        const element = typeof container === 'string' ? document.querySelector(container) : container;
        if (!element) return;

        const overlay = element.querySelector('.restb-loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    /**
     * Show inline form message (replaces the old showError/showSuccess pattern)
     * @param {string} message - Message to display
     * @param {string} type - 'success', 'error', 'warning', 'info'
     * @param {HTMLElement|string} container - Container to append message to
     */
    static showFormMessage(message, type = 'info', container = '.form-container') {
        const element = typeof container === 'string' ? document.querySelector(container) : container;
        if (!element) return;

        // Remove existing messages
        this.removeFormMessages(element);

        const messageDiv = document.createElement('div');
        messageDiv.className = `restb-form-message restb-form-message--${type}`;
        
        const styles = {
            success: 'color: #27ae60; background: #f0f9f4; border: 1px solid #c3e6cb;',
            error: 'color: #e74c3c; background: #fdf2f2; border: 1px solid #f5c6cb;',
            warning: 'color: #f39c12; background: #fef9e7; border: 1px solid #f5b041;',
            info: 'color: #3498db; background: #e3f2fd; border: 1px solid #64b5f6;'
        };

        messageDiv.style.cssText = `
            ${styles[type] || styles.info}
            padding: 12px 16px;
            margin-top: 16px;
            border-radius: 6px;
            font-size: 14px;
            line-height: 1.4;
        `;

        messageDiv.textContent = message;
        element.appendChild(messageDiv);

        return messageDiv;
    }

    /**
     * Remove form messages from a container
     * @param {HTMLElement} container - Container element
     */
    static removeFormMessages(container) {
        const messages = container.querySelectorAll('.restb-form-message');
        messages.forEach(msg => msg.remove());
    }
}

// Export for global use
window.UIManager = UIManager;
