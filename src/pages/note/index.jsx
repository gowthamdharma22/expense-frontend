import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Calendar,
  Search,
  Plus,
} from "lucide-react";
import { getNotesByShopId } from "../../api/api";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
const ExpenseNote = () => {
  const nav = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(false);
  const { shopId } = useParams();

  const [data, setData] = useState([]);

  const fetchData = async (dateToFetch = currentDate) => {
    try {
      setLoading(true);
      const response = await getNotesByShopId(
        shopId,
        formatDateForAPI(dateToFetch)
      );
      setData(response.data.records || []);
    } catch (err) {
      console.log("Error fetching data:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shopId) {
      fetchData();
    }
  }, [shopId]);

  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return `${year}-${month}`;
  };

  const formatDisplayDate = (date) => {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
    fetchData(newDate);
  };

  const filteredRecords = data.filter((record) => {
    const description = record.description || "";
    const matchesSearch = description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || record.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const totalCredit = data
    .filter((r) => r.type === "credit")
    .reduce((sum, r) => sum + r.amount, 0);

  const totalDebit = data
    .filter((r) => r.type === "debit")
    .reduce((sum, r) => sum + r.amount, 0);

  const netAmount = totalCredit - totalDebit;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Expense Tracker
          </h1>
          <p className="text-gray-600 text-sm">
            Track your income and expenses
          </p>
        </div>

        {/* Month Navigation */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateMonth(-1)}
              disabled={loading}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex items-center space-x-2 text-gray-900">
              <Calendar size={18} className="text-blue-600" />
              <span className="font-medium">
                {formatDisplayDate(currentDate)}
              </span>
              {loading && (
                <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              )}
            </div>

            <button
              onClick={() => navigateMonth(1)}
              disabled={loading}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Income</p>
                <p className="text-xl font-semibold text-green-600">
                  {formatCurrency(totalCredit)}
                </p>
              </div>
              <TrendingUp size={24} className="text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expenses</p>
                <p className="text-xl font-semibold text-red-600">
                  {formatCurrency(totalDebit)}
                </p>
              </div>
              <TrendingDown size={24} className="text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Balance</p>
                <p
                  className={`text-xl font-semibold ${
                    netAmount >= 0 ? "text-blue-600" : "text-red-600"
                  }`}
                >
                  {formatCurrency(netAmount)}
                </p>
              </div>
              {netAmount >= 0 ? (
                <TrendingUp size={24} className="text-blue-600" />
              ) : (
                <TrendingDown size={24} className="text-red-600" />
              )}
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All</option>
              <option value="credit">Income</option>
              <option value="debit">Expenses</option>
            </select>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                Transactions
              </h2>
              <button
                className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 text-sm"
                onClick={() => {
                  nav(`/dayCalender/${shopId}`);
                }}
              >
                <Plus size={16} />
                <span>Add</span>
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-500 text-sm">Loading...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Search size={32} className="mx-auto mb-2 text-gray-300" />
                <p>No transactions found</p>
              </div>
            ) : (
              filteredRecords.map((record, index) => (
                <div
                  key={record._id}
                  className={`p-4 hover:bg-gray-50 ${
                    index !== filteredRecords.length - 1 ? "border-b" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          record.type === "credit"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {record.type === "credit" ? (
                          <TrendingUp size={16} />
                        ) : (
                          <TrendingDown size={16} />
                        )}
                      </div>

                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {record.description ||
                            `${
                              record.type === "credit" ? "Income" : "Expense"
                            } #${record.id}`}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>{formatDateTime(record.createdAt)}</span>
                          {record.isAdjustment && (
                            <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs">
                              Adjustment
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          record.type === "credit"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {record.type === "credit" ? "+" : "-"}
                        {formatCurrency(record.amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Shop {record.shopId}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseNote;
