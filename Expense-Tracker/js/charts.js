/**
 * Charts Module - Chart.js configurations and rendering
 */

const Charts = {
    // Store chart instances to destroy before recreating
    chartInstances: {},

    /**
     * Category colors mapping
     */
    categoryColors: {
        food: '#FF6B6B',
        transport: '#4ECDC4',
        groceries: '#95E1D3',
        bills: '#F38181',
        personal: '#AA96DA',
        others: '#FCBAD3'
    },

    /**
     * Payment mode colors
     */
    paymentModeColors: {
        cash: '#4CAF50',
        upi: '#2196F3',
        card: '#FF9800'
    },

    /**
     * Destroy chart if exists
     */
    destroyChart(chartId) {
        if (this.chartInstances[chartId]) {
            this.chartInstances[chartId].destroy();
            delete this.chartInstances[chartId];
        }
    },

    /**
     * Create week bar chart
     */
    createWeekChart(canvasId, expenses, startOfWeek = 1) {
        this.destroyChart(canvasId);

        const weekExpenses = Calculator.getWeekExpenses(expenses, startOfWeek);
        const dailyTotals = Calculator.getDailyTotalsForWeek(weekExpenses, startOfWeek);

        const labels = Object.keys(dailyTotals).map(date => dayjs(date).format('ddd'));
        const data = Object.values(dailyTotals);

        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        this.chartInstances[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Daily Spending',
                    data: data,
                    backgroundColor: 'rgba(33, 150, 243, 0.6)',
                    borderColor: 'rgba(33, 150, 243, 1)',
                    borderWidth: 1,
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return Utils.formatCurrency(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value;
                            }
                        },
                        grid: {
                            display: false
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    },

    /**
     * Create category pie chart
     */
    createCategoryPieChart(canvasId, expenses) {
        this.destroyChart(canvasId);

        const categoryTotals = Calculator.calculateCategoryTotals(expenses);
        const labels = Object.keys(categoryTotals).map(cat =>
            cat.charAt(0).toUpperCase() + cat.slice(1)
        );
        const data = Object.values(categoryTotals);
        const colors = Object.keys(categoryTotals).map(cat => this.categoryColors[cat]);

        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        this.chartInstances[canvasId] = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = Utils.formatCurrency(context.parsed);
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    },

    /**
     * Create payment mode bar chart
     */
    createPaymentModeChart(canvasId, expenses) {
        this.destroyChart(canvasId);

        const paymentTotals = Calculator.calculatePaymentModeTotals(expenses);
        const labels = Object.keys(paymentTotals).map(mode => mode.toUpperCase());
        const data = Object.values(paymentTotals);
        const colors = Object.keys(paymentTotals).map(mode => this.paymentModeColors[mode]);

        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        this.chartInstances[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Amount',
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 0,
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return Utils.formatCurrency(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value;
                            }
                        }
                    }
                }
            }
        });
    },

    /**
     * Create category doughnut chart
     */
    createCategoryDoughnutChart(canvasId, expenses) {
        this.destroyChart(canvasId);

        const categoryTotals = Calculator.calculateCategoryTotals(expenses);
        const labels = Object.keys(categoryTotals).map(cat =>
            cat.charAt(0).toUpperCase() + cat.slice(1)
        );
        const data = Object.values(categoryTotals);
        const colors = Object.keys(categoryTotals).map(cat => this.categoryColors[cat]);

        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        this.chartInstances[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = Utils.formatCurrency(context.parsed);
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.parsed / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    },

    /**
     * Create line chart for trend
     */
    createTrendChart(canvasId, expenses, period = 'daily') {
        this.destroyChart(canvasId);

        const trend = Calculator.getExpenseTrend(expenses, period);
        const labels = Object.keys(trend);
        const data = Object.values(trend);

        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        this.chartInstances[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Spending Trend',
                    data: data,
                    borderColor: 'rgba(33, 150, 243, 1)',
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(33, 150, 243, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return Utils.formatCurrency(context.parsed.y);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value;
                            }
                        }
                    }
                }
            }
        });
    },

    /**
     * Create horizontal bar chart for categories
     */
    createHorizontalCategoryChart(canvasId, expenses) {
        this.destroyChart(canvasId);

        const categoryTotals = Calculator.calculateCategoryTotals(expenses);
        const labels = Object.keys(categoryTotals).map(cat =>
            cat.charAt(0).toUpperCase() + cat.slice(1)
        );
        const data = Object.values(categoryTotals);
        const colors = Object.keys(categoryTotals).map(cat => this.categoryColors[cat]);

        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        this.chartInstances[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Amount',
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 0,
                    borderRadius: 5
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return Utils.formatCurrency(context.parsed.x);
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value;
                            }
                        }
                    }
                }
            }
        });
    },

    /**
     * Destroy all charts
     */
    destroyAllCharts() {
        Object.keys(this.chartInstances).forEach(chartId => {
            this.destroyChart(chartId);
        });
    }
};
