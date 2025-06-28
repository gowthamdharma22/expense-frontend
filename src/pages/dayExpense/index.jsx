import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Calendar,
  DollarSign,
  Save,
  X,
  TrendingUp,
  TrendingDown,
  Check,
  FileText,
  Lock,
  Trash2,
} from "lucide-react";
import {
  adjustTransaction,
  createDayExpense,
  getDayExpenseByDate,
  getExpenseByShopId,
  updateDayExpense,
  // verifyDayExpense,
  // deleteDayExpense,
  // verifyIndividualExpense,
} from "../../api/api";
import { useParams, useSearchParams } from "react-router-dom";

function MonthlyExpenseSheet() {
  const [templateId, setTemplateId] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);
  const [defaultExpenses, setDefaultExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [hasScrolled, setHasScrolled] = useState(false);
  const dayRefs = useRef({});
  const scrollPositions = useRef({});
  const inputRefs = useRef({});

  const [newExpense, setNewExpense] = useState({
    dayId: null,
    expenseId: "",
    amount: "",
    description: "",
    type: "debit",
  });

  const { selectedMonth } = useParams();
  const [searchParams] = useSearchParams();
  const shopId = searchParams.get("shopId");

  useEffect(() => {
    fetchMonthlyData();
    fetchDefaultExpenses();
  }, [selectedMonth, shopId]);

  useEffect(() => {
    if (!hasScrolled && monthlyData.length > 0) {
      const today = new Date().toISOString().split("T")[0];
      const todaySection = monthlyData.find(
        (dayData) => dayData.day.date.split("T")[0] === today
      );
      if (todaySection && dayRefs.current[todaySection.day.id]) {
        dayRefs.current[todaySection.day.id].scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
        setHasScrolled(true);
      }
    }
  }, [monthlyData, hasScrolled]);

  const fetchMonthlyData = async () => {
    setLoading(true);
    try {
      const response = await getDayExpenseByDate(selectedMonth, shopId);
      setMonthlyData(response.data);
      if (response.data.length > 0 && response.data[0].expenses.length > 0) {
        setTemplateId(response.data[0].expenses[0]?.templateId || 0);
      }
    } catch (error) {
      console.error("Error fetching monthly data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDefaultExpenses = async () => {
    try {
      const response = await getExpenseByShopId(shopId);
      setDefaultExpenses(response.data);
    } catch (error) {
      console.error("Error fetching default expenses:", error);
    }
  };
  // Replace the findNextEditableCell function
  const findNextEditableCell = (currentExpenseId, currentField) => {
    // Find current expense index and day
    let currentDayIndex = -1;
    let currentExpenseIndex = -1;

    for (let dayIndex = 0; dayIndex < monthlyData.length; dayIndex++) {
      const expenseIndex = monthlyData[dayIndex].expenses.findIndex(
        (exp) => exp.id === currentExpenseId
      );
      if (expenseIndex !== -1) {
        currentDayIndex = dayIndex;
        currentExpenseIndex = expenseIndex;
        break;
      }
    }

    if (currentDayIndex === -1) return null;

    // If current field is description, move to amount of same expense
    if (currentField === "description") {
      return {
        expenseId: currentExpenseId,
        field: "amount",
        dayId: monthlyData[currentDayIndex].expenses[currentExpenseIndex].dayId,
      };
    }

    // If current field is amount, move to next expense's amount
    if (currentField === "amount") {
      // Check remaining expenses in current day
      for (
        let expenseIndex = currentExpenseIndex + 1;
        expenseIndex < monthlyData[currentDayIndex].expenses.length;
        expenseIndex++
      ) {
        const expense = monthlyData[currentDayIndex].expenses[expenseIndex];
        return {
          expenseId: expense.id,
          field: "amount",
          dayId: expense.dayId,
        };
      }

      // No more expenses in current day, move to new expense row
      const currentDay = monthlyData[currentDayIndex];
      return {
        expenseId: `new-${currentDay.day.id}`,
        field: "expenseId",
        dayId: currentDay.day.id,
        isNewExpense: true,
      };
    }

    return null;
  };

  // Replace the handleCellSave function
  const handleCellSave = async (expense, field, fromEnterKey = false) => {
    // Get current and new values
    const currentValue =
      field === "description"
        ? expense?.description || expense.expense.description || ""
        : expense.amount;

    const newValue =
      field === "description" ? editValue.trim() : parseFloat(editValue || 0);

    // Check if value has actually changed
    const hasChanged =
      field === "description"
        ? editValue.trim() !== (currentValue || "").trim()
        : parseFloat(editValue || 0) !== parseFloat(currentValue || 0);

    const dayId = expense.dayId;
    scrollPositions.current[dayId] = dayRefs.current[dayId]?.scrollTop || 0;

    // Only make API call if value has changed and is not empty
    if (hasChanged && (field === "amount" ? newValue > 0 : newValue !== "")) {
      const payload = {
        shopId: shopId,
        expenseId: expense.expenseId,
        dayId: expense.dayId,
        templateId: expense.templateId,
        amount: field === "amount" ? newValue : expense.amount,
        description:
          field === "description"
            ? newValue
            : expense.description || expense.expense.description,
      };

      try {
        await updateDayExpense(expense.id, payload);

        const updatedData = monthlyData.map((day) => {
          if (day.day.id === expense.dayId) {
            return {
              ...day,
              expenses: day.expenses.map((e) =>
                e.id === expense.id ? { ...e, ...payload } : e
              ),
            };
          }
          return day;
        });
        setMonthlyData(updatedData);
      } catch (error) {
        console.error("Error saving expense:", error);
        fetchMonthlyData();
        return;
      }
    }

    setEditingCell(null);
    setEditValue("");

    // Only navigate to next cell if Enter was pressed, not on blur/click
    if (fromEnterKey) {
      const nextCell = findNextEditableCell(expense.id, field);

      if (nextCell) {
        setTimeout(() => {
          if (nextCell.isNewExpense) {
            // Moving to new expense row
            const expenseSelect =
              inputRefs.current[`${nextCell.dayId}-expenseId`];
            if (expenseSelect) {
              expenseSelect.focus();
            }
          } else {
            // Moving to existing expense
            const nextExpense = monthlyData
              .flatMap((day) => day.expenses)
              .find((exp) => exp.id === nextCell.expenseId);

            if (nextExpense) {
              const nextCellValue =
                nextCell.field === "amount"
                  ? nextExpense.amount
                  : nextExpense.description ||
                    nextExpense.expense.description ||
                    "";

              handleCellClick(
                nextCell.expenseId,
                nextCell.field,
                nextCellValue
              );
            }
          }
        }, 100);
      }
    }

    // Restore scroll position
    setTimeout(() => {
      if (dayRefs.current[dayId]) {
        dayRefs.current[dayId].scrollTop = scrollPositions.current[dayId];
      }
    }, 0);
  };

  // Replace the handleKeyPress function
  const handleKeyPress = (e, expense, field) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCellSave(expense, field, true); // Pass true to indicate Enter key was pressed
    } else if (e.key === "Escape") {
      handleCellCancel();
    } else if (e.key === "Tab") {
      e.preventDefault();
      handleCellSave(expense, field, true); // Pass true to indicate Tab key was pressed
    }
  };

  // Replace the handleCellClick function
  const handleCellClick = (rowId, field, currentValue) => {
    setEditingCell(`${rowId}-${field}`);
    setEditValue(currentValue === 0 ? "" : currentValue.toString());

    setTimeout(() => {
      const input = inputRefs.current[`${rowId}-${field}`];
      if (input) {
        input.focus();
        input.select();
      }
    }, 50); // Slightly increased timeout for better reliability
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const handleAddExpense = async (dayData) => {
    if (!newExpense.expenseId || !newExpense.amount || !newExpense.dayId)
      return;

    const dayId = newExpense.dayId;
    scrollPositions.current[dayId] = dayRefs.current[dayId]?.scrollTop || 0;

    const expenseId = parseInt(newExpense.expenseId);
    const payload = {
      dayId: newExpense.dayId,
      expenseId: expenseId,
      templateId: templateId,
      amount: parseFloat(newExpense.amount),
      description: newExpense.description,
    };

    try {
      const response = await createDayExpense(payload);
      const updatedData = monthlyData.map((day) => {
        if (day.day.id === newExpense.dayId) {
          const expenseType = defaultExpenses.find(
            (e) => e.id === expenseId
          ) || {
            id: expenseId,
            name: newExpense.type === "credit" ? "Credit" : "Debit",
            type: newExpense.type,
            description: newExpense.description,
          };
          return {
            ...day,
            expenses: [
              ...day.expenses,
              {
                ...payload,
                id: response.data.id,
                isVerified: false,
                expense: expenseType,
              },
            ],
          };
        }
        return day;
      });
      setMonthlyData(updatedData);
      setNewExpense({
        dayId: null,
        expenseId: "",
        amount: "",
        description: "",
        type: "debit",
      });

      setTimeout(() => {
        if (dayRefs.current[dayId]) {
          dayRefs.current[dayId].scrollTop = scrollPositions.current[dayId];
        }
      }, 0);
    } catch (error) {
      console.error("Error saving expense:", error);
    }
  };

  const handleAddAdjust = async (dayData) => {
    if (!newExpense.amount || !newExpense.dayId) return;

    const dayId = newExpense.dayId;
    scrollPositions.current[dayId] = dayRefs.current[dayId]?.scrollTop || 0;

    const payload = {
      shopId: shopId,
      amount: parseFloat(newExpense.amount),
      description: newExpense.description,
      type: newExpense.type,
      dayId: newExpense.dayId,
    };

    try {
      await adjustTransaction(payload);
      const updatedData = monthlyData.map((day) => {
        if (day.day.id === newExpense.dayId) {
          return {
            ...day,
            expenses: [
              ...day.expenses,
              {
                id: Date.now(),
                ...payload,
                expenseId: newExpense.type === "credit" ? 1 : 2,
                templateId: templateId,
                isVerified: false,
                expense: {
                  id: newExpense.type === "credit" ? 1 : 2,
                  name:
                    newExpense.type === "credit"
                      ? "Adjustment Credit"
                      : "Adjustment Debit",
                  type: newExpense.type,
                  description: newExpense.description,
                },
              },
            ],
          };
        }
        return day;
      });
      setMonthlyData(updatedData);
      setNewExpense({
        dayId: null,
        expenseId: "",
        amount: "",
        description: "",
        type: "debit",
      });

      setTimeout(() => {
        if (dayRefs.current[dayId]) {
          dayRefs.current[dayId].scrollTop = scrollPositions.current[dayId];
        }
        setTimeout(() => fetchMonthlyData(), 500);
      }, 0);
    } catch (error) {
      console.error("Error saving adjustment:", error);
    }
  };

  const handleVerifyDay = async (dayData) => {
    try {
      // await verifyDayExpense(dayData.day.id, !dayData.day.isVerified);
      const updatedData = monthlyData.map((day) => {
        if (day.day.id === dayData.day.id) {
          return {
            ...day,
            day: { ...day.day, isVerified: !day.day.isVerified },
          };
        }
        return day;
      });
      setMonthlyData(updatedData);
    } catch (err) {
      console.error(err);
      fetchMonthlyData();
    }
  };

  const handleFreezeDay = async (dayData) => {
    try {
      const updatedData = monthlyData.map((day) => {
        if (day.day.id === dayData.day.id) {
          return {
            ...day,
            day: { ...day.day, isFrozen: !day.day.isFrozen },
          };
        }
        return day;
      });
      setMonthlyData(updatedData);
    } catch (err) {
      console.error(err);
      fetchMonthlyData();
    }
  };

  const handleDeleteDay = async (dayId) => {
    if (
      window.confirm("Are you sure you want to delete this day's expenses?")
    ) {
      try {
        // await deleteDayExpense(dayId);
        setMonthlyData(monthlyData.filter((day) => day.day.id !== dayId));
      } catch (err) {
        console.error(err);
        fetchMonthlyData();
      }
    }
  };

  const handleVerifyExpense = async (expense) => {
    try {
      // await verifyIndividualExpense(expense.id, !expense.isVerified);
      const updatedData = monthlyData.map((day) => {
        if (day.day.id === expense.dayId) {
          return {
            ...day,
            expenses: day.expenses.map((e) =>
              e.id === expense.id ? { ...e, isVerified: !e.isVerified } : e
            ),
          };
        }
        return day;
      });
      setMonthlyData(updatedData);
    } catch (err) {
      console.error(err);
      fetchMonthlyData();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatMonthYear = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const calculateDayTotals = (expenses) => {
    const creditTotal = expenses
      .filter((e) => e.expense.type === "credit")
      .reduce((sum, e) => sum + e.amount, 0);
    const debitTotal = expenses
      .filter((e) => e.expense.type === "debit")
      .reduce((sum, e) => sum + e.amount, 0);
    const total = creditTotal - debitTotal;
    return { creditTotal, debitTotal, total };
  };

  const calculateMonthlyTotals = () => {
    let totalCredit = 0;
    let totalDebit = 0;

    monthlyData.forEach((dayData) => {
      dayData.expenses.forEach((expense) => {
        if (expense.expense.type === "credit") {
          totalCredit += expense.amount;
        } else {
          totalDebit += expense.amount;
        }
      });
    });

    return { totalCredit, totalDebit, netAmount: totalCredit - totalDebit };
  };

  const monthlyTotals = calculateMonthlyTotals();

  const getSelectedExpenseType = (expenseId, dayId) => {
    if (!expenseId || expenseId === "custom") return null;
    const selectedExpense = defaultExpenses.find((exp) => exp.id == expenseId);
    return selectedExpense?.type || "debit";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <FileText className="w-8 h-8" />
              <div>
                <h1 className="text-xl font-semibold">Monthly Expense Sheet</h1>
                <p className="text-sm opacity-90">
                  {monthlyData.length > 0
                    ? formatMonthYear(monthlyData[0].day.date)
                    : selectedMonth}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">
                Shop ID: <span className="font-bold">{shopId}</span>
              </span>
              <div className="bg-white/10 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium">Monthly Total: </span>
                <span className="text-lg font-bold">
                  ₹{monthlyTotals.netAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Overview Cards */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 border-b border-gray-200">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">
                  Total Credit
                </p>
                <p className="text-xl font-bold text-green-700">
                  ₹{monthlyTotals.totalCredit.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">Total Debit</p>
                <p className="text-xl font-bold text-red-700">
                  ₹{monthlyTotals.totalDebit.toLocaleString()}
                </p>
              </div>
              <TrendingDown className="w-6 h-6 text-red-500" />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Net Amount</p>
                <p className="text-xl font-bold text-blue-700">
                  ₹{monthlyTotals.netAmount.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Daily Expense Tables */}
        <div className="p-6 space-y-6">
          {monthlyData.map((dayData) => {
            const { creditTotal, debitTotal, total } = calculateDayTotals(
              dayData.expenses
            );
            const isToday =
              dayData.day.date.split("T")[0] ===
              new Date().toISOString().split("T")[0];
            return (
              <div
                key={dayData.day.id}
                className={`rounded-lg overflow-hidden border border-gray-200 ${
                  isToday ? "bg-yellow-50" : "bg-white"
                }`}
                ref={(el) => (dayRefs.current[dayData.day.id] = el)}
              >
                {/* Day Header */}
                <div
                  className={`px-4 py-3 border-b border-gray-200 flex items-center justify-between ${
                    isToday ? "bg-yellow-50" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-600" />
                    <h3
                      className={`text-base font-semibold ${
                        isToday ? "text-blue-700" : "text-gray-800"
                      }`}
                    >
                      {formatDate(dayData.day.date)}
                    </h3>
                    <span className="text-sm text-gray-500">
                      ({dayData.expenses.length} expenses)
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-sm">
                      <span className="text-gray-600">
                        {total < 0 ? "Cash Difference: " : "Day Total: "}
                      </span>
                      <span
                        className={`font-semibold ${
                          total < 0 ? "text-red-600" : "text-blue-600"
                        }`}
                      >
                        ₹{Math.abs(total).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          dayData.day.isVerified
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {dayData.day.isVerified ? "Verified" : "Not Verified"}
                      </span>
                      <button
                        onClick={() => handleVerifyDay(dayData)}
                        disabled={dayData.day.isFrozen}
                        className={`px-3 py-1 rounded text-white text-xs font-medium flex items-center space-x-1 ${
                          dayData.day.isVerified
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-blue-600 hover:bg-blue-700"
                        } ${
                          dayData.day.isFrozen
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        <span>
                          {dayData.day.isVerified ? "Unverify" : "Verify"}
                        </span>
                      </button>
                      <button
                        onClick={() => handleFreezeDay(dayData)}
                        disabled={dayData.day.isVerified}
                        className={`px-3 py-1 rounded text-white text-xs font-medium flex items-center space-x-1 ${
                          dayData.day.isFrozen
                            ? "bg-gray-600 hover:bg-gray-700"
                            : "bg-blue-600 hover:bg-blue-700"
                        } ${
                          dayData.day.isVerified
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <Lock className="w-3 h-3" />
                        <span>
                          {dayData.day.isFrozen ? "Unfreeze" : "Freeze"}
                        </span>
                      </button>
                      <button
                        onClick={() => handleDeleteDay(dayData.day.id)}
                        disabled={
                          dayData.day.isFrozen || dayData.day.isVerified
                        }
                        className={`px-3 py-1 rounded text-white text-xs font-medium flex items-center space-x-1 bg-red-600 hover:bg-red-700
                          ${
                            dayData.day.isFrozen || dayData.day.isVerified
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Day Expenses Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 text-xs font-semibold uppercase">
                        <th className="border border-gray-200 px-4 py-2 w-16">
                          S.No
                        </th>
                        <th className="border border-gray-200 px-4 py-2 min-w-[150px]">
                          Expense Name
                        </th>
                        <th className="border border-gray-200 px-4 py-2 min-w-[200px]">
                          Description
                        </th>
                        <th className="border border-gray-200 px-4 py-2 w-28">
                          Credit (₹)
                        </th>
                        <th className="border border-gray-200 px-4 py-2 w-28">
                          Debit (₹)
                        </th>
                        <th className="border border-gray-200 px-4 py-2 w-20">
                          Type
                        </th>
                        <th className="border border-gray-200 px-4 py-2 w-24">
                          Status
                        </th>
                        <th className="border border-gray-200 px-4 py-2 w-32">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {dayData.expenses.map((expense, index) => (
                        <tr
                          key={expense.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="border border-gray-200 px-4 py-2 text-sm text-center bg-gray-50">
                            {index + 1}
                          </td>
                          <td className="border border-gray-200 px-4 py-2 text-sm font-medium text-gray-800">
                            {expense.expense.name}
                          </td>
                          <td className="border border-gray-200 px-0 py-0">
                            {editingCell === `${expense.id}-description` ? (
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={() =>
                                  handleCellSave(expense, "description", false)
                                }
                                onKeyDown={(e) =>
                                  handleKeyPress(e, expense, "description")
                                }
                                className="w-full h-full px-3 py-2 border-0 focus:outline-none focus:bg-white text-sm text-gray-600"
                                ref={(el) =>
                                  (inputRefs.current[
                                    `${expense.id}-description`
                                  ] = el)
                                }
                                autoFocus
                              />
                            ) : (
                              <div
                                className="px-3 py-2 cursor-text hover:bg-gray-100 min-h-[38px] text-sm text-gray-600"
                                onClick={() =>
                                  handleCellClick(
                                    expense.id,
                                    "description",
                                    expense.description ||
                                      expense.expense.description ||
                                      ""
                                  )
                                }
                              >
                                {expense.description ||
                                  expense.expense.description ||
                                  ""}
                              </div>
                            )}
                          </td>
                          <td className="border border-gray-200 px-0 py-0">
                            {expense.expense.type === "credit" ? (
                              editingCell === `${expense.id}-amount` ? (
                                <input
                                  type="number"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={() =>
                                    handleCellSave(expense, "amount", false)
                                  }
                                  onKeyDown={(e) =>
                                    handleKeyPress(e, expense, "amount")
                                  }
                                  className="w-full h-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm text-green-600 font-medium"
                                  ref={(el) =>
                                    (inputRefs.current[`${expense.id}-amount`] =
                                      el)
                                  }
                                  autoFocus
                                />
                              ) : (
                                <div
                                  className="px-3 py-2 cursor-text hover:bg-gray-100 min-h-[38px] text-sm text-green-600 font-medium"
                                  onClick={() =>
                                    handleCellClick(
                                      expense.id,
                                      "amount",
                                      expense.amount
                                    )
                                  }
                                >
                                  {expense.amount === 0
                                    ? ""
                                    : expense.amount.toLocaleString()}
                                </div>
                              )
                            ) : (
                              <div className="px-3 py-2 text-center text-gray-400 text-sm">
                                -
                              </div>
                            )}
                          </td>
                          <td className="border border-gray-200 px-0 py-0">
                            {expense.expense.type === "debit" ? (
                              editingCell === `${expense.id}-amount` ? (
                                <input
                                  type="number"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={() =>
                                    handleCellSave(expense, "amount")
                                  }
                                  onKeyDown={(e) =>
                                    handleKeyPress(e, expense, "amount")
                                  }
                                  className="w-full h-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm text-red-600 font-medium"
                                  ref={(el) =>
                                    (inputRefs.current[`${expense.id}-amount`] =
                                      el)
                                  }
                                  autoFocus
                                />
                              ) : (
                                <div
                                  className="px-3 py-2 cursor-text hover:bg-gray-100 min-h-[38px] text-sm text-red-600 font-medium"
                                  onClick={() =>
                                    handleCellClick(
                                      expense.id,
                                      "amount",
                                      expense.amount
                                    )
                                  }
                                >
                                  {expense.amount === 0
                                    ? ""
                                    : expense.amount.toLocaleString()}
                                </div>
                              )
                            ) : (
                              <div className="px-3 py-2 text-center text-gray-400 text-sm">
                                -
                              </div>
                            )}
                          </td>
                          <td className="border border-gray-200 px-4 py-2 text-sm text-center">
                            <span
                              className={
                                expense.expense.type === "credit"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {expense.expense.type}
                            </span>
                          </td>
                          <td className="border border-gray-200 px-4 py-2 text-center">
                            <button
                              onClick={() => handleVerifyExpense(expense)}
                              className={`px-2 py-1 text-xs font-medium rounded ${
                                expense.isVerified
                                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                                  : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                              }`}
                            >
                              {expense.isVerified ? "✓ Verified" : "✗ Verify"}
                            </button>
                          </td>
                          <td className="border border-gray-200 px-4 py-2 text-center space-x-2">
                            <button
                              onClick={() =>
                                handleCellSave(
                                  expense,
                                  editingCell?.includes("amount")
                                    ? "amount"
                                    : "description"
                                )
                              }
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                              title="Save"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCellCancel}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {/* New Expense Row */}
                      <tr className="bg-blue-50">
                        <td className="border border-gray-200 px-4 py-2 text-sm text-center bg-gray-50">
                          {dayData.expenses.length + 1}
                        </td>
                        <td className="border border-gray-200 px-0 py-0">
                          <select
                            value={
                              newExpense.dayId === dayData.day.id
                                ? newExpense.expenseId
                                : ""
                            }
                            onChange={(e) => {
                              const selectedExpenseId = e.target.value;
                              const selectedExpenseType =
                                getSelectedExpenseType(
                                  selectedExpenseId,
                                  dayData.day.id
                                );

                              setNewExpense({
                                ...newExpense,
                                dayId: dayData.day.id,
                                expenseId: selectedExpenseId,
                                type: selectedExpenseType || "debit", // Auto-set type based on selected expense
                              });
                            }}
                            className="w-full h-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm bg-white"
                            ref={(el) =>
                              (inputRefs.current[
                                `${dayData.day.id}-expenseId`
                              ] = el)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                inputRefs.current[
                                  `${dayData.day.id}-description`
                                ]?.focus();
                              }
                            }}
                          >
                            <option value="">Select expense</option>
                            {defaultExpenses.map((expense) => (
                              <option key={expense.id} value={expense.id}>
                                {expense.name}
                              </option>
                            ))}
                            <option value="custom">Custom Credit/Debit</option>
                          </select>
                        </td>
                        <td className="border border-gray-200 px-0 py-0">
                          <input
                            type="text"
                            value={
                              newExpense.dayId === dayData.day.id
                                ? newExpense.description
                                : ""
                            }
                            onChange={(e) =>
                              setNewExpense({
                                ...newExpense,
                                dayId: dayData.day.id,
                                description: e.target.value,
                              })
                            }
                            className="w-full h-full px-3 py-2 border-0 focus:outline-none focus:bg-white text-sm text-gray-600"
                            placeholder="Enter description"
                            ref={(el) =>
                              (inputRefs.current[
                                `${dayData.day.id}-description`
                              ] = el)
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                inputRefs.current[
                                  `${dayData.day.id}-type`
                                ]?.focus();
                              }
                            }}
                          />
                        </td>
                        <td className="border border-gray-200 px-0 py-0">
                          {newExpense.dayId === dayData.day.id &&
                          (newExpense.type === "credit" ||
                            getSelectedExpenseType(
                              newExpense.expenseId,
                              dayData.day.id
                            ) === "credit") ? (
                            <input
                              type="number"
                              value={newExpense.amount}
                              onChange={(e) =>
                                setNewExpense({
                                  ...newExpense,
                                  dayId: dayData.day.id,
                                  amount: e.target.value,
                                })
                              }
                              className="w-full h-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm text-green-600 font-medium"
                              placeholder="Credit amount"
                              ref={(el) =>
                                (inputRefs.current[`${dayData.day.id}-amount`] =
                                  el)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  newExpense.expenseId === "custom"
                                    ? handleAddAdjust(dayData)
                                    : handleAddExpense(dayData);
                                }
                              }}
                            />
                          ) : (
                            <div className="px-3 py-2 text-center text-gray-400 text-sm">
                              -
                            </div>
                          )}
                        </td>
                        <td className="border border-gray-200 px-0 py-0">
                          {newExpense.dayId === dayData.day.id &&
                          (newExpense.type === "debit" ||
                            getSelectedExpenseType(
                              newExpense.expenseId,
                              dayData.day.id
                            ) === "debit") ? (
                            <input
                              type="number"
                              value={newExpense.amount}
                              onChange={(e) =>
                                setNewExpense({
                                  ...newExpense,
                                  dayId: dayData.day.id,
                                  amount: e.target.value,
                                })
                              }
                              className="w-full h-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm text-red-600 font-medium"
                              placeholder="Debit amount"
                              ref={(el) =>
                                (inputRefs.current[`${dayData.day.id}-amount`] =
                                  el)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  newExpense.expenseId === "custom"
                                    ? handleAddAdjust(dayData)
                                    : handleAddExpense(dayData);
                                }
                              }}
                            />
                          ) : (
                            <div className="px-3 py-2 text-center text-gray-400 text-sm">
                              -
                            </div>
                          )}
                        </td>
                        <td className="border border-gray-200 px-0 py-0">
                          {newExpense.dayId === dayData.day.id &&
                          newExpense.expenseId === "custom" ? (
                            <select
                              value={newExpense.type}
                              onChange={(e) =>
                                setNewExpense({
                                  ...newExpense,
                                  dayId: dayData.day.id,
                                  type: e.target.value,
                                })
                              }
                              className="w-full h-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm bg-white"
                              ref={(el) =>
                                (inputRefs.current[`${dayData.day.id}-type`] =
                                  el)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  inputRefs.current[
                                    `${dayData.day.id}-amount`
                                  ]?.focus();
                                }
                              }}
                            >
                              <option value="debit">Debit</option>
                              <option value="credit">Credit</option>
                            </select>
                          ) : newExpense.dayId === dayData.day.id &&
                            newExpense.expenseId ? (
                            <div className="px-3 py-2 text-center text-sm">
                              <span
                                className={
                                  getSelectedExpenseType(
                                    newExpense.expenseId,
                                    dayData.day.id
                                  ) === "credit"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                {getSelectedExpenseType(
                                  newExpense.expenseId,
                                  dayData.day.id
                                ) || "debit"}
                              </span>
                            </div>
                          ) : (
                            <div className="px-3 py-2 text-center text-gray-400 text-sm">
                              -
                            </div>
                          )}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-center">
                          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                            ✗
                          </span>
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-center space-x-2">
                          <button
                            onClick={() =>
                              newExpense.expenseId === "custom"
                                ? handleAddAdjust(dayData)
                                : handleAddExpense(dayData)
                            }
                            disabled={!newExpense.dayId || !newExpense.amount}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Save"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setNewExpense({
                                dayId: null,
                                expenseId: "",
                                amount: "",
                                description: "",
                                type: "debit",
                              })
                            }
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                            title="Clear"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                      {/* Total Row */}
                      <tr className="bg-gray-100 font-semibold">
                        <td className="border border-gray-200 px-4 py-2 text-center text-sm">
                          -
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-sm">
                          TOTAL
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-sm">
                          -
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-sm text-green-600">
                          {creditTotal.toLocaleString()}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-sm text-red-600">
                          {debitTotal.toLocaleString()}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-sm text-blue-600">
                          {total.toLocaleString()}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-center text-sm">
                          -
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-center text-sm">
                          -
                        </td>
                      </tr>
                      {/* Cash Difference Row */}
                      <tr className="bg-gray-100 font-semibold">
                        <td className="border border-gray-200 px-4 py-2 text-center text-sm">
                          -
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-sm">
                          CASH DIFFERENCE
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-sm">
                          -
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-sm text-gray-400">
                          -
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-sm text-gray-400">
                          -
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-sm text-red-600">
                          {total < 0 ? Math.abs(total).toLocaleString() : "-"}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-center text-sm">
                          -
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-center text-sm">
                          -
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MonthlyExpenseSheet;
