import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  getActiveMonths,
  getExpenseSummary,
  getExpenseSummaryDetails,
} from "../../api/api";
import { useSearchParams } from "react-router-dom";

const Summary = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const initialMonth = searchParams.get("month") || currentMonth;

  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [activeMonths, setActiveMonths] = useState([]);
  const [expenseSummary, setExpenseSummary] = useState(null);
  const [expandedExpenses, setExpandedExpenses] = useState({});
  const [expenseDetails, setExpenseDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState({});

  const shopId = searchParams.get("shopId");

  useEffect(() => {
    const fetchActiveMonths = async () => {
      try {
        const response = await getActiveMonths(shopId);
        setActiveMonths(response.data);
      } catch (err) {
        console.error("Failed to fetch active months");
      }
    };
    fetchActiveMonths();
  }, []);

  useEffect(() => {
    fetchExpenseSummary();
  }, [selectedMonth]);

  const fetchExpenseSummary = async () => {
    setLoading(true);
    try {
      const response = await getExpenseSummary(selectedMonth, shopId);
      setExpenseSummary(response.data);
      setExpandedExpenses({});
      setExpenseDetails({});
    } catch (err) {
      console.error("Failed to fetch expense summary");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpenseDetails = async (expenseId) => {
    const isExpanded = expandedExpenses[expenseId];

    if (isExpanded) {
      setExpandedExpenses((prev) => ({ ...prev, [expenseId]: false }));
    } else {
      if (!expenseDetails[expenseId]) {
        setDetailLoading((prev) => ({ ...prev, [expenseId]: true }));
        try {
          const response = await getExpenseSummaryDetails(
            expenseId,
            selectedMonth,
            shopId
          );
          setExpenseDetails((prev) => ({
            ...prev,
            [expenseId]: response.data || [],
          }));
        } catch (err) {
          console.error("Failed to fetch expense details");
        } finally {
          setDetailLoading((prev) => ({ ...prev, [expenseId]: false }));
        }
      }
      setExpandedExpenses((prev) => ({ ...prev, [expenseId]: true }));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(year, month - 1);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  // Calculate percentage of total for each expense
  const calculatePercentage = (amount, total) => {
    return ((amount / total) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Simple Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Expenses</h1>

          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-600">Month:</span>
          </div>

          {/* Simple Month Buttons */}
          <div className="flex flex-wrap gap-2">
            {activeMonths.map((month) => (
              <button
                key={month.month}
                onClick={() => {
                  setSelectedMonth(month.month);
                  setSearchParams((prev) => {
                    const next = new URLSearchParams(prev);
                    next.set("month", month.month);
                    return next;
                  });
                }}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  selectedMonth === month.month
                    ? "bg-blue-400 text-white"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                }`}
              >
                {formatMonth(month.month)}
              </button>
            ))}
          </div>

          {/* Simple Total Amount Display */}
          {expenseSummary && (
            <div className="mt-4 pt-4 border-t">
              <div className="text-sm text-slate-600">Total Amount</div>
              <div className="text-xl font-bold text-slate-900">
                {formatCurrency(expenseSummary.totalAmount)}
              </div>
            </div>
          )}
        </div>

        {/* Simple Expense Items */}
        {expenseSummary?.summary.map((expense) => (
          <div
            key={expense.expenseId}
            className="bg-white rounded-lg shadow-sm overflow-hidden"
          >
            {/* Progress Bar */}
            <div className="h-1 bg-slate-100">
              <div
                className={`h-full transition-all duration-700 ${
                  expense.type === "credit" ? "bg-emerald-400" : "bg-rose-400"
                }`}
                style={{ 
                  width: `${calculatePercentage(expense.totalAmount, expenseSummary.totalAmount)}%` 
                }}
              />
            </div>

            <div
              onClick={() => toggleExpenseDetails(expense.expenseId)}
              className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      expense.type === "credit"
                        ? "bg-emerald-100"
                        : "bg-rose-100"
                    }`}
                  >
                    {expense.type === "credit" ? (
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-rose-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 capitalize">
                      {expense.expenseName}
                    </div>
                    <div className="text-sm text-slate-500">
                      {expense.daysUsed} days • {expense.type} • {calculatePercentage(expense.totalAmount, expenseSummary.totalAmount)}%
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="font-semibold text-slate-900">
                      {formatCurrency(expense.totalAmount)}
                    </div>
                  </div>
                  {expandedExpenses[expense.expenseId] ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Simple Expanded Details */}
            {expandedExpenses[expense.expenseId] && (
              <div className="border-t bg-slate-50">
                {detailLoading[expense.expenseId] ? (
                  <div className="py-6 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mx-auto"></div>
                  </div>
                ) : expenseDetails[expense.expenseId] ? (
                  <div className="p-4">
                    <div className="text-sm font-semibold text-slate-700 mb-4 pb-2 border-b border-slate-200">
                      Daily Breakdown
                    </div>
                    <div className="space-y-2">
                      {expenseDetails[expense.expenseId].map((day, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg p-3 border border-slate-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <div className="text-sm font-medium text-slate-900">
                                  {new Date(day.date).toLocaleDateString(
                                    "en-US",
                                    {
                                      weekday: "short",
                                      month: "short",
                                      day: "numeric",
                                    }
                                  )}
                                </div>
                                <div className="text-base font-semibold text-slate-900">
                                  {formatCurrency(day.amount)}
                                </div>
                              </div>
                              <div className="text-xs text-slate-500  px-2 py-1 rounded">
                                {day.description}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-600">
                          Total ({expenseDetails[expense.expenseId]?.length}{" "}
                          days)
                        </span>
                        <span className="font-bold text-slate-900">
                          {formatCurrency(
                            expenseDetails[expense.expenseId].reduce(
                              (sum, item) => sum + item.amount,
                              0
                            )
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-500 text-sm">
                    Failed to load details
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Simple Empty State */}
        {!expenseSummary?.summary.length && !loading && (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="text-slate-500">
              No expenses found for this month
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Summary;