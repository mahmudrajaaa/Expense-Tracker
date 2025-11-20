Daily Expense Tracker - Next.js & Supabase Web Application
Build a full-stack expense tracking web application using Next.js 14+ (App Router) and Supabase as the backend database. The app should support user authentication, real-time data sync, and work seamlessly across all devices.

Technical Stack
Frontend: Next.js 14+ (App Router), React 18+, TypeScript
Backend: Supabase (PostgreSQL database, Authentication, Real-time subscriptions)
Styling: Tailwind CSS + shadcn/ui components
Charts: Recharts or Chart.js
PDF Export: jsPDF or react-pdf
Date Handling: date-fns or Day.js
State Management: React Context API or Zustand
Form Handling: React Hook Form with Zod validation
Core Features
1. Authentication System
Email/Password signup and login with Supabase Auth
Social login options (Google, GitHub)
Password reset functionality
Protected routes using middleware
User profile management
Session persistence
2. Database Schema (Supabase PostgreSQL)
Users Table (handled by Supabase Auth):

id (UUID, primary key)
email
created_at
User Settings Table:

- id (UUID, primary key)
- user_id (UUID, foreign key → auth.users)
- monthly_budget (numeric, default 50000)
- currency (varchar, default '₹')
- start_of_week (integer, default 1)
- notifications_enabled (boolean, default true)
- created_at, updated_at
Expenses Table:

- id (UUID, primary key)
- user_id (UUID, foreign key → auth.users)
- item (varchar, required)
- amount (numeric, required)
- category (enum: food, transport, groceries, bills, personal, others)
- payment_mode (enum: cash, upi, card)
- date (timestamp, required)
- notes (text, optional)
- created_at, updated_at
Bills Table (Recurring bills configuration):

- id (UUID, primary key)
- user_id (UUID, foreign key → auth.users)
- name (varchar, required)
- amount (numeric, required)
- due_date (integer, 1-31, required)
- category (varchar)
- is_active (boolean, default true)
- created_at, updated_at
Bills Paid Table (Track monthly bill payments):

- id (UUID, primary key)
- user_id (UUID, foreign key → auth.users)
- bill_id (UUID, foreign key → bills)
- bill_name (varchar)
- amount (numeric)
- payment_mode (varchar)
- paid_date (timestamp)
- month_year (varchar, format: 'YYYY-MM')
- created_at
Enable Row Level Security (RLS) on all tables so users can only access their own data.

3. Expense Management
Add/Edit/Delete expenses with modal forms
Category selection with icon buttons (Food, Transport, Groceries, Bills, Personal, Others)
Payment mode selection (Cash, UPI, Card)
Date/time picker (default to current time)
Optional notes field
Real-time updates using Supabase subscriptions
"Add & New" feature for quick consecutive entries
Duplicate detection (same item, amount within 1 minute)
Form validation using React Hook Form + Zod
4. Dashboard Display
Today's Summary Card:

Total spent today
Number of transactions
Mini category breakdown (horizontal bars showing top 3 categories)
This Week's Summary Card:

