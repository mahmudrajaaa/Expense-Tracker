/**
 * Main Application - Expense Tracker
 */

// Initialize Day.js plugins
dayjs.extend(window.dayjs_plugin_isoWeek);
dayjs.extend(window.dayjs_plugin_weekOfYear);

const App = {
    currentPage: 'dashboard',
    currentExpenseId: null,
    currentBillId: null,
    filters: {
        category: '',
        dateRange: 'month',
        customStart: null,
        customEnd: null
    },

    /**
     * Initialize the application
     */
    init() {
        console.log('Initializing Expense Tracker...');

        // Set up event listeners
        this.setupEventListeners();

        // Load settings and update UI
        this.loadSettings();

        // Update welcome message
        this.updateWelcomeMessage();

        // Load dashboard
        this.loadDashboard();

        // Check for month-end report
        this.checkMonthEndReport();

        // Set default date/time in expense form
        this.setDefaultDateTime();

        console.log('App initialized successfully!');
    },

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Navigation
        $('.nav-link[data-page]').on('click', (e) => {
            e.preventDefault();
            const page = $(e.currentTarget).data('page');
            this.navigateToPage(page);
        });

        // FAB - Add Expense
        $('#fabAddExpense').on('click', () => {
            this.openExpenseModal();
        });

        // Expense Form
        $('#saveExpenseBtn').on('click', () => {
            this.saveExpense(false);
        });

        $('#saveAndNewBtn').on('click', () => {
            this.saveExpense(true);
        });

        // Bill Form
        $('#addBillBtn').on('click', () => {
            this.openBillModal();
        });

        $('#saveBillBtn').on('click', () => {
            this.saveBill();
        });

        // Filters
        $('#filterToggle').on('click', () => {
            $('#filterSection').slideToggle();
        });

        $('#filterCategory').on('change', (e) => {
            this.filters.category = $(e.target).val();
            this.applyFilters();
        });

        $('#filterDateRange').on('change', (e) => {
            const range = $(e.target).val();
            this.filters.dateRange = range;
            if (range === 'custom') {
                $('#customDateRange').show();
            } else {
                $('#customDateRange').hide();
                this.applyFilters();
            }
        });

        $('#customStartDate, #customEndDate').on('change', () => {
            this.filters.customStart = $('#customStartDate').val();
            this.filters.customEnd = $('#customEndDate').val();
            if (this.filters.customStart && this.filters.customEnd) {
                this.applyFilters();
            }
        });

        // Reports
        $('#reportMonth').on('change', () => {
            this.loadReports();
        });

        $('#exportPdfBtn').on('click', () => {
            this.exportPDF();
        });

        $('#exportCsvBtn').on('click', () => {
            this.exportCSV();
        });

        // Settings
        $('#saveSettingsBtn').on('click', () => {
            this.saveSettings();
        });

        $('#exportAllDataBtn').on('click', () => {
            Reports.exportAllData();
            Utils.showToast('All data exported successfully!');
        });

        $('#clearAllDataBtn').on('click', () => {
            this.clearAllData();
        });

        // Modal events
        $('#addExpenseModal').on('hidden.bs.modal', () => {
            this.resetExpenseForm();
        });

        $('#addBillModal').on('hidden.bs.modal', () => {
            this.resetBillForm();
        });
    },

    /**
     * Navigate to a page
     */
    navigateToPage(page) {
        // Update navigation
        $('.nav-link').removeClass('active');
        $(`.nav-link[data-page="${page}"]`).addClass('active');

        // Hide all pages
        $('.page').removeClass('active').hide();

        // Show target page
        $(`#${page}Page`).addClass('active').show();

        this.currentPage = page;

        // Load page-specific content
        switch (page) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'bills':
                this.loadBills();
                break;
            case 'reports':
                this.loadReports();
                break;
            case 'settings':
                this.loadSettingsPage();
                break;
        }
    },

    /**
     * Update welcome message
     */
    updateWelcomeMessage() {
        const greeting = Utils.getGreeting();
        const today = dayjs().format('dddd, MMMM DD, YYYY');
        $('#welcomeMessage').text(`${greeting}!`);
        $('#currentDate').text(today);
    },

    /**
     * Set default date/time in expense form
     */
    setDefaultDateTime() {
        const now = dayjs().format('YYYY-MM-DDTHH:mm');
        $('#expenseDateTime').val(now);
    },

    /**
     * Load dashboard
     */
    loadDashboard() {
        const expenses = Storage.getExpenses();
        const settings = Storage.getSettings();

        // Update currency symbols
        Utils.updateCurrencySymbols(settings.currency);

        // Today's Summary
        this.updateTodaySummary(expenses);

        // This Week's Summary
        this.updateWeekSummary(expenses, settings.startOfWeek);

        // This Month's Summary
        this.updateMonthSummary(expenses, settings.monthlyBudget);

        // Recent Transactions
        this.loadTransactions();

        // Update pending bills badge
        this.updatePendingBillsBadge();
    },

    /**
     * Update today's summary
     */
    updateTodaySummary(expenses) {
        const todayExpenses = Calculator.getTodayExpenses(expenses);
        const total = Calculator.calculateTotal(todayExpenses);
        const count = todayExpenses.length;

        $('#todayTotal').text(total.toFixed(2));
        $('#todayCount').text(count);

        // Category breakdown
        const breakdown = Calculator.getCategoryBreakdown(todayExpenses, 3);
        const breakdownHtml = breakdown.map(item => `
            <div class="category-bar">
                <div class="category-bar-label">
                    <span>${item.category.charAt(0).toUpperCase() + item.category.slice(1)}</span>
                    <span>${item.percentage}%</span>
                </div>
                <div class="category-bar-progress">
                    <div class="category-bar-fill cat-${item.category}" style="width: ${item.percentage}%"></div>
                </div>
            </div>
        `).join('');

        $('#todayCategoryBreakdown').html(breakdownHtml || '<p class="text-muted small">No expenses today</p>');
    },

    /**
     * Update week summary
     */
    updateWeekSummary(expenses, startOfWeek) {
        const weekExpenses = Calculator.getWeekExpenses(expenses, startOfWeek);
        const total = Calculator.calculateTotal(weekExpenses);
        const avg = Calculator.calculateDailyAverage(weekExpenses, 7);

        $('#weekTotal').text(total.toFixed(2));
        $('#weekAvg').text(avg.toFixed(2));

        // Week chart
        Charts.createWeekChart('weekChart', expenses, startOfWeek);
    },

    /**
     * Update month summary
     */
    updateMonthSummary(expenses, budget) {
        const monthExpenses = Calculator.getMonthExpenses(expenses);
        const total = Calculator.calculateTotal(monthExpenses);
        const remaining = Calculator.calculateRemainingBudget(total, budget);
        const progress = Calculator.calculateBudgetProgress(total, budget);

        $('#monthTotal').text(total.toFixed(2));
        $('#monthBudget').text(budget.toFixed(2));
        $('#budgetRemaining').text(remaining.toFixed(2));

        // Update progress bar
        const progressBar = $('#budgetProgress');
        progressBar.css('width', progress + '%');

        // Change color based on progress
        progressBar.removeClass('bg-success bg-warning bg-danger');
        if (progress < 70) {
            progressBar.addClass('bg-success');
        } else if (progress < 90) {
            progressBar.addClass('bg-warning');
        } else {
            progressBar.addClass('bg-danger');
        }

        progressBar.text(progress.toFixed(1) + '%');

        // Top categories
        const topCategories = Calculator.getTopCategories(monthExpenses, 3);
        const topHtml = topCategories.map(item => `
            <div class="top-category">
                <div class="top-category-name">
                    <div class="top-category-icon ${Utils.getCategoryColorClass(item.category)}">
                        <i class="${Utils.getCategoryIcon(item.category)}"></i>
                    </div>
                    <span>${item.category.charAt(0).toUpperCase() + item.category.slice(1)}</span>
                </div>
                <div>
                    <div class="top-category-amount">₹${item.amount.toFixed(2)}</div>
                    <div class="top-category-percentage">${item.percentage}%</div>
                </div>
            </div>
        `).join('');

        $('#topCategories').html(topHtml || '<p class="text-muted small">No expenses this month</p>');
    },

    /**
     * Load transactions
     */
    loadTransactions() {
        const expenses = Storage.getExpenses();

        // Apply filters
        let filtered = this.applyFiltersToExpenses(expenses);

        // Sort by date descending
        filtered = Utils.sortExpenses(filtered, 'date', 'desc');

        // Limit to 20
        filtered = filtered.slice(0, 20);

        this.renderTransactions(filtered);
    },

    /**
     * Apply filters to expenses
     */
    applyFiltersToExpenses(expenses) {
        let filtered = [...expenses];

        // Category filter
        if (this.filters.category) {
            filtered = Utils.filterExpensesByCategory(filtered, this.filters.category);
        }

        // Date range filter
        if (this.filters.dateRange === 'custom' && this.filters.customStart && this.filters.customEnd) {
            filtered = Utils.filterExpensesByDateRange(filtered, this.filters.customStart, this.filters.customEnd);
        } else {
            const settings = Storage.getSettings();
            const range = Utils.getDateRange(this.filters.dateRange, settings.startOfWeek);
            filtered = Utils.filterExpensesByDateRange(filtered, range.start, range.end);
        }

        return filtered;
    },

    /**
     * Apply filters
     */
    applyFilters() {
        this.loadTransactions();
    },

    /**
     * Render transactions list
     */
    renderTransactions(expenses) {
        if (expenses.length === 0) {
            $('#transactionsList').html('<p class="text-center text-muted">No transactions found.</p>');
            return;
        }

        const html = expenses.map(expense => `
            <div class="transaction-item">
                <div class="transaction-icon ${Utils.getCategoryColorClass(expense.category)}">
                    <i class="${Utils.getCategoryIcon(expense.category)}"></i>
                </div>
                <div class="transaction-details">
                    <div class="transaction-item-name">${Utils.sanitize(expense.item)}</div>
                    <div class="transaction-meta">
                        <span class="badge ${Utils.getCategoryColorClass(expense.category)}">${expense.category}</span>
                        <span><i class="${Utils.getPaymentModeIcon(expense.paymentMode)}"></i> ${expense.paymentMode.toUpperCase()}</span>
                        <span><i class="bi bi-clock"></i> ${Utils.formatRelativeTime(expense.date)}</span>
                    </div>
                </div>
                <div class="transaction-amount">₹${parseFloat(expense.amount).toFixed(2)}</div>
                <div class="transaction-actions">
                    <button class="btn btn-sm btn-outline-primary" onclick="App.editExpense('${expense.id}')" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="App.deleteExpense('${expense.id}')" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        $('#transactionsList').html(html);
    },

    /**
     * Open expense modal
     */
    openExpenseModal(expenseId = null) {
        this.currentExpenseId = expenseId;

        if (expenseId) {
            // Edit mode
            const expense = Storage.getExpenseById(expenseId);
            if (!expense) return;

            $('.modal-title').html('<i class="bi bi-pencil"></i> Edit Expense');
            $('#expenseId').val(expense.id);
            $('#expenseItem').val(expense.item);
            $('#expenseAmount').val(expense.amount);
            $(`input[name="category"][value="${expense.category}"]`).prop('checked', true);
            $(`input[name="paymentMode"][value="${expense.paymentMode}"]`).prop('checked', true);
            $('#expenseDateTime').val(dayjs(expense.date).format('YYYY-MM-DDTHH:mm'));
            $('#expenseNotes').val(expense.notes || '');
        } else {
            // Create mode
            $('.modal-title').html('<i class="bi bi-plus-circle"></i> Add Expense');
            this.resetExpenseForm();
            this.setDefaultDateTime();
        }

        const modal = new bootstrap.Modal(document.getElementById('addExpenseModal'));
        modal.show();
    },

    /**
     * Save expense
     */
    saveExpense(addAnother = false) {
        const formData = {
            id: $('#expenseId').val() || null,
            item: $('#expenseItem').val().trim(),
            amount: parseFloat($('#expenseAmount').val()),
            category: $('input[name="category"]:checked').val(),
            paymentMode: $('input[name="paymentMode"]:checked').val(),
            date: $('#expenseDateTime').val(),
            notes: $('#expenseNotes').val().trim()
        };

        // Validate
        const errors = Utils.validateExpenseForm(formData);
        if (errors.length > 0) {
            Utils.showToast(errors.join(', '), 'error');
            return;
        }

        try {
            if (formData.id) {
                // Update existing
                Storage.updateExpense(formData);
                Utils.showToast('Expense updated successfully!');
            } else {
                // Create new
                delete formData.id;
                Storage.saveExpense(formData);
                Utils.showToast('Expense added successfully!');
            }

            // Reload dashboard
            this.loadDashboard();

            if (addAnother) {
                // Reset form for next entry
                this.resetExpenseForm();
                this.setDefaultDateTime();
                $('#expenseItem').focus();
            } else {
                // Close modal
                bootstrap.Modal.getInstance(document.getElementById('addExpenseModal')).hide();
            }
        } catch (error) {
            Utils.showToast(error.message, 'error');
        }
    },

    /**
     * Edit expense
     */
    editExpense(id) {
        this.openExpenseModal(id);
    },

    /**
     * Delete expense
     */
    deleteExpense(id) {
        Utils.confirm('Are you sure you want to delete this expense?', () => {
            Storage.deleteExpense(id);
            Utils.showToast('Expense deleted successfully!');
            this.loadDashboard();
        });
    },

    /**
     * Reset expense form
     */
    resetExpenseForm() {
        $('#expenseForm')[0].reset();
        $('#expenseId').val('');
        this.currentExpenseId = null;
    },

    /**
     * Load bills
     */
    loadBills() {
        const bills = Storage.getBillsConfig() || [];
        const paidBills = Storage.getPaidBills();

        // Update stats
        const stats = Calculator.calculateBillStats(bills, paidBills);
        $('#totalBillsCount').text(stats.total);
        $('#paidBillsCount').text(stats.paid);
        $('#pendingBillsCount').text(stats.pending);
        $('#totalBillsAmount').text(stats.totalAmount.toFixed(2));

        // Render bills
        this.renderBills(bills, paidBills);

        // Update badge
        this.updatePendingBillsBadge();
    },

    /**
     * Render bills list
     */
    renderBills(bills, paidBills) {
        if (bills.length === 0) {
            $('#billsList').html('<p class="text-center text-muted">No bills configured.</p>');
            return;
        }

        const html = bills.map(bill => {
            const isPaid = Storage.isBillPaid(bill.name);
            const status = Utils.getBillStatus(bill, isPaid);
            const statusText = isPaid ? 'Paid' : (status === 'overdue' ? 'Overdue' : 'Pending');
            const statusIcon = isPaid ? 'bi-check-circle' : (status === 'overdue' ? 'bi-exclamation-triangle' : 'bi-clock');

            return `
                <div class="card bill-card ${status}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h5 class="card-title mb-1">${Utils.sanitize(bill.name)}</h5>
                                <p class="mb-2">
                                    <strong>₹${parseFloat(bill.amount).toFixed(2)}</strong>
                                    <span class="text-muted ms-2">Due: ${bill.dueDate}${Utils.getDaySuffix(bill.dueDate)} of month</span>
                                </p>
                                <span class="bill-status ${status}">
                                    <i class="${statusIcon}"></i> ${statusText}
                                </span>
                            </div>
                            <div class="btn-group">
                                ${!isPaid ? `
                                    <button class="btn btn-sm btn-success" onclick="App.markBillAsPaid('${bill.id}')">
                                        <i class="bi bi-check"></i> Mark Paid
                                    </button>
                                ` : ''}
                                <button class="btn btn-sm btn-outline-primary" onclick="App.editBill('${bill.id}')">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="App.deleteBill('${bill.id}')">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        $('#billsList').html(html);
    },

    /**
     * Open bill modal
     */
    openBillModal(billId = null) {
        this.currentBillId = billId;

        if (billId) {
            // Edit mode
            const bills = Storage.getBillsConfig();
            const bill = bills.find(b => b.id === billId);
            if (!bill) return;

            $('.modal-title').html('<i class="bi bi-pencil"></i> Edit Bill');
            $('#billId').val(bill.id);
            $('#billName').val(bill.name);
            $('#billAmount').val(bill.amount);
            $('#billDueDate').val(bill.dueDate);
            $('#billCategory').val(bill.category);
        } else {
            // Create mode
            $('.modal-title').html('<i class="bi bi-plus-circle"></i> Add Bill');
            this.resetBillForm();
        }

        const modal = new bootstrap.Modal(document.getElementById('addBillModal'));
        modal.show();
    },

    /**
     * Save bill
     */
    saveBill() {
        const formData = {
            id: $('#billId').val() || null,
            name: $('#billName').val().trim(),
            amount: parseFloat($('#billAmount').val()),
            dueDate: parseInt($('#billDueDate').val()),
            category: $('#billCategory').val()
        };

        // Validate
        const errors = Utils.validateBillForm(formData);
        if (errors.length > 0) {
            Utils.showToast(errors.join(', '), 'error');
            return;
        }

        try {
            if (formData.id) {
                // Update existing
                Storage.updateBill(formData);
                Utils.showToast('Bill updated successfully!');
            } else {
                // Create new
                delete formData.id;
                Storage.addBill(formData);
                Utils.showToast('Bill added successfully!');
            }

            // Reload bills
            this.loadBills();

            // Close modal
            bootstrap.Modal.getInstance(document.getElementById('addBillModal')).hide();
        } catch (error) {
            Utils.showToast(error.message, 'error');
        }
    },

    /**
     * Edit bill
     */
    editBill(id) {
        this.openBillModal(id);
    },

    /**
     * Delete bill
     */
    deleteBill(id) {
        Utils.confirm('Are you sure you want to delete this bill?', () => {
            Storage.deleteBill(id);
            Utils.showToast('Bill deleted successfully!');
            this.loadBills();
        });
    },

    /**
     * Mark bill as paid
     */
    markBillAsPaid(billId) {
        const bills = Storage.getBillsConfig();
        const bill = bills.find(b => b.id === billId);
        if (!bill) return;

        // Create expense entry
        const expenseData = {
            item: bill.name,
            amount: bill.amount,
            category: bill.category,
            paymentMode: 'upi', // Default to UPI
            date: dayjs().format('YYYY-MM-DDTHH:mm'),
            notes: 'Bill payment'
        };

        try {
            Storage.saveExpense(expenseData);
            Storage.markBillAsPaid(bill.name, new Date().toISOString(), bill.amount, 'upi');
            Utils.showToast(`${bill.name} marked as paid and added to expenses!`);
            this.loadBills();
            this.loadDashboard();
        } catch (error) {
            Utils.showToast(error.message, 'error');
        }
    },

    /**
     * Reset bill form
     */
    resetBillForm() {
        $('#billForm')[0].reset();
        $('#billId').val('');
        this.currentBillId = null;
    },

    /**
     * Update pending bills badge
     */
    updatePendingBillsBadge() {
        const bills = Storage.getBillsConfig() || [];
        const paidBills = Storage.getPaidBills();
        const stats = Calculator.calculateBillStats(bills, paidBills);

        const badge = $('#pendingBillsBadge');
        if (stats.pending > 0) {
            badge.text(stats.pending).show().addClass('pulse');
        } else {
            badge.text('0').hide().removeClass('pulse');
        }
    },

    /**
     * Load reports
     */
    loadReports() {
        // Populate month selector if empty
        if ($('#reportMonth option').length === 0) {
            const months = Storage.getAvailableMonths();
            const options = months.map(m =>
                `<option value="${m.key}">${m.label}</option>`
            ).join('');
            $('#reportMonth').html(options || '<option>No data available</option>');
        }

        const selectedKey = $('#reportMonth').val();
        if (!selectedKey) return;

        const parts = selectedKey.split('_');
        const year = parts[1];
        const month = parts[2];

        const expenses = Storage.getExpensesByMonth(year, month);
        const paidBills = Storage.getPaidBillsByMonth(year, month);
        const bills = Storage.getBillsConfig() || [];
        const settings = Storage.getSettings();

        // Update summary
        const total = Calculator.calculateTotal(expenses);
        const budget = settings.monthlyBudget;
        const savings = budget - total;

        $('#reportTotal').text(total.toFixed(2));
        $('#reportBudget').text(budget.toFixed(2));
        $('#reportSavings').text(Math.abs(savings).toFixed(2));
        $('#reportTransactionCount').text(expenses.length);

        // Update savings label
        if (savings >= 0) {
            $('#savingsLabel').text('Saved');
            $('#reportSavings').parent().find('h3').removeClass('text-danger').addClass('text-success');
        } else {
            $('#savingsLabel').text('Overspent');
            $('#reportSavings').parent().find('h3').removeClass('text-success').addClass('text-danger');
        }

        // Category pie chart
        Charts.createCategoryPieChart('categoryPieChart', expenses);

        // Category table
        this.renderCategoryTable(expenses, total);

        // Payment mode chart
        Charts.createPaymentModeChart('paymentModeChart', expenses);

        // Bill payment status
        this.renderBillPaymentStatus(bills, paidBills);

        // Insights
        this.renderInsights(expenses, budget);
    },

    /**
     * Render category table
     */
    renderCategoryTable(expenses, total) {
        const categoryTotals = Calculator.calculateCategoryTotals(expenses);
        const categories = Object.keys(categoryTotals).map(cat => ({
            category: cat,
            amount: categoryTotals[cat],
            percentage: Utils.calculatePercentage(categoryTotals[cat], total)
        }));

        categories.sort((a, b) => b.amount - a.amount);

        const html = `
            <table class="report-table">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    ${categories.map(cat => `
                        <tr>
                            <td>
                                <span class="badge ${Utils.getCategoryColorClass(cat.category)}">
                                    ${cat.category.charAt(0).toUpperCase() + cat.category.slice(1)}
                                </span>
                            </td>
                            <td>₹${cat.amount.toFixed(2)}</td>
                            <td>${cat.percentage}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        $('#categoryTable').html(html);
    },

    /**
     * Render bill payment status
     */
    renderBillPaymentStatus(bills, paidBills) {
        const stats = Calculator.calculateBillStats(bills, paidBills);
        const pendingBills = Calculator.getPendingBills(bills, paidBills);
        const overdueBills = Calculator.getOverdueBills(bills, paidBills);

        const html = `
            <div class="mb-3">
                <div class="row text-center">
                    <div class="col-4">
                        <h4 class="text-success">${stats.paid}</h4>
                        <small>Paid</small>
                    </div>
                    <div class="col-4">
                        <h4 class="text-warning">${stats.pending}</h4>
                        <small>Pending</small>
                    </div>
                    <div class="col-4">
                        <h4 class="text-danger">${overdueBills.length}</h4>
                        <small>Overdue</small>
                    </div>
                </div>
            </div>
            ${overdueBills.length > 0 ? `
                <div class="alert alert-danger">
                    <strong>Overdue Bills:</strong>
                    <ul class="mb-0 mt-2">
                        ${overdueBills.map(bill => `
                            <li>${bill.name} - ₹${bill.amount.toFixed(2)}</li>
                        `).join('')}
                    </ul>
                </div>
            ` : ''}
            ${pendingBills.length > 0 ? `
                <div class="alert alert-warning">
                    <strong>Pending Bills:</strong>
                    <ul class="mb-0 mt-2">
                        ${pendingBills.map(bill => `
                            <li>${bill.name} - ₹${bill.amount.toFixed(2)} (Due: ${bill.dueDate}${Utils.getDaySuffix(bill.dueDate)})</li>
                        `).join('')}
                    </ul>
                </div>
            ` : ''}
        `;

        $('#billPaymentStatus').html(html);
    },

    /**
     * Render insights
     */
    renderInsights(expenses, budget) {
        const insights = Calculator.calculateInsights(expenses);
        const suggestions = Calculator.generateSavingsSuggestions(expenses, budget);

        const html = [...insights, ...suggestions].map(item => `
            <div class="insight-item">
                <i class="${item.icon}"></i>
                ${item.text}
            </div>
        `).join('');

        $('#insightsSection').html(html || '<p class="text-muted">No insights available.</p>');
    },

    /**
     * Export PDF
     */
    async exportPDF() {
        const selectedKey = $('#reportMonth').val();
        if (!selectedKey) {
            Utils.showToast('Please select a month', 'warning');
            return;
        }

        const parts = selectedKey.split('_');
        const year = parts[1];
        const month = parts[2];
        const expenses = Storage.getExpensesByMonth(year, month);
        const monthLabel = dayjs(`${year}-${month}-01`).format('MMMM YYYY');

        Utils.showToast('Generating PDF report...', 'info');

        const success = await Reports.generatePDF(expenses, monthLabel);
        if (success) {
            Utils.showToast('PDF report downloaded successfully!');
        }
    },

    /**
     * Export CSV
     */
    exportCSV() {
        const selectedKey = $('#reportMonth').val();
        if (!selectedKey) {
            Utils.showToast('Please select a month', 'warning');
            return;
        }

        const parts = selectedKey.split('_');
        const year = parts[1];
        const month = parts[2];
        const expenses = Storage.getExpensesByMonth(year, month);
        const monthLabel = dayjs(`${year}-${month}-01`).format('MMMM-YYYY');

        Reports.exportCSV(expenses, monthLabel);
        Utils.showToast('CSV report downloaded successfully!');
    },

    /**
     * Load settings page
     */
    loadSettingsPage() {
        const settings = Storage.getSettings();

        $('#settingBudget').val(settings.monthlyBudget);
        $('#settingCurrency').val(settings.currency);
        $('#settingStartOfWeek').val(settings.startOfWeek);
        $('#settingNotifications').prop('checked', settings.notifications);
    },

    /**
     * Save settings
     */
    saveSettings() {
        const settings = {
            monthlyBudget: parseFloat($('#settingBudget').val()),
            currency: $('#settingCurrency').val(),
            startOfWeek: parseInt($('#settingStartOfWeek').val()),
            notifications: $('#settingNotifications').is(':checked')
        };

        Storage.saveSettings(settings);
        Utils.showToast('Settings saved successfully!');

        // Update UI
        this.loadSettings();
        this.loadDashboard();
    },

    /**
     * Load settings
     */
    loadSettings() {
        const settings = Storage.getSettings();
        Utils.updateCurrencySymbols(settings.currency);
    },

    /**
     * Clear all data
     */
    clearAllData() {
        Utils.confirm('Are you sure you want to clear all data? This action cannot be undone. A backup will be created.', () => {
            Storage.clearAllData();
            Utils.showToast('All data cleared successfully!');
            this.loadDashboard();
            this.navigateToPage('dashboard');
        });
    },

    /**
     * Check for month-end report
     */
    checkMonthEndReport() {
        const reportFlag = Storage.getMonthEndReportFlag();
        if (reportFlag) {
            const summary = Reports.generateMonthEndSummary(reportFlag.key);

            const message = `
                <h5>Month-End Report: ${summary.month}</h5>
                <p><strong>Total Spent:</strong> ₹${summary.total.toFixed(2)}</p>
                <p><strong>Budget:</strong> ₹${summary.budget.toFixed(2)}</p>
                <p><strong>${summary.saved >= 0 ? 'Saved' : 'Overspent'}:</strong> ₹${Math.abs(summary.saved).toFixed(2)}</p>
                <p><strong>Transactions:</strong> ${summary.transactionCount}</p>
            `;

            // Show alert
            alert(message.replace(/<[^>]*>/g, '\n'));

            // Clear flag
            Storage.clearMonthEndReportFlag();
        }
    }
};

// Helper function for day suffix
Utils.getDaySuffix = function(day) {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
};

// Initialize app when DOM is ready
$(document).ready(() => {
    App.init();
});
