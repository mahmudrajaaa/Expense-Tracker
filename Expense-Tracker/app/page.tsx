import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Daily Expense Tracker
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Take control of your finances. Track expenses, manage bills, and gain insights into your spending habits.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/signup"
            className="px-8 py-3 bg-white text-primary rounded-lg font-semibold border-2 border-primary hover:bg-blue-50 transition-colors"
          >
            Sign Up
          </Link>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">Track Expenses</h3>
            <p className="text-gray-600">Monitor your daily spending with detailed categorization</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-lg font-semibold mb-2">Manage Bills</h3>
            <p className="text-gray-600">Never miss a bill payment with smart reminders</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-lg font-semibold mb-2">View Reports</h3>
            <p className="text-gray-600">Analyze spending patterns with detailed insights</p>
          </div>
        </div>
      </div>
    </div>
  );
}