Total spent this week (based on user's start_of_week setting)
Daily average spending
Bar chart showing daily totals for the week
This Month's Summary Card:

Total spent this month
Budget progress bar with percentage
Remaining budget (or overspent amount)
Top 3 spending categories with amounts and percentages
Visual indicators (green/yellow/red based on budget usage)
5. Recent Transactions
Display last 20 transactions in a responsive list/table
Show: Category icon, Item name, Category tag, Payment mode, Relative time, Amount
Edit and Delete buttons for each transaction
Filters:
Category dropdown (All, Food, Transport, etc.)
Date range selector (Today, This Week, This Month, Custom Range)
Custom date range picker
Real-time updates when data changes
Optimistic UI updates for better UX
6. Fixed Bills Manager
Default Bills (auto-create on first login):

Rent (₹15,000, due 5th)
EB Bill (₹800, due 10th)
WiFi (₹599, due 15th)
Groceries (₹5,000, due 30th)
Home Loan EMI (₹12,000, due 1st)
School Fees (₹8,000, due 5th)
Netflix (₹649, due 20th)
Amazon Prime (₹299, due 12th)
Features:

Add/Edit/Delete recurring bills
Each bill shows: Name, Amount, Due date, Status (Paid/Pending/Overdue)
"Mark as Paid" button → auto-creates expense entry and records payment
Visual status indicators:
✓ Green for Paid
⚠️ Yellow for Pending (due within 3 days)
🚫 Red for Overdue
Summary cards: Total bills, Paid count, Pending count, Total amount
Filter by status (All, Paid, Pending, Overdue)
7. Monthly Reports Page
Month Selector:

Dropdown to select any month with available data
Default to current month
Summary Cards:

Total expenses for the month
Budget amount
Amount saved/overspent with percentage
Total transaction count
Category Breakdown:

Pie chart showing expense distribution by category
Table with columns: Category, Amount, Percentage
Sort by highest spending
Payment Mode Analysis:

Bar chart showing breakdown by Cash/UPI/Card
Percentages for each mode
Bill Payment Status:

List of all configured bills
Show which are paid vs pending
Highlight overdue bills in red
Total bills paid vs pending amounts
Insights & Recommendations:

Top spending days of the month
Category comparison vs previous month (% increase/decrease)
Automated savings suggestions based on spending patterns
Pending bill reminders
Budget adherence tips
Export Options:

Download as PDF (using jsPDF or react-pdf)
Export data as CSV
Include charts and full transaction details in PDF
8. Settings Page
General Settings:

Monthly budget amount (editable)
Currency symbol (default ₹, customizable)
Start of week (Sunday/Monday/Saturday)
Enable/disable notifications
Data Management:

Export all data as JSON backup
Import data from JSON (with validation)
Clear all data (with confirmation and auto-backup)
Account Settings:

View email and account info
Change password
Delete account (with confirmation)
9. Automated Features
Month Rollover Detection:

Check on login if new month started
Generate previous month's final report
Show modal with summary (total spent, budget, savings, top categories)
Reset bill payment status for new month
Archive previous month data
Bill Reminders:

Show notification badge when bills due within 3 days
Highlight overdue bills in dashboard
Display pending bills count in navigation
Real-time Sync:

Use Supabase real-time subscriptions
Auto-update dashboard when expenses added/modified
Optimistic UI updates for instant feedback
UI/UX Requirements
Design System:

Use Tailwind CSS + shadcn/ui components
Primary color: Blue (#2196F3)
Success: Green (#4CAF50)
Warning: Orange (#FF9800)
Danger: Red (#F44336)
Category-specific colors for visual consistency
Responsive Design:

Mobile-first approach
Stack cards vertically on mobile
Bottom navigation bar for mobile
Touch-friendly buttons (min 44px height)
Hamburger menu for mobile navigation
Animations:

Smooth page transitions (Framer Motion)
Modal enter/exit animations
Success animations after adding expense
Loading skeletons for data fetching
Toast notifications for actions
Accessibility:

ARIA labels for all interactive elements
Keyboard navigation support
Focus states on all inputs
Screen reader friendly
Dark mode support (optional)
API Routes (Next.js App Router)
Create Server Actions or Route Handlers for:

actions/expenses.ts: CRUD operations for expenses
actions/bills.ts: CRUD operations for bills
actions/settings.ts: User settings management
actions/reports.ts: Generate report data
actions/export.ts: Export data as PDF/CSV
Supabase Setup
Environment Variables:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
Row Level Security (RLS) Policies:

-- Example for expenses table
CREATE POLICY "Users can view their own expenses"
ON expenses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses"
ON expenses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses"
ON expenses FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses"
ON expenses FOR DELETE
USING (auth.uid() = user_id);
Apply similar policies for all tables.

Database Functions:

Create function to get monthly summary statistics
Create function to calculate category totals
Create function to get spending trends
Project Structure
/app
  /(auth)
    /login
      page.tsx
    /signup
      page.tsx
    /reset-password
      page.tsx
  /(dashboard)
    /dashboard
      page.tsx
    /bills
      page.tsx
    /reports
      page.tsx
    /settings
      page.tsx
    layout.tsx (protected layout)
  /api
    /export-pdf
      route.ts
  layout.tsx
  page.tsx (landing page)
/components
  /dashboard
    TodaySummary.tsx
    WeekSummary.tsx
    MonthSummary.tsx
    RecentTransactions.tsx
  /expenses
    ExpenseModal.tsx
    ExpenseForm.tsx
    ExpenseCard.tsx
  /bills
    BillCard.tsx
    BillModal.tsx
    BillStatus.tsx
  /reports
    CategoryChart.tsx
    PaymentModeChart.tsx
    MonthSelector.tsx
    InsightsList.tsx
  /ui (shadcn components)
    button.tsx
    card.tsx
    dialog.tsx
    form.tsx
    etc.
/lib
  supabase
    client.ts
    server.ts
    middleware.ts
  utils
    calculations.ts
    formatters.ts
    validators.ts
  hooks
    useExpenses.ts
    useBills.ts
    useSettings.ts
/actions
  expenses.ts
  bills.ts
  settings.ts
  reports.ts
/types
  database.types.ts (generated from Supabase)
  app.types.ts
Testing Checklist

User signup and login works

Add/Edit/Delete expenses with all fields

Dashboard shows correct real-time summaries

Filters work correctly

Bills can be configured and marked as paid

Bill payments auto-create expenses

Month rollover triggers summary modal

Reports generate correctly with charts

PDF export works with all data

CSV export formats correctly

Settings persist across sessions

Data is properly isolated per user (RLS working)

Real-time updates work across browser tabs

Mobile responsive on all pages

Dark mode works (if implemented)

Offline behavior (show appropriate messages)
Performance Optimizations
Use Next.js Image component for any images
Implement infinite scroll for large transaction lists
Cache frequently accessed data using React Query or SWR
Optimize Supabase queries with proper indexing
Use Server Components where possible
Implement loading states and suspense boundaries
Lazy load charts and heavy components
Security Best Practices
Validate all inputs on client and server
Use parameterized queries (Supabase handles this)
Implement rate limiting on API routes
Never expose service role key to client
Use HTTPS only
Implement CSRF protection
Sanitize user inputs to prevent XSS
Deployment
Deploy to Vercel (recommended for Next.js)
Connect Supabase production database
Set up environment variables
Configure custom domain (optional)
Enable analytics (Vercel Analytics or Google Analytics)
Deliverables
Fully functional Next.js application with authentication
Supabase database with proper schema and RLS policies
Clean, TypeScript code with proper types
Responsive design working on mobile, tablet, and desktop
All features tested and working
README with setup instructions
Environment variables template (.env.example)
Start by setting up the Next.js project, Supabase connection, authentication, and database schema. Then implement features in this order: Expenses → Dashboard → Bills → Reports → Settings. Test each feature thoroughly before moving to the next.