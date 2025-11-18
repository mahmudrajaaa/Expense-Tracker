/**
 * Reports Module - Report generation and export (PDF, CSV)
 */

const Reports = {
    /**
     * Generate CSV report
     */
    generateCSV(expenses) {
        const csvData = expenses.map(expense => ({
            Date: dayjs(expense.date).format('DD/MM/YYYY HH:mm'),
            Item: expense.item,
            Category: expense.category,
            Amount: expense.amount,
            'Payment Mode': expense.paymentMode,
            Notes: expense.notes || ''
        }));

        return Utils.arrayToCSV(csvData);
    },

    /**
     * Export expenses as CSV
     */
    exportCSV(expenses, month) {
        const csv = this.generateCSV(expenses);
        const filename = `expense-report-${month}.csv`;
        Utils.downloadCSV(csv, filename);
    },

    /**
     * Generate PDF report
     */
    async generatePDF(expenses, month) {
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            const settings = Storage.getSettings();
            const bills = Storage.getBillsConfig();
            const paidBills = Storage.getPaidBills();

            let yPos = 20;
            const pageWidth = doc.internal.pageSize.width;
            const pageHeight = doc.internal.pageSize.height;
            const margin = 20;
            const contentWidth = pageWidth - 2 * margin;

            // Helper function to check if we need a new page
            const checkPageBreak = (neededSpace) => {
                if (yPos + neededSpace > pageHeight - margin) {
                    doc.addPage();
                    yPos = margin;
                    return true;
                }
                return false;
            };

            // Title
            doc.setFontSize(20);
            doc.setTextColor(33, 150, 243);
            doc.text('Expense Report', pageWidth / 2, yPos, { align: 'center' });
            yPos += 10;

            doc.setFontSize(12);
            doc.setTextColor(100);
            doc.text(month, pageWidth / 2, yPos, { align: 'center' });
            yPos += 15;

            // Summary Section
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text('Summary', margin, yPos);
            yPos += 8;

            const total = Calculator.calculateTotal(expenses);
            const budget = settings.monthlyBudget;
            const saved = budget - total;
            const savingsPercent = ((saved / budget) * 100).toFixed(1);

            doc.setFontSize(10);
            doc.setTextColor(60);

            const summaryData = [
                `Total Expenses: ${Utils.formatCurrency(total, settings.currency)}`,
                `Budget: ${Utils.formatCurrency(budget, settings.currency)}`,
                `${saved >= 0 ? 'Saved' : 'Overspent'}: ${Utils.formatCurrency(Math.abs(saved), settings.currency)} (${Math.abs(savingsPercent)}%)`,
                `Total Transactions: ${expenses.length}`
            ];

            summaryData.forEach(line => {
                doc.text(line, margin + 5, yPos);
                yPos += 6;
            });

            yPos += 10;
            checkPageBreak(40);

            // Category Breakdown
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text('Category Breakdown', margin, yPos);
            yPos += 8;

            const categoryTotals = Calculator.calculateCategoryTotals(expenses);
            const categoryData = Object.keys(categoryTotals).map(cat => ({
                category: cat.charAt(0).toUpperCase() + cat.slice(1),
                amount: categoryTotals[cat],
                percentage: Utils.calculatePercentage(categoryTotals[cat], total)
            }));

            categoryData.sort((a, b) => b.amount - a.amount);

            doc.setFontSize(9);
            doc.setTextColor(60);

            categoryData.forEach(item => {
                checkPageBreak(6);
                doc.text(
                    `${item.category}: ${Utils.formatCurrency(item.amount, settings.currency)} (${item.percentage}%)`,
                    margin + 5,
                    yPos
                );
                yPos += 6;
            });

            yPos += 10;
            checkPageBreak(40);

            // Payment Mode Analysis
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text('Payment Mode Analysis', margin, yPos);
            yPos += 8;

            const paymentTotals = Calculator.calculatePaymentModeTotals(expenses);

            doc.setFontSize(9);
            doc.setTextColor(60);

            Object.keys(paymentTotals).forEach(mode => {
                checkPageBreak(6);
                const percentage = Utils.calculatePercentage(paymentTotals[mode], total);
                doc.text(
                    `${mode.toUpperCase()}: ${Utils.formatCurrency(paymentTotals[mode], settings.currency)} (${percentage}%)`,
                    margin + 5,
                    yPos
                );
                yPos += 6;
            });

            yPos += 10;
            checkPageBreak(40);

            // Bill Payment Status
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text('Bill Payment Status', margin, yPos);
            yPos += 8;

            const billStats = Calculator.calculateBillStats(bills, paidBills);

            doc.setFontSize(9);
            doc.setTextColor(60);

            doc.text(`Total Bills: ${billStats.total}`, margin + 5, yPos);
            yPos += 6;
            doc.text(`Paid: ${billStats.paid}`, margin + 5, yPos);
            yPos += 6;
            doc.text(`Pending: ${billStats.pending}`, margin + 5, yPos);
            yPos += 10;

            checkPageBreak(20);

            // Paid Bills
            if (paidBills.length > 0) {
                doc.setFontSize(10);
                doc.text('Paid Bills:', margin + 5, yPos);
                yPos += 6;

                doc.setFontSize(9);
                paidBills.forEach(bill => {
                    checkPageBreak(6);
                    doc.text(
                        `✓ ${bill.billName} - ${Utils.formatCurrency(bill.amount, settings.currency)}`,
                        margin + 10,
                        yPos
                    );
                    yPos += 5;
                });
                yPos += 5;
            }

            // Pending Bills
            const pendingBills = Calculator.getPendingBills(bills, paidBills);
            if (pendingBills.length > 0) {
                checkPageBreak(20);
                doc.setFontSize(10);
                doc.text('Pending Bills:', margin + 5, yPos);
                yPos += 6;

                doc.setFontSize(9);
                pendingBills.forEach(bill => {
                    checkPageBreak(6);
                    const overdue = Utils.isBillOverdue(bill.dueDate);
                    if (overdue) {
                        doc.setTextColor(244, 67, 54); // Red for overdue
                    }
                    doc.text(
                        `${overdue ? '!' : '○'} ${bill.name} - ${Utils.formatCurrency(bill.amount, settings.currency)} (Due: ${bill.dueDate})`,
                        margin + 10,
                        yPos
                    );
                    doc.setTextColor(60);
                    yPos += 5;
                });
                yPos += 10;
            }

            checkPageBreak(40);

            // Insights
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text('Insights & Recommendations', margin, yPos);
            yPos += 8;

            const insights = Calculator.calculateInsights(expenses);
            const suggestions = Calculator.generateSavingsSuggestions(expenses, budget);

            doc.setFontSize(9);
            doc.setTextColor(60);

            [...insights, ...suggestions].forEach(insight => {
                checkPageBreak(10);
                const lines = doc.splitTextToSize(`• ${insight.text}`, contentWidth - 10);
                lines.forEach(line => {
                    checkPageBreak(5);
                    doc.text(line, margin + 5, yPos);
                    yPos += 5;
                });
                yPos += 2;
            });

            yPos += 10;
            checkPageBreak(40);

            // Transaction Details
            doc.addPage();
            yPos = margin;

            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text('Transaction Details', margin, yPos);
            yPos += 10;

            // Sort expenses by date
            const sortedExpenses = [...expenses].sort((a, b) =>
                new Date(b.date) - new Date(a.date)
            );

            doc.setFontSize(8);

            // Table header
            doc.setTextColor(255, 255, 255);
            doc.setFillColor(33, 150, 243);
            doc.rect(margin, yPos - 5, contentWidth, 6, 'F');
            doc.text('Date', margin + 2, yPos);
            doc.text('Item', margin + 30, yPos);
            doc.text('Category', margin + 80, yPos);
            doc.text('Mode', margin + 110, yPos);
            doc.text('Amount', margin + 140, yPos);
            yPos += 8;

            doc.setTextColor(60);

            sortedExpenses.forEach((expense, index) => {
                checkPageBreak(6);

                // Alternate row colors
                if (index % 2 === 0) {
                    doc.setFillColor(245, 245, 245);
                    doc.rect(margin, yPos - 4, contentWidth, 6, 'F');
                }

                doc.text(dayjs(expense.date).format('DD/MM/YY HH:mm'), margin + 2, yPos);
                doc.text(Utils.truncate(expense.item, 25), margin + 30, yPos);
                doc.text(expense.category, margin + 80, yPos);
                doc.text(expense.paymentMode.toUpperCase(), margin + 110, yPos);
                doc.text(Utils.formatCurrency(expense.amount, settings.currency), margin + 140, yPos);
                yPos += 6;
            });

            // Footer on last page
            const totalPages = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(
                    `Page ${i} of ${totalPages} | Generated on ${dayjs().format('DD/MM/YYYY HH:mm')}`,
                    pageWidth / 2,
                    pageHeight - 10,
                    { align: 'center' }
                );
            }

            // Save PDF
            const filename = `expense-report-${month.replace(/\s+/g, '-')}.pdf`;
            doc.save(filename);

            return true;
        } catch (error) {
            console.error('PDF generation failed:', error);
            Utils.showToast('Failed to generate PDF report', 'error');
            return false;
        }
    },

    /**
     * Export all data as JSON
     */
    exportAllData() {
        const allData = Storage.exportAllData();
        const filename = `expense-tracker-backup-${dayjs().format('YYYY-MM-DD')}.json`;
        Utils.downloadJSON(allData, filename);
    },

    /**
     * Generate month-end summary report
     */
    generateMonthEndSummary(monthKey) {
        const parts = monthKey.split('_');
        const year = parts[1];
        const month = parts[2];
        const expenses = Storage.getExpensesByMonth(year, month);
        const settings = Storage.getSettings();

        const total = Calculator.calculateTotal(expenses);
        const budget = settings.monthlyBudget;
        const saved = budget - total;
        const categoryTotals = Calculator.calculateCategoryTotals(expenses);
        const topCategories = Calculator.getTopCategories(expenses, 3);

        return {
            month: dayjs(`${year}-${month}-01`).format('MMMM YYYY'),
            total,
            budget,
            saved,
            savingsPercent: ((saved / budget) * 100).toFixed(1),
            transactionCount: expenses.length,
            categoryTotals,
            topCategories
        };
    }
};
