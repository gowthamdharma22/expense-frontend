import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  Receipt,
  IndianRupee,
  Activity,
  Eye,
  EyeOff,
  Phone,
  User,
} from "lucide-react";
import {
  getActiveMonths,
  getAllActivity,
  getAllNotes,
  getExpenseSummary,
  getExpenseSummaryDetails,
} from "../../api/api";
import ModernNavbar from "../../components/nav";

// Credit/Debit Notes Component
const CreditDebitNotes = ({ selectedMonth, shopId }) => {
  const [notesData, setNotesData] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotesData();
  }, [selectedMonth]);

  const fetchNotesData = async () => {
    setLoading(true);
    try {
      const response = await getAllNotes(shopId, selectedMonth);
      setNotesData(response.data);
      setSelectedUser(null);
      setUserDetails(null);
    } catch (err) {
      console.error("Failed to fetch notes data");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const response = await getAllNotes(shopId, selectedMonth, userId);
      setUserDetails(response.data);
    } catch (err) {
      console.error("Failed to fetch user details");
    }
  };

  const handleUserClick = async (userId) => {
    if (selectedUser === userId) {
      setSelectedUser(null);
      setUserDetails(null);
    } else {
      setSelectedUser(userId);
      await fetchUserDetails(userId);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-gray-600 text-sm">Loading notes data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      {notesData && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-blue-100 text-xs font-medium">
                    Net Balance
                  </p>
                  <p
                    className={`text-xl font-bold ${
                      notesData.totalAmount >= 0
                        ? "text-green-200"
                        : "text-red-200"
                    }`}
                  >
                    {formatCurrency(notesData.totalAmount)}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-xs">Total Customers</p>
              <p className="text-lg font-bold">
                {notesData.summary?.length || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Customer List */}
      {notesData?.summary && notesData.summary.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900 flex items-center">
              <Users className="w-4 h-4 mr-2 text-blue-600" />
              Customer Accounts
            </h3>
            <p className="text-gray-600 mt-1 text-xs">
              Click on any customer to view detailed transactions
            </p>
          </div>

          <div className="divide-y divide-gray-50">
            {notesData.summary.map((user) => (
              <div key={user.userId} className="transition-all duration-200">
                <div
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => handleUserClick(user.userId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">
                          {user.name}
                        </h4>
                        {user.phone && (
                          <div className="flex items-center text-gray-500 mt-0.5">
                            <Phone className="w-3 h-3 mr-1" />
                            <span className="text-xs">{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 font-medium">
                          Credit
                        </p>
                        <p className="text-sm font-semibold text-green-600">
                          {formatCurrency(user.totalCredit)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 font-medium">
                          Debit
                        </p>
                        <p className="text-sm font-semibold text-red-600">
                          {formatCurrency(user.totalDebit)}
                        </p>
                      </div>
                      <div className="text-center min-w-[100px]">
                        <p className="text-xs text-gray-500 font-medium">
                          Balance
                        </p>
                        <p
                          className={`text-sm font-bold ${
                            user.balanceAmount >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(user.balanceAmount)}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {selectedUser === user.userId ? (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transaction Details */}
                {selectedUser === user.userId && userDetails && (
                  <div className="bg-gray-50 border-t border-gray-100">
                    <div className="px-6 py-4">
                      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                          <h5 className="font-medium text-gray-900 text-sm">
                            Transaction History
                          </h5>
                        </div>
                        <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                          {userDetails.summary.map((transaction, idx) => (
                            <div
                              key={idx}
                              className="px-4 py-3 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                      transaction.type === "credit"
                                        ? "bg-green-100 text-green-600"
                                        : "bg-red-100 text-red-600"
                                    }`}
                                  >
                                    {transaction.type === "credit" ? (
                                      <TrendingUp className="w-3 h-3" />
                                    ) : (
                                      <TrendingDown className="w-3 h-3" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900 text-xs">
                                      {transaction.description ||
                                        "No description"}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {formatDate(transaction.date)}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p
                                    className={`text-sm font-semibold ${
                                      transaction.type === "credit"
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {formatCurrency(transaction.amount)}
                                  </p>
                                  <span
                                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                                      transaction.type === "credit"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {transaction.type.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            No Notes Found
          </h3>
          <p className="text-gray-500 text-xs">
            No credit/debit notes available for the selected month.
          </p>
        </div>
      )}
    </div>
  );
};

// Expenses Component
const ExpenseSummary = ({ selectedMonth, shopId }) => {
  const [expenseSummary, setExpenseSummary] = useState(null);
  const [expandedExpenses, setExpandedExpenses] = useState({});
  const [expenseDetails, setExpenseDetails] = useState({});
  const [loading, setLoading] = useState(false);

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
        }
      }
      setExpandedExpenses((prev) => ({ ...prev, [expenseId]: true }));
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-gray-600 text-sm">Loading expense data...</p>
      </div>
    );
  }

  const isValidSummary = Array.isArray(expenseSummary?.summary) && expenseSummary.summary.length > 0;

  const credits = isValidSummary
    ? expenseSummary.summary.filter((e) => e.type === "credit" && e.expenseId !== 1 && e.expenseId !== 2)
    : [];
  
  const debits = isValidSummary
    ? expenseSummary.summary.filter((e) => e.type === "debit" && e.expenseId !== 1 && e.expenseId !== 2)
    : [];
  
  const creditDebitNotes = isValidSummary
    ? expenseSummary.summary.filter((e) => e.expenseId === 1 || e.expenseId === 2)
    : [];
  

  const ExpenseSection = ({
    title,
    expenses,
    type,
    icon: Icon,
    colorClass,
    bgClass,
  }) => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <div className={`p-2 ${bgClass} rounded-lg`}>
          <Icon className={`w-4 h-4 ${colorClass}`} />
        </div>
        <div>
          <h3 className={`text-base font-semibold ${colorClass}`}>{title}</h3>
          <p className="text-gray-600 text-xs">
            {expenses.length} {expenses.length === 1 ? "expense" : "expenses"} •
            Total:{" "}
            {formatCurrency(
              expenses.reduce((sum, exp) => sum + exp.totalAmount, 0)
            )}
          </p>
        </div>
      </div>

      {expenses.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-50">
            {expenses.map((expense) => (
              <div key={expense.expenseId}>
                <div
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => toggleExpenseDetails(expense.expenseId)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 ${bgClass} rounded-lg flex items-center justify-center`}
                      >
                        <Receipt className={`w-4 h-4 ${colorClass}`} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm capitalize">
                          {expense.expenseName}
                        </h4>
                        <p className="text-gray-500 text-xs">
                          Used for {expense.daysUsed}{" "}
                          {expense.daysUsed === 1 ? "day" : "days"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 font-medium">
                          Days
                        </p>
                        <span className="inline-flex px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                          {expense.daysUsed}
                        </span>
                      </div>
                      <div className="text-right min-w-[100px]">
                        <p className="text-xs text-gray-500 font-medium">
                          Amount
                        </p>
                        <p className={`text-sm font-bold ${colorClass}`}>
                          {formatCurrency(expense.totalAmount)}
                        </p>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                          expandedExpenses[expense.expenseId]
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {expandedExpenses[expense.expenseId] &&
                  expenseDetails[expense.expenseId] && (
                    <div
                      className={`${bgClass
                        .replace("bg-", "bg-")
                        .replace("-100", "-50")} border-t border-gray-100`}
                    >
                      <div className="px-6 py-4">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                            <h5 className="font-medium text-gray-900 text-sm">
                              Daily Breakdown
                            </h5>
                          </div>
                          <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                            {expenseDetails[expense.expenseId].map(
                              (day, idx) => (
                                <div
                                  key={idx}
                                  className="px-4 py-3 hover:bg-gray-50 transition-colors"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <div
                                        className={`w-6 h-6 ${bgClass} rounded-full flex items-center justify-center`}
                                      >
                                        <Calendar
                                          className={`w-3 h-3 ${colorClass}`}
                                        />
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-900 text-xs">
                                          {day.description ||
                                            expense.expenseName}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {formatDate(day.date)}
                                        </p>
                                      </div>
                                    </div>
                                    <p
                                      className={`text-sm font-semibold ${colorClass}`}
                                    >
                                      {formatCurrency(day.amount)}
                                    </p>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      {expenseSummary && (
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <IndianRupee className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-green-100 text-xs font-medium">
                    Total Expenses
                  </p>
                  <p className="text-xl font-bold">
                    {formatCurrency(expenseSummary.totalAmount)}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="flex space-x-4">
                <div className="text-center">
                  <p className="text-green-100 text-xs">Credits</p>
                  <p className="text-lg font-bold">{credits.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-green-100 text-xs">Debits</p>
                  <p className="text-lg font-bold">{debits.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credits Section */}
      {credits.length > 0 && (
        <ExpenseSection
          title="Income & Credits"
          expenses={credits}
          type="credit"
          icon={TrendingUp}
          colorClass="text-green-600"
          bgClass="bg-green-100"
        />
      )}

      {/* Debits Section */}
      {debits.length > 0 && (
        <ExpenseSection
          title="Expenses & Debits"
          expenses={debits}
          type="debit"
          icon={TrendingDown}
          colorClass="text-red-600"
          bgClass="bg-red-100"
        />
      )}

      {creditDebitNotes.length > 0 && (
        <ExpenseSection
          title="Credit/Debit Notes"
          expenses={creditDebitNotes}
          type="notes"
          icon={Receipt}
          colorClass="text-purple-600"
          bgClass="bg-purple-100"
        />
      )}
      {credits.length === 0 &&
        debits.length === 0 &&
        creditDebitNotes.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Receipt className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              No Expenses Found
            </h3>
            <p className="text-gray-500 text-xs">
              No expenses available for the selected month.
            </p>
          </div>
        )}
      {/* Empty State */}
      {!expenseSummary?.summary?.length && !loading && (
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Receipt className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            No Expenses Found
          </h3>
          <p className="text-gray-500 text-xs">
            No expense data available for the selected month.
          </p>
        </div>
      )}
    </div>
  );
};

const ActivityLogs = ({ selectedMonth, shopId }) => {
  const [allActivities, setAllActivities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    role: "",
    action: "",
    email: "",
    fromDate: "",
    toDate: "",
  });

  // Fetch once on mount or when month/shopId changes
  useEffect(() => {
    fetchActivities();
  }, [selectedMonth, shopId]);

  // Apply frontend-only filtering
  useEffect(() => {
    const filtered = allActivities.filter((activity) => {
      const { role, action, email, fromDate, toDate } = filters;

      const matchesRole = !role || activity.role === role;
      const matchesAction =
        !action ||
        activity.action?.toLowerCase().includes(action.toLowerCase());
      const matchesEmail =
        !email || activity.email?.toLowerCase().includes(email.toLowerCase());

      const activityDate = new Date(activity.createdAt);
      const matchesFromDate = !fromDate || new Date(fromDate) <= activityDate;
      const matchesToDate =
        !toDate || activityDate <= new Date(toDate + "T23:59:59");

      return (
        matchesRole &&
        matchesAction &&
        matchesEmail &&
        matchesFromDate &&
        matchesToDate
      );
    });

    setActivities(filtered);
  }, [filters, allActivities]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const response = await getAllActivity(shopId, selectedMonth); // no filters passed
      setAllActivities(response || []);
    } catch (err) {
      console.error("Failed to fetch activity logs", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      role: "",
      action: "",
      email: "",
      fromDate: "",
      toDate: "",
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "user":
        return "bg-blue-100 text-blue-800";
      case "manager":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getActionIcon = (action) => {
    if (action?.includes("login")) return "🔐";
    if (action?.includes("create")) return "➕";
    if (action?.includes("update")) return "✏️";
    if (action?.includes("delete")) return "🗑️";
    return "📋";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-gray-600 text-sm">Loading activity logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl p-6 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <p className="text-purple-100 text-xs font-medium">
                  Total Activities
                </p>
                <p className="text-xl font-bold">{activities.length}</p>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-purple-100 text-xs">This Month</p>
            <p className="text-lg font-bold">{selectedMonth}</p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Activity className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Activity Filters
              </h3>
              <p className="text-gray-600 text-xs">
                Filter activities by role, action, or user
              </p>
            </div>
          </div>
          <button
            onClick={clearFilters}
            className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Clear Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange("role", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Action
            </label>
            <input
              type="text"
              value={filters.action}
              onChange={(e) => handleFilterChange("action", e.target.value)}
              placeholder="Search actions..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="text"
              value={filters.email}
              onChange={(e) => handleFilterChange("email", e.target.value)}
              placeholder="Search by email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => handleFilterChange("fromDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => handleFilterChange("toDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Activity List */}
      {activities.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-purple-600" />
              Activity Timeline
            </h3>
            <p className="text-gray-600 mt-1 text-xs">
              Recent activities in your system
            </p>
          </div>

          <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
            {activities.map((activity, index) => (
              <div
                key={activity._id || index}
                className="px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm">
                      {getActionIcon(activity.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {activity.email}
                        </span>
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(
                            activity.role
                          )}`}
                        >
                          {activity.role}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                      {activity.role}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Activity className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">
            No Activities Found
          </h3>
          <p className="text-gray-500 text-xs">
            No activity logs available for the selected month and filters.
          </p>
        </div>
      )}
    </div>
  );
};

// Main Component
const ExpensesDashboard = () => {
  const [searchParams, setSearchParams] = useState(
    new URLSearchParams(window.location.search)
  );
  const currentMonth = new Date().toISOString().slice(0, 7);
  const initialMonth = searchParams.get("month") || currentMonth;
  const initialTab = searchParams.get("tab") || "expenses";

  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [activeMonths, setActiveMonths] = useState([]);

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

  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(year, month - 1);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("tab", tab);
    setSearchParams(newParams);
    window.history.pushState(
      {},
      "",
      `${window.location.pathname}?${newParams}`
    );
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("month", month);
    setSearchParams(newParams);
    window.history.pushState(
      {},
      "",
      `${window.location.pathname}?${newParams}`
    );
  };

  return (
    <>
      <ModernNavbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Fixed Navbar at the top */}
        <div className="fixed top-16 left-0 right-0 z-10 bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4">
            {/* Navigation Tabs */}
            <div className="border-b border-gray-100">
              <div className="flex">
                <button
                  className={`flex-1 px-6 py-4 text-sm font-semibold border-b-2 transition-all duration-300 ${
                    activeTab === "expenses"
                      ? "border-blue-500 text-blue-600 bg-blue-50"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  onClick={() => handleTabChange("expenses")}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Receipt className="w-4 h-4" />
                    <span>Expenses Overview</span>
                  </div>
                </button>
                <button
                  className={`flex-1 px-6 py-4 text-sm font-semibold border-b-2 transition-all duration-300 ${
                    activeTab === "notes"
                      ? "border-blue-500 text-blue-600 bg-blue-50"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  onClick={() => handleTabChange("notes")}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>Customer Accounts</span>
                  </div>
                </button>
                <button
                  className={`flex-1 px-6 py-4 text-sm font-semibold border-b-2 transition-all duration-300 ${
                    activeTab === "activity"
                      ? "border-blue-500 text-blue-600 bg-blue-50"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                  onClick={() => handleTabChange("activity")}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Activity className="w-4 h-4" />
                    <span>Activity Logs</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content container with padding to account for fixed navbar height */}
        <div className="pt-24 pb-6 max-w-6xl mx-auto px-4">
          {/* Month Selection */}
          {activeTab != "activity" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden p-6 mt-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">
                      Select Month
                    </h2>
                    <p className="text-gray-600 text-xs">
                      Choose a month to view data
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Currently viewing</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatMonth(selectedMonth)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {activeMonths.map(({ month }) => {
                  const [mon, yr] = formatMonth(month).split(" ");
                  const isActive = selectedMonth === month;

                  return (
                    <button
                      key={month}
                      onClick={() => handleMonthChange(month)}
                      className={`p-2 rounded text-xs font-medium text-center transition ${
                        isActive
                          ? "bg-blue-600 text-white shadow scale-105"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <div className="opacity-70">{mon}</div>
                      <div className="text-sm font-bold">{yr}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {/* Tab Content */}
          <div className="transition-all duration-300">
            {activeTab === "expenses" && (
              <ExpenseSummary selectedMonth={selectedMonth} shopId={shopId} />
            )}
            {activeTab === "notes" && (
              <CreditDebitNotes selectedMonth={selectedMonth} shopId={shopId} />
            )}
            {activeTab === "activity" && (
              <ActivityLogs selectedMonth={selectedMonth} shopId={shopId} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ExpensesDashboard;
