/**
 * Utility Functions - Helper functions used throughout the app
 */

const Utils = {
    /**
     * Format currency
     */
    formatCurrency(amount, currency = '₹') {
        return `${currency}${parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
    },

    /**
     * Format number
     */
    formatNumber(num) {
        return parseFloat(num).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    },

    /**
     * Format date
     */
    formatDate(date, format = 'DD MMM YYYY') {
        return dayjs(date).format(format);
    },

    /**
     * Format time
     */
    formatTime(date) {
        return dayjs(date).format('hh:mm A');
    },

    /**
     * Format relative time
     */
    formatRelativeTime(date) {
        const now = dayjs();
        const target = dayjs(date);
        const diffMinutes = now.diff(target, 'minute');
        const diffHours = now.diff(target, 'hour');
        const diffDays = now.diff(target, 'day');

        if (diffMinutes < 1) return 'Just now';
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return this.formatDate(date, 'DD MMM');
    },

    /**
     * Get category icon
     */
    getCategoryIcon(category) {
        const icons = {
            food: 'bi-egg-fried',
            transport: 'bi-car-front',
            groceries: 'bi-cart',
            bills: 'bi-receipt',
            personal: 'bi-person',
            others: 'bi-three-dots'
        };
        return icons[category] || icons.others;
    },

    /**
     * Get category color class
     */
    getCategoryColorClass(category) {
        return `cat-${category}`;
    },

    /**
     * Get payment mode icon
     */
    getPaymentModeIcon(mode) {
        const icons = {
            cash: 'bi-cash',
            upi: 'bi-phone',
            card: 'bi-credit-card'
        };
        return icons[mode] || icons.cash;
    },

    /**
     * Show toast notification
     */
    showToast(message, type = 'success') {
        const toast = $('#successToast');
        const toastHeader = toast.find('.toast-header');
        const toastBody = toast.find('.toast-body');

        // Reset classes
        toastHeader.removeClass('bg-success bg-danger bg-warning bg-info');

        // Set color based on type
        switch (type) {
            case 'success':
                toastHeader.addClass('bg-success');
                break;
            case 'error':
            case 'danger':
                toastHeader.addClass('bg-danger');
                break;
            case 'warning':
                toastHeader.addClass('bg-warning');
                break;
            case 'info':
                toastHeader.addClass('bg-info');
                break;
        }

        toastBody.text(message);

        const bsToast = new bootstrap.Toast(toast[0]);
        bsToast.show();
    },

    /**
     * Show confirmation dialog
     */
    confirm(message, callback) {
        if (confirm(message)) {
            callback();
        }
    },

    /**
     * Download file
     */
    downloadFile(content, filename, contentType = 'text/plain') {
        const blob = new Blob([content], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    },

    /**
     * Download JSON file
     */
    downloadJSON(data, filename) {
        const json = JSON.stringify(data, null, 2);
        this.downloadFile(json, filename, 'application/json');
    },

    /**
     * Download CSV file
     */
    downloadCSV(data, filename) {
        this.downloadFile(data, filename, 'text/csv');
    },

    /**
     * Convert array to CSV
     */
    arrayToCSV(array) {
        if (!array || array.length === 0) return '';

        const headers = Object.keys(array[0]);
        const csvRows = [];

        // Add headers
        csvRows.push(headers.join(','));

        // Add rows
        for (const row of array) {
            const values = headers.map(header => {
                const val = row[header];
                // Escape quotes and wrap in quotes if contains comma
                const escaped = ('' + val).replace(/"/g, '""');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }

        return csvRows.join('\n');
    },

    /**
     * Debounce function
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Get start of week
     */
    getStartOfWeek(date = new Date(), startDay = 1) {
        const d = dayjs(date);
        const day = d.day();
        const diff = (day < startDay ? 7 : 0) + day - startDay;
        return d.subtract(diff, 'day').startOf('day');
    },

    /**
     * Get end of week
     */
    getEndOfWeek(date = new Date(), startDay = 1) {
        return this.getStartOfWeek(date, startDay).add(6, 'day').endOf('day');
    },

    /**
     * Get date range for filter
     */
    getDateRange(filter, startOfWeek = 1) {
        const now = dayjs();
        let start, end;

        switch (filter) {
            case 'today':
                start = now.startOf('day');
                end = now.endOf('day');
                break;
            case 'week':
                start = this.getStartOfWeek(now, startOfWeek);
                end = this.getEndOfWeek(now, startOfWeek);
                break;
            case 'month':
                start = now.startOf('month');
                end = now.endOf('month');
                break;
            default:
                start = now.startOf('month');
                end = now.endOf('month');
        }

        return { start: start.toDate(), end: end.toDate() };
    },

    /**
     * Filter expenses by date range
     */
    filterExpensesByDateRange(expenses, startDate, endDate) {
        const start = dayjs(startDate).startOf('day');
        const end = dayjs(endDate).endOf('day');

        return expenses.filter(expense => {
            const expenseDate = dayjs(expense.date);
            return expenseDate.isAfter(start) && expenseDate.isBefore(end) ||
                   expenseDate.isSame(start, 'day') || expenseDate.isSame(end, 'day');
        });
    },

    /**
     * Filter expenses by category
     */
    filterExpensesByCategory(expenses, category) {
        if (!category) return expenses;
        return expenses.filter(expense => expense.category === category);
    },

    /**
     * Sort expenses
     */
    sortExpenses(expenses, sortBy = 'date', order = 'desc') {
        return expenses.sort((a, b) => {
            let aVal, bVal;

            switch (sortBy) {
                case 'date':
                    aVal = new Date(a.date);
                    bVal = new Date(b.date);
                    break;
                case 'amount':
                    aVal = parseFloat(a.amount);
                    bVal = parseFloat(b.amount);
                    break;
                case 'item':
                    aVal = a.item.toLowerCase();
                    bVal = b.item.toLowerCase();
                    break;
                default:
                    aVal = new Date(a.date);
                    bVal = new Date(b.date);
            }

            if (order === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    },

    /**
     * Check if bill is due soon (within 3 days)
     */
    isBillDueSoon(dueDate) {
        const today = dayjs();
        const currentDay = today.date();
        const daysInMonth = today.daysInMonth();

        // Handle edge case where due date is in next month
        if (dueDate < currentDay && currentDay > 25) {
            // Bill is in next month
            return false;
        }

        const daysUntilDue = dueDate - currentDay;
        return daysUntilDue >= 0 && daysUntilDue <= 3;
    },

    /**
     * Check if bill is overdue
     */
    isBillOverdue(dueDate) {
        const today = dayjs();
        const currentDay = today.date();

        // Handle month wrap-around
        if (dueDate < currentDay && currentDay <= 25) {
            return true;
        }

        return false;
    },

    /**
     * Get bill status
     */
    getBillStatus(bill, isPaid) {
        if (isPaid) return 'paid';
        if (this.isBillOverdue(bill.dueDate)) return 'overdue';
        if (this.isBillDueSoon(bill.dueDate)) return 'due-soon';
        return 'pending';
    },

    /**
     * Animate number
     */
    animateNumber(element, from, to, duration = 1000) {
        const $element = $(element);
        const diff = to - from;
        const increment = diff / (duration / 16); // 60fps
        let current = from;

        const animate = () => {
            current += increment;
            if ((increment > 0 && current >= to) || (increment < 0 && current <= to)) {
                $element.text(Math.round(to));
            } else {
                $element.text(Math.round(current));
                requestAnimationFrame(animate);
            }
        };

        animate();
    },

    /**
     * Update currency symbols throughout the page
     */
    updateCurrencySymbols(symbol) {
        $('.currency').text(symbol);
    },

    /**
     * Validate form data
     */
    validateExpenseForm(data) {
        const errors = [];

        if (!data.item || data.item.trim() === '') {
            errors.push('Item name is required');
        }

        if (!data.amount || parseFloat(data.amount) <= 0) {
            errors.push('Amount must be greater than 0');
        }

        if (!data.category) {
            errors.push('Category is required');
        }

        if (!data.paymentMode) {
            errors.push('Payment mode is required');
        }

        if (!data.date) {
            errors.push('Date is required');
        }

        return errors;
    },

    /**
     * Validate bill form data
     */
    validateBillForm(data) {
        const errors = [];

        if (!data.name || data.name.trim() === '') {
            errors.push('Bill name is required');
        }

        if (!data.amount || parseFloat(data.amount) <= 0) {
            errors.push('Amount must be greater than 0');
        }

        if (!data.dueDate || data.dueDate < 1 || data.dueDate > 31) {
            errors.push('Due date must be between 1 and 31');
        }

        if (!data.category) {
            errors.push('Category is required');
        }

        return errors;
    },

    /**
     * Sanitize HTML to prevent XSS
     */
    sanitize(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },

    /**
     * Truncate text
     */
    truncate(str, length = 50) {
        if (str.length <= length) return str;
        return str.substr(0, length) + '...';
    },

    /**
     * Get greeting based on time of day
     */
    getGreeting() {
        const hour = dayjs().hour();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    },

    /**
     * Calculate percentage
     */
    calculatePercentage(value, total) {
        if (total === 0) return 0;
        return ((value / total) * 100).toFixed(2);
    },

    /**
     * Group expenses by category
     */
    groupByCategory(expenses) {
        return expenses.reduce((acc, expense) => {
            const category = expense.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(expense);
            return acc;
        }, {});
    },

    /**
     * Group expenses by payment mode
     */
    groupByPaymentMode(expenses) {
        return expenses.reduce((acc, expense) => {
            const mode = expense.paymentMode;
            if (!acc[mode]) {
                acc[mode] = [];
            }
            acc[mode].push(expense);
            return acc;
        }, {});
    },

    /**
     * Get local storage size in MB
     */
    getLocalStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return (total / 1024 / 1024).toFixed(2);
    }
};
