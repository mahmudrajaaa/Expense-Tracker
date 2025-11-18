/**
 * Calculator Module - All calculations and aggregations
 */

const Calculator = {
    /**
     * Calculate total expenses
     */
    calculateTotal(expenses) {
        return expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    },

    /**
     * Get today's expenses
     */
    getTodayExpenses(expenses) {
        const today = dayjs().startOf('day');
        return expenses.filter(expense => {
            const expenseDate = dayjs(expense.date);
            return expenseDate.isSame(today, 'day');
        });
    },

    /**
     * Get this week's expenses
     */
    getWeekExpenses(expenses, startOfWeek = 1) {
        const start = Utils.getStartOfWeek(new Date(), startOfWeek);
        const end = Utils.getEndOfWeek(new Date(), startOfWeek);
        return Utils.filterExpensesByDateRange(expenses, start, end);
    },

    /**
     * Get this month's expenses
     */
    getMonthExpenses(expenses) {
        const start = dayjs().startOf('month');
        const end = dayjs().endOf('month');
        return Utils.filterExpensesByDateRange(expenses, start, end);
    },

    /**
     * Calculate category totals
     */
    calculateCategoryTotals(expenses) {
        const grouped = Utils.groupByCategory(expenses);
        const totals = {};

        Object.keys(grouped).forEach(category => {
            totals[category] = this.calculateTotal(grouped[category]);
        });

        return totals;
    },

    /**
     * Calculate payment mode totals
     */
    calculatePaymentModeTotals(expenses) {
        const grouped = Utils.groupByPaymentMode(expenses);
        const totals = {};

        Object.keys(grouped).forEach(mode => {
            totals[mode] = this.calculateTotal(grouped[mode]);
        });

        return totals;
    },

    /**
     * Get top categories
     */
    getTopCategories(expenses, limit = 3) {
        const categoryTotals = this.calculateCategoryTotals(expenses);
        const total = this.calculateTotal(expenses);

        // Convert to array and sort
        const categories = Object.keys(categoryTotals).map(category => ({
            category,
            amount: categoryTotals[category],
            percentage: Utils.calculatePercentage(categoryTotals[category], total)
        }));

        categories.sort((a, b) => b.amount - a.amount);

        return categories.slice(0, limit);
    },

    /**
     * Calculate daily totals for the week
     */
    getDailyTotalsForWeek(expenses, startOfWeek = 1) {
        const start = Utils.getStartOfWeek(new Date(), startOfWeek);
        const dailyTotals = {};

        // Initialize all days of the week with 0
        for (let i = 0; i < 7; i++) {
            const date = start.add(i, 'day').format('YYYY-MM-DD');
            dailyTotals[date] = 0;
        }

        // Calculate totals for each day
        expenses.forEach(expense => {
            const date = dayjs(expense.date).format('YYYY-MM-DD');
            if (dailyTotals.hasOwnProperty(date)) {
                dailyTotals[date] += parseFloat(expense.amount);
            }
        });

        return dailyTotals;
    },

    /**
     * Calculate daily average
     */
    calculateDailyAverage(expenses, days = 7) {
        const total = this.calculateTotal(expenses);
        return total / days;
    },

    /**
     * Calculate budget progress
     */
    calculateBudgetProgress(spent, budget) {
        if (budget === 0) return 0;
        const percentage = (spent / budget) * 100;
        return Math.min(percentage, 100); // Cap at 100%
    },

    /**
     * Calculate remaining budget
     */
    calculateRemainingBudget(spent, budget) {
        return Math.max(budget - spent, 0);
    },

    /**
     * Get category breakdown for mini display
     */
    getCategoryBreakdown(expenses, limit = 5) {
        const categoryTotals = this.calculateCategoryTotals(expenses);
        const total = this.calculateTotal(expenses);

        const breakdown = Object.keys(categoryTotals).map(category => ({
            category,
            amount: categoryTotals[category],
            percentage: Utils.calculatePercentage(categoryTotals[category], total)
        }));

        breakdown.sort((a, b) => b.amount - a.amount);

        return breakdown.slice(0, limit);
    },

    /**
     * Calculate spending insights
     */
    calculateInsights(expenses, previousMonthExpenses = []) {
        const insights = [];

        // Total expenses
        const total = this.calculateTotal(expenses);
        const previousTotal = this.calculateTotal(previousMonthExpenses);

        // Top spending day
        const dailyTotals = {};
        expenses.forEach(expense => {
            const date = dayjs(expense.date).format('YYYY-MM-DD');
            dailyTotals[date] = (dailyTotals[date] || 0) + parseFloat(expense.amount);
        });

        const topDay = Object.keys(dailyTotals).reduce((max, date) => {
            return dailyTotals[date] > (dailyTotals[max] || 0) ? date : max;
        }, Object.keys(dailyTotals)[0]);

        if (topDay) {
            insights.push({
                icon: 'bi-calendar-event',
                text: `Highest spending day: ${dayjs(topDay).format('DD MMM')} (${Utils.formatCurrency(dailyTotals[topDay])})`
            });
        }

        // Category comparison with previous month
        if (previousMonthExpenses.length > 0) {
            const currentCategories = this.calculateCategoryTotals(expenses);
            const previousCategories = this.calculateCategoryTotals(previousMonthExpenses);

            Object.keys(currentCategories).forEach(category => {
                const current = currentCategories[category];
                const previous = previousCategories[category] || 0;
                const diff = current - previous;
                const percentChange = previous > 0 ? ((diff / previous) * 100).toFixed(1) : 0;

                if (Math.abs(percentChange) > 20) {
                    const direction = percentChange > 0 ? 'increased' : 'decreased';
                    insights.push({
                        icon: percentChange > 0 ? 'bi-arrow-up' : 'bi-arrow-down',
                        text: `${category.charAt(0).toUpperCase() + category.slice(1)} ${direction} by ${Math.abs(percentChange)}% from last month`
                    });
                }
            });
        }

        // Average transaction size
        const avgTransaction = expenses.length > 0 ? total / expenses.length : 0;
        insights.push({
            icon: 'bi-calculator',
            text: `Average transaction: ${Utils.formatCurrency(avgTransaction)}`
        });

        // Most used payment mode
        const paymentModes = Utils.groupByPaymentMode(expenses);
        const mostUsedMode = Object.keys(paymentModes).reduce((max, mode) => {
            return paymentModes[mode].length > (paymentModes[max] || []).length ? mode : max;
        }, Object.keys(paymentModes)[0]);

        if (mostUsedMode) {
            insights.push({
                icon: 'bi-credit-card',
                text: `Most used payment: ${mostUsedMode.toUpperCase()} (${paymentModes[mostUsedMode].length} transactions)`
            });
        }

        return insights;
    },

    /**
     * Generate savings suggestions
     */
    generateSavingsSuggestions(expenses, budget) {
        const suggestions = [];
        const total = this.calculateTotal(expenses);
        const categoryTotals = this.calculateCategoryTotals(expenses);

        // Budget overspending
        if (total > budget) {
            const overspent = total - budget;
            suggestions.push({
                icon: 'bi-exclamation-triangle',
                type: 'warning',
                text: `You've overspent by ${Utils.formatCurrency(overspent)} this month. Consider reviewing your expenses.`
            });
        } else {
            const saved = budget - total;
            const savingsPercent = ((saved / budget) * 100).toFixed(1);
            suggestions.push({
                icon: 'bi-piggy-bank',
                type: 'success',
                text: `Great job! You've saved ${Utils.formatCurrency(saved)} (${savingsPercent}% of budget) this month.`
            });
        }

        // High category spending
        Object.keys(categoryTotals).forEach(category => {
            const categorySpending = categoryTotals[category];
            const categoryPercent = (categorySpending / total) * 100;

            if (categoryPercent > 30) {
                suggestions.push({
                    icon: 'bi-info-circle',
                    type: 'info',
                    text: `${category.charAt(0).toUpperCase() + category.slice(1)} accounts for ${categoryPercent.toFixed(1)}% of your spending. Consider ways to reduce this.`
                });
            }
        });

        // Daily spending rate
        const daysInMonth = dayjs().daysInMonth();
        const currentDay = dayjs().date();
        const daysRemaining = daysInMonth - currentDay;
        const dailyRate = total / currentDay;
        const projectedTotal = dailyRate * daysInMonth;

        if (projectedTotal > budget && daysRemaining > 0) {
            const recommendedDaily = (budget - total) / daysRemaining;
            suggestions.push({
                icon: 'bi-graph-down',
                type: 'warning',
                text: `At current rate, you'll exceed budget. Try to spend less than ${Utils.formatCurrency(recommendedDaily)} per day for rest of month.`
            });
        }

        // Multiple small transactions
        const smallTransactions = expenses.filter(e => parseFloat(e.amount) < 100);
        if (smallTransactions.length > 20) {
            const smallTotal = this.calculateTotal(smallTransactions);
            suggestions.push({
                icon: 'bi-coin',
                type: 'info',
                text: `You have ${smallTransactions.length} small transactions totaling ${Utils.formatCurrency(smallTotal)}. Small expenses add up!`
            });
        }

        return suggestions;
    },

    /**
     * Calculate bill statistics
     */
    calculateBillStats(bills, paidBills) {
        const totalBills = bills.length;
        const paidCount = paidBills.length;
        const pendingCount = totalBills - paidCount;
        const totalAmount = bills.reduce((sum, bill) => sum + parseFloat(bill.amount), 0);
        const paidAmount = paidBills.reduce((sum, pb) => sum + parseFloat(pb.amount), 0);
        const pendingAmount = totalAmount - paidAmount;

        return {
            total: totalBills,
            paid: paidCount,
            pending: pendingCount,
            totalAmount,
            paidAmount,
            pendingAmount
        };
    },

    /**
     * Get pending bills
     */
    getPendingBills(bills, paidBills) {
        const paidBillNames = paidBills.map(pb => pb.billName);
        return bills.filter(bill => !paidBillNames.includes(bill.name));
    },

    /**
     * Get overdue bills
     */
    getOverdueBills(bills, paidBills) {
        const pendingBills = this.getPendingBills(bills, paidBills);
        return pendingBills.filter(bill => Utils.isBillOverdue(bill.dueDate));
    },

    /**
     * Get bills due soon
     */
    getBillsDueSoon(bills, paidBills) {
        const pendingBills = this.getPendingBills(bills, paidBills);
        return pendingBills.filter(bill => Utils.isBillDueSoon(bill.dueDate));
    },

    /**
     * Calculate month-over-month comparison
     */
    calculateMoMComparison(currentExpenses, previousExpenses) {
        const currentTotal = this.calculateTotal(currentExpenses);
        const previousTotal = this.calculateTotal(previousExpenses);
        const difference = currentTotal - previousTotal;
        const percentChange = previousTotal > 0 ? ((difference / previousTotal) * 100).toFixed(2) : 0;

        return {
            currentTotal,
            previousTotal,
            difference,
            percentChange,
            direction: difference > 0 ? 'increase' : 'decrease'
        };
    },

    /**
     * Get expense statistics
     */
    getExpenseStatistics(expenses) {
        const amounts = expenses.map(e => parseFloat(e.amount));
        const total = this.calculateTotal(expenses);
        const count = expenses.length;
        const average = count > 0 ? total / count : 0;
        const max = amounts.length > 0 ? Math.max(...amounts) : 0;
        const min = amounts.length > 0 ? Math.min(...amounts) : 0;

        // Calculate median
        amounts.sort((a, b) => a - b);
        const median = amounts.length > 0 ?
            (amounts.length % 2 === 0 ?
                (amounts[amounts.length / 2 - 1] + amounts[amounts.length / 2]) / 2 :
                amounts[Math.floor(amounts.length / 2)]) : 0;

        return {
            total,
            count,
            average,
            max,
            min,
            median
        };
    },

    /**
     * Group expenses by date
     */
    groupExpensesByDate(expenses) {
        const grouped = {};

        expenses.forEach(expense => {
            const date = dayjs(expense.date).format('YYYY-MM-DD');
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(expense);
        });

        return grouped;
    },

    /**
     * Get expense trend data for charts
     */
    getExpenseTrend(expenses, period = 'daily') {
        const trend = {};

        if (period === 'daily') {
            // Group by day
            expenses.forEach(expense => {
                const date = dayjs(expense.date).format('DD MMM');
                trend[date] = (trend[date] || 0) + parseFloat(expense.amount);
            });
        } else if (period === 'weekly') {
            // Group by week
            expenses.forEach(expense => {
                const week = dayjs(expense.date).week();
                trend[`Week ${week}`] = (trend[`Week ${week}`] || 0) + parseFloat(expense.amount);
            });
        } else if (period === 'monthly') {
            // Group by month
            expenses.forEach(expense => {
                const month = dayjs(expense.date).format('MMM YYYY');
                trend[month] = (trend[month] || 0) + parseFloat(expense.amount);
            });
        }

        return trend;
    }
};
