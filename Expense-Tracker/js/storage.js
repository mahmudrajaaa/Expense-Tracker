/**
 * Storage Module - Handles all localStorage operations
 * Data Structure:
 * - expenses_YYYY_MM: Array of expense objects
 * - bills_config: Array of bill configuration objects
 * - bills_paid_YYYY_MM: Array of paid bills for the month
 * - settings: Settings object
 */

const Storage = {
    /**
     * Get current month key for expenses
     */
    getCurrentMonthKey() {
        return `expenses_${dayjs().format('YYYY_MM')}`;
    },

    /**
     * Get month key for a specific date
     */
    getMonthKey(date) {
        return `expenses_${dayjs(date).format('YYYY_MM')}`;
    },

    /**
     * Get current month key for paid bills
     */
    getBillsPaidKey() {
        return `bills_paid_${dayjs().format('YYYY_MM')}`;
    },

    /**
     * Get paid bills key for a specific date
     */
    getBillsPaidKeyForDate(date) {
        return `bills_paid_${dayjs(date).format('YYYY_MM')}`;
    },

    /**
     * Initialize default data if not exists
     */
    init() {
        // Initialize settings if not exists
        if (!this.getSettings()) {
            this.saveSettings({
                monthlyBudget: 50000,
                currency: '₹',
                startOfWeek: 1, // Monday
                notifications: true
            });
        }

        // Initialize default bills if not exists
        if (!this.getBillsConfig()) {
            this.initializeDefaultBills();
        }

        // Check for month rollover
        this.checkMonthRollover();
    },

    /**
     * Initialize default bills
     */
    initializeDefaultBills() {
        const defaultBills = [
            { id: this.generateId(), name: 'Rent', amount: 15000, dueDate: 5, category: 'bills' },
            { id: this.generateId(), name: 'EB Bill', amount: 800, dueDate: 10, category: 'bills' },
            { id: this.generateId(), name: 'WiFi', amount: 599, dueDate: 15, category: 'bills' },
            { id: this.generateId(), name: 'Groceries', amount: 5000, dueDate: 30, category: 'groceries' },
            { id: this.generateId(), name: 'Home Loan EMI', amount: 12000, dueDate: 1, category: 'bills' },
            { id: this.generateId(), name: 'School Fees', amount: 8000, dueDate: 5, category: 'bills' },
            { id: this.generateId(), name: 'Netflix', amount: 649, dueDate: 20, category: 'personal' },
            { id: this.generateId(), name: 'Amazon Prime', amount: 299, dueDate: 12, category: 'personal' }
        ];
        this.saveBillsConfig(defaultBills);
    },

    /**
     * Check if it's a new month and handle rollover
     */
    checkMonthRollover() {
        const lastAccessDate = localStorage.getItem('last_access_date');
        const today = dayjs().format('YYYY-MM-DD');

        if (lastAccessDate) {
            const lastMonth = dayjs(lastAccessDate).format('YYYY-MM');
            const currentMonth = dayjs().format('YYYY-MM');

            if (lastMonth !== currentMonth) {
                // New month detected - archive and reset
                this.handleMonthRollover(lastAccessDate);
            }
        }

        localStorage.setItem('last_access_date', today);
    },

    /**
     * Handle month rollover
     */
    handleMonthRollover(lastDate) {
        const previousMonthKey = this.getMonthKey(lastDate);
        const previousBillsKey = this.getBillsPaidKeyForDate(lastDate);

        // Archive data (already in localStorage with date-specific keys)
        // Reset paid bills for new month (don't create until first bill is paid)

        // Flag for showing month-end report
        localStorage.setItem('show_month_end_report', JSON.stringify({
            month: dayjs(lastDate).format('MMMM YYYY'),
            key: previousMonthKey
        }));
    },

    /**
     * Get show month-end report flag
     */
    getMonthEndReportFlag() {
        const flag = localStorage.getItem('show_month_end_report');
        return flag ? JSON.parse(flag) : null;
    },

    /**
     * Clear month-end report flag
     */
    clearMonthEndReportFlag() {
        localStorage.removeItem('show_month_end_report');
    },

    /**
     * Generate unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Get all expenses for current month
     */
    getExpenses() {
        const key = this.getCurrentMonthKey();
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },

    /**
     * Get expenses for a specific month
     */
    getExpensesByMonth(year, month) {
        const key = `expenses_${year}_${String(month).padStart(2, '0')}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },

    /**
     * Save expense
     */
    saveExpense(expense) {
        const expenses = this.getExpenses();

        // Check for duplicate within 1 minute
        const now = Date.now();
        const duplicate = expenses.find(e =>
            e.item === expense.item &&
            e.amount === expense.amount &&
            Math.abs(e.timestamp - now) < 60000
        );

        if (duplicate) {
            throw new Error('Duplicate expense detected. Please wait a moment before adding the same expense again.');
        }

        expense.id = expense.id || this.generateId();
        expense.timestamp = expense.timestamp || now;

        expenses.push(expense);
        this.saveExpenses(expenses);
        return expense;
    },

    /**
     * Update expense
     */
    updateExpense(expense) {
        const expenses = this.getExpenses();
        const index = expenses.findIndex(e => e.id === expense.id);

        if (index === -1) {
            throw new Error('Expense not found');
        }

        expenses[index] = { ...expenses[index], ...expense };
        this.saveExpenses(expenses);
        return expenses[index];
    },

    /**
     * Delete expense
     */
    deleteExpense(id) {
        const expenses = this.getExpenses();
        const filtered = expenses.filter(e => e.id !== id);
        this.saveExpenses(filtered);
    },

    /**
     * Save all expenses
     */
    saveExpenses(expenses) {
        const key = this.getCurrentMonthKey();
        localStorage.setItem(key, JSON.stringify(expenses));
    },

    /**
     * Get expense by ID
     */
    getExpenseById(id) {
        const expenses = this.getExpenses();
        return expenses.find(e => e.id === id);
    },

    /**
     * Get bills configuration
     */
    getBillsConfig() {
        const data = localStorage.getItem('bills_config');
        return data ? JSON.parse(data) : null;
    },

    /**
     * Save bills configuration
     */
    saveBillsConfig(bills) {
        localStorage.setItem('bills_config', JSON.stringify(bills));
    },

    /**
     * Add bill to configuration
     */
    addBill(bill) {
        const bills = this.getBillsConfig() || [];
        bill.id = bill.id || this.generateId();
        bills.push(bill);
        this.saveBillsConfig(bills);
        return bill;
    },

    /**
     * Update bill in configuration
     */
    updateBill(bill) {
        const bills = this.getBillsConfig() || [];
        const index = bills.findIndex(b => b.id === bill.id);

        if (index === -1) {
            throw new Error('Bill not found');
        }

        bills[index] = { ...bills[index], ...bill };
        this.saveBillsConfig(bills);
        return bills[index];
    },

    /**
     * Delete bill from configuration
     */
    deleteBill(id) {
        const bills = this.getBillsConfig() || [];
        const filtered = bills.filter(b => b.id !== id);
        this.saveBillsConfig(filtered);
    },

    /**
     * Get paid bills for current month
     */
    getPaidBills() {
        const key = this.getBillsPaidKey();
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },

    /**
     * Get paid bills for specific month
     */
    getPaidBillsByMonth(year, month) {
        const key = `bills_paid_${year}_${String(month).padStart(2, '0')}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },

    /**
     * Mark bill as paid
     */
    markBillAsPaid(billName, paidDate, amount, paymentMode) {
        const paidBills = this.getPaidBills();
        const paidBill = {
            id: this.generateId(),
            billName,
            paidDate,
            amount,
            paymentMode,
            timestamp: Date.now()
        };
        paidBills.push(paidBill);

        const key = this.getBillsPaidKey();
        localStorage.setItem(key, JSON.stringify(paidBills));
        return paidBill;
    },

    /**
     * Check if bill is paid for current month
     */
    isBillPaid(billName) {
        const paidBills = this.getPaidBills();
        return paidBills.some(pb => pb.billName === billName);
    },

    /**
     * Get settings
     */
    getSettings() {
        const data = localStorage.getItem('settings');
        return data ? JSON.parse(data) : null;
    },

    /**
     * Save settings
     */
    saveSettings(settings) {
        localStorage.setItem('settings', JSON.stringify(settings));
    },

    /**
     * Export all data
     */
    exportAllData() {
        const allData = {
            settings: this.getSettings(),
            billsConfig: this.getBillsConfig(),
            expenses: {},
            billsPaid: {}
        };

        // Get all expense and bill payment data
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('expenses_')) {
                allData.expenses[key] = JSON.parse(localStorage.getItem(key));
            } else if (key.startsWith('bills_paid_')) {
                allData.billsPaid[key] = JSON.parse(localStorage.getItem(key));
            }
        }

        return allData;
    },

    /**
     * Import data
     */
    importData(data) {
        try {
            // Backup current data first
            this.backupData();

            // Import settings
            if (data.settings) {
                this.saveSettings(data.settings);
            }

            // Import bills config
            if (data.billsConfig) {
                this.saveBillsConfig(data.billsConfig);
            }

            // Import expenses
            if (data.expenses) {
                Object.keys(data.expenses).forEach(key => {
                    localStorage.setItem(key, JSON.stringify(data.expenses[key]));
                });
            }

            // Import paid bills
            if (data.billsPaid) {
                Object.keys(data.billsPaid).forEach(key => {
                    localStorage.setItem(key, JSON.stringify(data.billsPaid[key]));
                });
            }

            return true;
        } catch (error) {
            console.error('Import failed:', error);
            return false;
        }
    },

    /**
     * Backup data before dangerous operations
     */
    backupData() {
        const backup = this.exportAllData();
        localStorage.setItem('backup_' + Date.now(), JSON.stringify(backup));

        // Keep only last 3 backups
        const backupKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('backup_')) {
                backupKeys.push(key);
            }
        }
        backupKeys.sort().reverse();
        backupKeys.slice(3).forEach(key => localStorage.removeItem(key));
    },

    /**
     * Clear all data
     */
    clearAllData() {
        // Backup first
        this.backupData();

        // Clear all expense and bill data
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('expenses_') ||
                key.startsWith('bills_paid_') ||
                key === 'bills_config' ||
                key === 'settings' ||
                key === 'last_access_date') {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));

        // Reinitialize defaults
        this.init();
    },

    /**
     * Get available months with data
     */
    getAvailableMonths() {
        const months = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('expenses_')) {
                const parts = key.split('_');
                if (parts.length === 3) {
                    months.push({
                        year: parseInt(parts[1]),
                        month: parseInt(parts[2]),
                        key: key,
                        label: dayjs(`${parts[1]}-${parts[2]}-01`).format('MMMM YYYY')
                    });
                }
            }
        }
        // Sort by date descending
        months.sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.month - a.month;
        });
        return months;
    },

    /**
     * Validate localStorage availability
     */
    isLocalStorageAvailable() {
        try {
            const test = '__test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    },

    /**
     * Get storage usage statistics
     */
    getStorageStats() {
        let totalSize = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            totalSize += key.length + value.length;
        }
        return {
            totalSize: totalSize,
            totalSizeKB: (totalSize / 1024).toFixed(2),
            itemCount: localStorage.length,
            limit: 5 * 1024 * 1024, // 5MB typical limit
            usagePercentage: ((totalSize / (5 * 1024 * 1024)) * 100).toFixed(2)
        };
    }
};

// Initialize storage on load
if (typeof dayjs !== 'undefined') {
    $(document).ready(function() {
        if (Storage.isLocalStorageAvailable()) {
            Storage.init();
        } else {
            console.error('localStorage is not available');
            alert('Your browser does not support localStorage. The app may not work correctly.');
        }
    });
}
