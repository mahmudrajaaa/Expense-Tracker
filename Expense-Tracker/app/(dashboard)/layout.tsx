import { getUser, signOut } from "@/actions/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/dashboard" className="flex items-center">
                <span className="text-2xl font-bold text-primary">ExpenseTracker</span>
              </Link>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-6">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/bills"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-primary transition-colors"
                >
                  Bills
                </Link>
                <Link
                  href="/reports"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-primary transition-colors"
                >
                  Reports
                </Link>
                <Link
                  href="/settings"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-primary transition-colors"
                >
                  Settings
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">{user.email}</span>
              <form action={signOut}>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-600 transition-colors"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
