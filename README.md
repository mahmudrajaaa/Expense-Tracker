# Daily Expense Tracker

A full-stack expense tracking web application built with Next.js 16 and Supabase. Track your daily expenses, manage recurring bills, and analyze spending patterns with detailed insights.

![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8)

## Features

### 🔐 Authentication
- Email/Password signup and login
- Password reset functionality
- Protected routes with middleware
- Session persistence

### 💰 Expense Management
- Add, edit, and delete expenses
- Categorize expenses (Food, Transport, Groceries, Bills, Personal, Others)
- Track payment modes (Cash, UPI, Card)
- Add notes to expenses
- Real-time updates

### 📊 Dashboard
- **Today's Summary**: Total spent and transaction count
- **This Week's Summary**: Weekly total and daily average
- **This Month's Summary**: Monthly total with budget tracking
- Budget progress bar with visual indicators
- Top 3 spending categories
- Recent transactions list with filters

### 📄 Bills Manager
- Configure recurring bills
- Default bills auto-created on signup (Rent, EB Bill, WiFi, etc.)
- Mark bills as paid
- Auto-creates expense entry when bill is paid
- Visual status indicators (Paid/Pending/Overdue)
- Monthly bill tracking

### 📈 Monthly Reports
- Total expenses and transaction count
- Budget analysis (saved/overspent)
- Category breakdown with percentages
- Payment mode analysis
- Insights and recommendations
- Visual charts and progress bars

### ⚙️ Settings
- Set monthly budget
- Customize currency symbol
- Configure start of week
- Enable/disable notifications

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **Styling**: Tailwind CSS 4.1
- **UI Components**: Custom components with shadcn/ui design
- **Form Handling**: React Hook Form with Zod validation
- **Date Handling**: date-fns
- **Charts**: Recharts (ready to integrate)

## Getting Started

### Prerequisites

- Node.js 20+ installed
- Supabase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mahmudrajaaa/Expense-Tracker.git
   cd Expense-Tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Set up Supabase database**

   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the SQL script from `supabase-schema.sql`
   - This will create all tables, RLS policies, and functions

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

The application uses the following Supabase tables:

- **user_settings**: User preferences (budget, currency, etc.)
- **expenses**: All expense transactions
- **bills**: Recurring bill configurations
- **bills_paid**: Monthly bill payment tracking

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## Project Structure

```
Expense-Tracker/
├── app/
│   ├── (auth)/          # Authentication pages
│   │   ├── login/
│   │   ├── signup/
│   │   └── reset-password/
│   ├── (dashboard)/     # Protected dashboard pages
│   │   ├── dashboard/   # Main dashboard
│   │   ├── bills/       # Bills management
│   │   ├── reports/     # Monthly reports
│   │   └── settings/    # User settings
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Landing page
├── actions/             # Server actions
│   ├── auth.ts
│   ├── expenses.ts
│   ├── bills.ts
│   └── settings.ts
├── components/
│   └── ui/              # Reusable UI components
├── lib/
│   ├── supabase/        # Supabase client configuration
│   ├── calculations.ts  # Utility functions
│   └── utils.ts         # Helper functions
├── types/               # TypeScript type definitions
├── middleware.ts        # Route protection middleware
└── supabase-schema.sql  # Database schema
```

## Key Features Explained

### Automated Bill Payments

When you mark a bill as paid:
1. Creates a record in `bills_paid` table
2. Automatically creates an expense entry
3. Updates dashboard totals in real-time

### Budget Tracking

- Set monthly budget in settings
- Visual progress bar shows spending percentage
- Color-coded indicators:
  - 🟢 Green: Under 80% of budget
  - 🟡 Yellow: 80-100% of budget
  - 🔴 Red: Over budget

### Real-time Updates

The application uses Supabase's real-time capabilities to automatically update:
- Dashboard summaries
- Transaction lists
- Bill statuses

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Deploy

### Environment Variables for Production

Make sure to add these in your Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Security Features

- ✅ Row Level Security (RLS) on all tables
- ✅ Server-side authentication checks
- ✅ Protected API routes
- ✅ Secure password handling via Supabase Auth
- ✅ Environment variables for sensitive data
- ✅ HTTPS only in production

## Default Bills

On first signup, these bills are automatically created:
- Rent (₹15,000, due 5th)
- EB Bill (₹800, due 10th)
- WiFi (₹599, due 15th)
- Groceries (₹5,000, due 30th)
- Home Loan EMI (₹12,000, due 1st)
- School Fees (₹8,000, due 5th)
- Netflix (₹649, due 20th)
- Amazon Prime (₹299, due 12th)

You can edit or delete these as needed.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Author

**mahmudrajaaa**
- GitHub: [@mahmudrajaaa](https://github.com/mahmudrajaaa)
- Email: mahmudrajaaa@gmail.com

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database by [Supabase](https://supabase.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from [Lucide React](https://lucide.dev/)

---

**Built with ❤️ using Next.js and Supabase**
