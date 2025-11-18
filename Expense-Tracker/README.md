# Daily Expense Tracker

A fully-featured single-page web application for tracking daily expenses with no backend required. All data is stored locally in the browser using localStorage.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

## Features

### 💰 Expense Management
- Add, edit, and delete expenses with detailed information
- Categorize expenses (Food, Transport, Groceries, Bills, Personal, Others)
- Track payment modes (Cash, UPI, Card)
- Add notes to transactions
- Quick "Save & New" option for consecutive entries

### 📊 Dashboard
- **Today's Summary**: Total spending and category breakdown
- **Weekly Summary**: 7-day overview with daily spending chart
- **Monthly Summary**: Budget tracking with progress bar and top spending categories
- **Recent Transactions**: Last 20 transactions with filters

### 🧾 Bills Manager
- Configure recurring monthly bills
- Pre-configured with common bills (Rent, EB, WiFi, etc.)
- Mark bills as paid (automatically adds to expenses)
- Track pending and overdue bills
- Visual indicators for bill status

### 📈 Reports & Analytics
- Monthly expense reports
- Category breakdown with pie chart
- Payment mode analysis
- Bill payment status tracking
- Insights and spending recommendations
- Export reports as PDF or CSV

### ⚙️ Settings
- Customizable monthly budget
- Currency symbol configuration
- Week start day selection
- Notification preferences
- Data export/import (JSON)
- Clear all data with automatic backup

## Technology Stack

- **HTML5** - Semantic markup
- **CSS3** - Modern styling with animations
- **JavaScript/jQuery 3.x** - Application logic
- **Bootstrap 5** - Responsive UI framework
- **Chart.js 4.x** - Data visualization
- **Day.js** - Date/time handling
- **jsPDF** - PDF report generation

## Installation

### Option 1: Direct Usage
1. Download or clone this repository
2. Open `index.html` in a modern web browser
3. Start tracking your expenses!

### Option 2: Local Web Server
```bash
# Using Python
cd expense-tracker
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## Usage Guide

### Adding Expenses
1. Click the **+** floating action button (bottom-right)
2. Fill in the expense details:
   - Item name (required)
   - Amount (required)
   - Category (select from icons)
   - Payment mode (Cash/UPI/Card)
   - Date and time (defaults to now)
   - Notes (optional)
3. Click **Save** or **Save & New**

### Managing Bills
1. Navigate to **Bills** page
2. Click **Add Bill** to configure a recurring bill
3. Enter bill details (name, amount, due date, category)
4. Mark bills as paid when payment is made
5. Bills are automatically added to expenses when marked as paid

### Viewing Reports
1. Navigate to **Reports** page
2. Select a month from the dropdown
3. View comprehensive analytics:
   - Summary cards (total, budget, savings)
   - Category breakdown pie chart
   - Payment mode analysis
   - Bill payment status
   - Insights and recommendations
4. Export as PDF or CSV

### Configuring Settings
1. Navigate to **Settings** page
2. Adjust preferences:
   - Monthly budget amount
   - Currency symbol
   - Start of week (for weekly summary)
   - Enable/disable notifications
3. Click **Save Settings**

### Data Management
- **Export All Data**: Download complete backup as JSON
- **Clear All Data**: Reset app (creates automatic backup)
- **Import Data**: Restore from JSON backup (via browser)

## Data Structure

All data is stored in browser's localStorage:

```javascript
// Expenses: expenses_YYYY_MM
{
  id: "unique_id",
  date: "2025-01-15T14:30",
  item: "Lunch",
  amount: 250,
  category: "food",
  paymentMode: "upi",
  notes: "Team lunch",
  timestamp: 1705318200000
}

// Bills Configuration: bills_config
{
  id: "unique_id",
  name: "Rent",
  amount: 15000,
  dueDate: 5,
  category: "bills"
}

