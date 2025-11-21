"use client";

import { useState, useMemo } from "react";
import { Search, Filter, X } from "lucide-react";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExpenseCard } from "@/components/expenses/ExpenseCard";
import { CATEGORIES, PAYMENT_MODES } from "@/lib/constants";
import type { Expense } from "@/types/database.types";
import { formatCurrency } from "@/lib/calculations";

interface TransactionsListProps {
  initialExpenses: Expense[];
  currency: string;
}

type DateFilter = "all" | "today" | "week" | "month";

export function TransactionsList({
  initialExpenses,
  currency,
}: TransactionsListProps) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [paymentModeFilter, setPaymentModeFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Filter expenses
  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (expense) =>
          expense.item.toLowerCase().includes(query) ||
          expense.notes?.toLowerCase().includes(query) ||
          expense.category.toLowerCase().includes(query)
      );
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      if (dateFilter === "today") {
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
      } else if (dateFilter === "week") {
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
      } else if (dateFilter === "month") {
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
      } else {
        startDate = new Date(0);
        endDate = new Date();
      }

      filtered = filtered.filter((expense) => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= startDate && expenseDate <= endDate;
      });
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((expense) => expense.category === categoryFilter);
    }

    // Payment mode filter
    if (paymentModeFilter !== "all") {
      filtered = filtered.filter(
        (expense) => expense.payment_mode === paymentModeFilter
      );
    }

    return filtered;
  }, [expenses, searchQuery, dateFilter, categoryFilter, paymentModeFilter]);

  // Calculate total
  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce(
      (sum, expense) => sum + Number(expense.amount),
      0
    );
  }, [filteredExpenses]);

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setDateFilter("all");
    setCategoryFilter("all");
    setPaymentModeFilter("all");
  };

  const hasActiveFilters =
    searchQuery || dateFilter !== "all" || categoryFilter !== "all" || paymentModeFilter !== "all";

  const handleExpenseUpdate = () => {
    // Refresh the page to get updated data
    window.location.reload();
  };

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredExpenses.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalAmount, currency)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Average per Transaction</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(
                  filteredExpenses.length > 0 ? totalAmount / filteredExpenses.length : 0,
                  currency
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Search & Filter</CardTitle>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="text-sm"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? "Hide" : "Show"} Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by item name, category, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Date Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Date Range
                </label>
                <Select value={dateFilter} onValueChange={(value) => setDateFilter(value as DateFilter)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Category
                </label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <span className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span>{category.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Mode Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Payment Mode
                </label>
                <Select value={paymentModeFilter} onValueChange={setPaymentModeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All modes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All modes</SelectItem>
                    {PAYMENT_MODES.map((mode) => (
                      <SelectItem key={mode.value} value={mode.value}>
                        <span className="flex items-center gap-2">
                          <span>{mode.icon}</span>
                          <span>{mode.label}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2">
              {searchQuery && (
                <Badge variant="secondary">
                  Search: "{searchQuery}"
                </Badge>
              )}
              {dateFilter !== "all" && (
                <Badge variant="secondary">
                  Date: {dateFilter === "today" ? "Today" : dateFilter === "week" ? "This Week" : "This Month"}
                </Badge>
              )}
              {categoryFilter !== "all" && (
                <Badge variant="secondary">
                  Category: {CATEGORIES.find((c) => c.value === categoryFilter)?.label}
                </Badge>
              )}
              {paymentModeFilter !== "all" && (
                <Badge variant="secondary">
                  Payment: {PAYMENT_MODES.find((p) => p.value === paymentModeFilter)?.label}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transactions List */}
      <div className="space-y-3">
        {filteredExpenses.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📭</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No transactions found
              </h3>
              <p className="text-gray-600">
                {hasActiveFilters
                  ? "Try adjusting your filters or search query"
                  : "Start tracking your expenses by adding your first transaction"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredExpenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              currency={currency}
              showActions={true}
              onUpdate={handleExpenseUpdate}
              onDelete={handleExpenseUpdate}
            />
          ))
        )}
      </div>
    </div>
  );
}