// Paid Bills: bills_paid_YYYY_MM
{
  id: "unique_id",
  billName: "Rent",
  paidDate: "2025-01-05",
  amount: 15000,
  paymentMode: "upi",
  timestamp: 1705318200000
}

// Settings: settings
{
  monthlyBudget: 50000,
  currency: "₹",
  startOfWeek: 1,
  notifications: true
}
```

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Opera 76+

**Requirements:**
- localStorage support
- ES6+ JavaScript support
- CSS Grid and Flexbox support

## File Structure

```
expense-tracker/
├── index.html              # Main HTML file
├── css/
│   └── style.css          # Custom styles
├── js/
│   ├── app.js            # Main application logic
│   ├── storage.js        # localStorage operations
│   ├── calculator.js     # Calculations and aggregations
│   ├── charts.js         # Chart.js configurations
│   ├── reports.js        # PDF/CSV export
│   └── utils.js          # Helper functions
├── assets/
│   └── icons/            # Custom icons (if any)
└── README.md             # This file
```

## Features in Detail

### Category System
Six predefined categories with color-coded icons:
- 🍔 **Food** - Restaurants, meals, snacks
- 🚗 **Transport** - Fuel, public transport, ride-sharing
- 🛒 **Groceries** - Supermarket, daily essentials
- 🧾 **Bills** - Utilities, subscriptions, EMIs
- 👤 **Personal** - Shopping, entertainment, health
- ⚡ **Others** - Miscellaneous expenses

### Automatic Features
- **Month Rollover**: Automatically detects new month and archives previous data
- **Duplicate Detection**: Prevents identical expenses within 1 minute
- **Budget Alerts**: Visual indicators when approaching or exceeding budget
- **Bill Reminders**: Notifications for bills due within 3 days
- **Auto-backup**: Creates backup before destructive operations

### Security & Privacy
- ✅ All data stored locally (no server)
- ✅ No tracking or analytics
- ✅ No external API calls (after libraries load)
- ✅ Sanitized inputs to prevent XSS
- ✅ Works completely offline

## Keyboard Shortcuts

- **F** - Open expense form (when modal is closed)
- **Esc** - Close modals
- **Enter** - Submit forms (when focused)

## Tips & Best Practices

1. **Regular Backups**: Export data monthly for safety
2. **Consistent Categorization**: Use same categories for similar expenses
3. **Add Notes**: Include details for easier tracking later
4. **Review Weekly**: Check dashboard weekly to stay on budget
5. **Bill Tracking**: Configure all recurring bills for better planning
6. **Budget Adjustment**: Update budget based on spending patterns

## Troubleshooting

### App not loading?
- Check browser console for errors
- Ensure JavaScript is enabled
- Try clearing browser cache
- Check localStorage availability

### Data lost?
- Check automatic backups (backup_* in localStorage)
- Check browser's IndexedDB for recovery
- Import from JSON export if available

### Charts not rendering?
- Ensure Chart.js loaded properly
- Check browser console for errors
- Try refreshing the page

### Can't export PDF?
- Check if jsPDF library loaded
- Disable browser popup blocker
- Try different browser

## Known Limitations

- Maximum localStorage size: ~5-10MB (browser-dependent)
- No data sync across devices
- No multi-currency support
- No receipt/photo attachment
- No cloud backup (by design)

## Future Enhancements

Potential features for future versions:
- [ ] Dark mode theme
- [ ] Multiple budget profiles
- [ ] Expense categories customization
- [ ] Recurring expense automation
- [ ] Multi-currency support
- [ ] Data encryption option
- [ ] Mobile app (PWA)
- [ ] Import from bank statements

## Contributing

This is an open-source project. Contributions are welcome!

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see below for details:

```
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the troubleshooting section above

## Acknowledgments

- Bootstrap team for the amazing UI framework
- Chart.js team for visualization library
- Day.js team for date handling
- jsPDF team for PDF generation
- All contributors and users

---

**Made with ❤️ for better expense tracking**

Version: 1.0.0
Last Updated: November 2025
