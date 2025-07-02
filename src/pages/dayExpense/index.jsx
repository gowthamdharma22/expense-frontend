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
  freezeDay,
  getDayExpenseByDate,
  getExpenseByShopId,
  updateDayExpense,
  verifyDay,
  verifyDayExpense,
  deleteDay,
  deleteDayExpense,
  getAllNoteUser,
  getActiveMonths,
} from "../../api/api";
import { useState, useRef, useEffect } from "react";

function MonthlyExpenseSheet() {
  const [searchParams, setSearchParams] = useState(
    new URLSearchParams(window.location.search)
  );
  const currentMonth = new Date().toISOString().slice(0, 7);

  const initialMonth = searchParams.get("month") || currentMonth;
  const [templateId, setTemplateId] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);
  const [defaultExpenses, setDefaultExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [hasScrolled, setHasScrolled] = useState(false);
  const [selectedExpenses, setSelectedExpenses] = useState({});
  const [daySelectAll, setDaySelectAll] = useState({});
  const [activeMonths, setActiveMonths] = useState([]);
  const [notesUser, setNotesUser] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const dayRefs = useRef({});
  const scrollPositions = useRef({});
  const inputRefs = useRef({});

  const [newExpense, setNewExpense] = useState({
    dayId: null,
    expenseId: "",
    amount: "",
    description: "",
    type: "debit",
    userId: "",
  });

  const shopId = searchParams.get("shopId");

  const getAllCreditDebitUsers = async () => {
    try {
      const res = await getAllNoteUser();
      setNotesUser(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchActiveMonths = async () => {
    try {
      const response = await getActiveMonths(shopId);
      setActiveMonths(response.data);
    } catch (err) {
      console.error("Failed to fetch active months");
    }
  };

  useEffect(() => {
    fetchMonthlyData();
    fetchDefaultExpenses();
    getAllCreditDebitUsers();
    fetchActiveMonths();
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
  const findNextEditableCell = (
    currentExpenseId,
    currentField,
    direction = "next"
  ) => {
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

    const currentExpense =
      monthlyData[currentDayIndex].expenses[currentExpenseIndex];

    switch (direction) {
      case "next":
        if (currentField === "description") {
          return {
            expenseId: currentExpenseId,
            field: "amount",
            dayId: currentExpense.dayId,
          };
        }
        if (currentField === "amount") {
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

          const currentDay = monthlyData[currentDayIndex];
          return {
            expenseId: `new-${currentDay.day.id}`,
            field: "expenseId",
            dayId: currentDay.day.id,
            isNewExpense: true,
          };
        }
        break;

      case "down":
        if (currentField === "amount") {
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
          for (
            let dayIndex = currentDayIndex + 1;
            dayIndex < monthlyData.length;
            dayIndex++
          ) {
            if (monthlyData[dayIndex].expenses.length > 0) {
              const firstExpense = monthlyData[dayIndex].expenses[0];
              return {
                expenseId: firstExpense.id,
                field: "amount",
                dayId: firstExpense.dayId,
              };
            }
          }
        }
        if (currentField === "description") {
          for (
            let expenseIndex = currentExpenseIndex + 1;
            expenseIndex < monthlyData[currentDayIndex].expenses.length;
            expenseIndex++
          ) {
            const expense = monthlyData[currentDayIndex].expenses[expenseIndex];
            return {
              expenseId: expense.id,
              field: "description",
              dayId: expense.dayId,
            };
          }

          for (
            let dayIndex = currentDayIndex + 1;
            dayIndex < monthlyData.length;
            dayIndex++
          ) {
            if (monthlyData[dayIndex].expenses.length > 0) {
              const firstExpense = monthlyData[dayIndex].expenses[0];
              return {
                expenseId: firstExpense.id,
                field: "description",
                dayId: firstExpense.dayId,
              };
            }
          }
        }
        break;

      case "up":
        if (currentField === "amount") {
          if (currentExpenseIndex > 0) {
            const prevExpense =
              monthlyData[currentDayIndex].expenses[currentExpenseIndex - 1];
            return {
              expenseId: prevExpense.id,
              field: "amount",
              dayId: prevExpense.dayId,
            };
          }

          for (let dayIndex = currentDayIndex - 1; dayIndex >= 0; dayIndex--) {
            if (monthlyData[dayIndex].expenses.length > 0) {
              const lastExpense =
                monthlyData[dayIndex].expenses[
                  monthlyData[dayIndex].expenses.length - 1
                ];
              return {
                expenseId: lastExpense.id,
                field: "amount",
                dayId: lastExpense.dayId,
              };
            }
          }
        }

        if (currentField === "description") {
          if (currentExpenseIndex > 0) {
            const prevExpense =
              monthlyData[currentDayIndex].expenses[currentExpenseIndex - 1];
            return {
              expenseId: prevExpense.id,
              field: "description",
              dayId: prevExpense.dayId,
            };
          }

          for (let dayIndex = currentDayIndex - 1; dayIndex >= 0; dayIndex--) {
            if (monthlyData[dayIndex].expenses.length > 0) {
              const lastExpense =
                monthlyData[dayIndex].expenses[
                  monthlyData[dayIndex].expenses.length - 1
                ];
              return {
                expenseId: lastExpense.id,
                field: "description",
                dayId: lastExpense.dayId,
              };
            }
          }
        }
        break;

      case "right":
        if (currentField === "description") {
          return {
            expenseId: currentExpenseId,
            field: "amount",
            dayId: currentExpense.dayId,
          };
        }
        break;

      case "left":
        if (currentField === "amount") {
          return {
            expenseId: currentExpenseId,
            field: "description",
            dayId: currentExpense.dayId,
          };
        }
        break;
    }

    return null;
  };

  const handleCellSave = async (
    expense,
    field,
    fromKeyPress = false,
    direction = "next"
  ) => {
    const currentValue =
      field === "description"
        ? expense?.description || expense.expense.description || ""
        : expense.amount;

    const newValue =
      field === "description" ? editValue.trim() : parseFloat(editValue || 0);

    const hasChanged =
      field === "description"
        ? editValue.trim() !== (currentValue || "").trim()
        : parseFloat(editValue || 0) !== parseFloat(currentValue || 0);

    const dayId = expense.dayId;
    scrollPositions.current[dayId] = dayRefs.current[dayId]?.scrollTop || 0;

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

    if (fromKeyPress) {
      const nextCell = findNextEditableCell(expense.id, field, direction);

      if (nextCell) {
        setTimeout(() => {
          if (nextCell.isNewExpense) {
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

    setTimeout(() => {
      if (dayRefs.current[dayId]) {
        dayRefs.current[dayId].scrollTop = scrollPositions.current[dayId];
      }
    }, 0);
  };

  const handleKeyPress = (e, expense, field) => {
    let direction = null;

    switch (e.key) {
      case "Enter":
        e.preventDefault();
        direction = "next";
        break;
      case "Tab":
        e.preventDefault();
        direction = e.shiftKey ? "up" : "next";
        break;
      case "ArrowDown":
        e.preventDefault();
        direction = "down";
        break;
      case "ArrowUp":
        e.preventDefault();
        direction = "up";
        break;
      case "ArrowRight":
        e.preventDefault();
        direction = "right";
        break;
      case "ArrowLeft":
        e.preventDefault();
        direction = "left";
        break;
      default:
        return; // Don't handle other keys
    }

    if (direction) {
      handleCellSave(expense, field, true, direction);
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
        // input.select();
      }
    }, 50); // Slightly increased timeout for better reliability
  };
  const handleCellDelete = async (expense) => {
    try {
      await deleteDayExpense(expense.id);

      setMonthlyData((prevData) =>
        prevData.map((day) => ({
          ...day,
          expenses: day.expenses.filter((e) => e.id !== expense.id),
        }))
      );

      setEditingCell(null);
      setEditValue("");
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  const handleAddExpense = async (dayData) => {
    if (!newExpense.expenseId || !newExpense.amount || !newExpense.dayId)
      return;

    const dayId = newExpense.dayId;
    scrollPositions.current[dayId] = dayRefs.current[dayId]?.scrollTop || 0;

    let expenseId;
    let expenseType;

    // Handle custom credit/debit
    if (newExpense.expenseId === "custom") {
      expenseId = newExpense.type === "credit" ? 1 : 2;
      expenseType = {
        id: expenseId,
        name: newExpense.type === "credit" ? "Credit" : "Debit",
        type: newExpense.type,
        description: newExpense.description,
      };
    } else {
      expenseId = parseInt(newExpense.expenseId);
      expenseType = defaultExpenses.find((e) => e.id === expenseId) || {
        id: expenseId,
        name: newExpense.type === "credit" ? "Credit" : "Debit",
        type: newExpense.type,
        description: newExpense.description,
      };
    }

    const payload = {
      dayId: newExpense.dayId,
      expenseId: expenseId,
      templateId: templateId,
      amount: parseFloat(newExpense.amount),
      description: newExpense.description,
      userId: parseInt(newExpense.userId) || "",
    };

    try {
      const response = await createDayExpense(payload);
      const updatedData = monthlyData.map((day) => {
        if (day.day.id === newExpense.dayId) {
          const selectedUser = notesUser.find(
            (u) => u.id === parseInt(newExpense.userId)
          );
          return {
            ...day,
            expenses: [
              ...day.expenses,
              {
                ...payload,
                id: response.data.id,
                isVerified: false,
                expense: expenseType,
                user: selectedUser || "",
                notesUser: selectedUser || "", // Add this for display
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
        userId: "",
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
      await verifyDay(dayData.day.id, !dayData.day.isVerified);
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
    console.log(dayData, "pkl");
    try {
      await freezeDay(dayData.day.id, dayData.day.isFrozen);
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
        await deleteDay(dayId);
        fetchMonthlyData();
      } catch (err) {
        console.error(err);
        fetchMonthlyData();
      }
    }
  };

  const handleVerifyExpense = async (expense) => {
    try {
      await verifyDayExpense(expense.id, !expense.isVerified);
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
  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(year, month - 1);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const isFutureDate = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateString);
    return date > today;
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

  const handleDaySelectAllAndVerify = async (dayId, isSelectingAll) => {
    const dayExpenses =
      monthlyData.find((d) => d.day.id === dayId)?.expenses || [];

    const updates = {};
    const selectedForDay = [];

    dayExpenses.forEach((expense) => {
      const key = `${dayId}-${expense.id}`;
      updates[key] = isSelectingAll;

      if (isSelectingAll) {
        selectedForDay.push(expense);
      }
    });

    setSelectedExpenses((prev) => ({
      ...prev,
      ...updates,
    }));

    setDaySelectAll((prev) => ({
      ...prev,
      [dayId]: isSelectingAll,
    }));

    if (dayExpenses.length > 0) {
      try {
        await Promise.all(
          dayExpenses.map((expense) =>
            verifyDayExpense(expense.id, isSelectingAll)
          )
        );

        setMonthlyData((prevData) =>
          prevData.map((day) =>
            day.day.id === dayId
              ? {
                  ...day,
                  expenses: day.expenses.map((expense) => ({
                    ...expense,
                    isVerified: isSelectingAll,
                  })),
                }
              : day
          )
        );
      } catch (error) {
        console.error("Error verifying/unverifying expenses:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
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
        <div className="fixed bottom-0 left-0 w-full z-[9999] bg-gradient-to-t from-white via-white to-white/95 backdrop-blur-sm border-t border-slate-200/80 shadow-lg">
          <div className="pl-5 pr-4 py-2">
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-9 gap-2">
              {activeMonths.map(({ month }) => {
                const [mon, yr] = formatMonth(month).split(" ");
                const isActive = selectedMonth === month;
                return (
                  <button
                    key={month}
                    onClick={() => handleMonthChange(month)}
                    className={`group relative flex flex-col items-center justify-center rounded-lg px-2 py-2 text-xs font-medium transition-all duration-200 ease-out transform hover:scale-105 active:scale-95 ${
                      isActive
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-400/30"
                        : "bg-gradient-to-br from-slate-50 to-slate-100 text-slate-700 hover:from-slate-100 hover:to-slate-200 hover:text-slate-800 shadow-sm hover:shadow-md border border-slate-200/50"
                    }`}
                  >
                    {/* Subtle glow effect for active state */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400/20 to-blue-600/20 blur-sm -z-10" />
                    )}

                    {/* Month abbreviation */}
                    <span
                      className={`leading-tight font-semibold text-[10px] ${
                        isActive ? "text-blue-100" : "text-slate-600"
                      }`}
                    >
                      {mon}
                    </span>

                    {/* Year */}
                    <span
                      className={`text-[9px] font-bold leading-tight ${
                        isActive ? "text-white" : "text-slate-500"
                      }`}
                    >
                      {yr}
                    </span>

                    {/* Hover indicator */}
                    <div
                      className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-0.5 rounded-full transition-all duration-200 ${
                        isActive
                          ? "bg-white/60"
                          : "bg-transparent group-hover:bg-slate-400/60"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-200/50 to-transparent" />
        </div>
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
                          Comments
                        </th>
                        <th className="border border-gray-200 px-4 py-2 min-w-[150px]">
                          Notes User
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
                        <th className="border border-gray-200 px-4 py-2 w-32">
                          Actions
                        </th>
                        <th className="border border-gray-200 px-4 py-2 w-24">
                          <div className="flex flex-col items-center space-y-1">
                            <span>Verify</span>
                            <input
                              type="checkbox"
                              checked={
                                dayData.expenses.length > 0 &&
                                dayData.expenses.every(
                                  (exp) =>
                                    selectedExpenses[
                                      `${dayData.day.id}-${exp.id}`
                                    ]
                                )
                              }
                              onChange={(e) =>
                                handleDaySelectAllAndVerify(
                                  dayData.day.id,
                                  e.target.checked
                                )
                              }
                              className="rounded"
                            />
                          </div>
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
                          <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">
                            {editingCell === `${expense.id}-description` ? (
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={() =>
                                  handleCellSave(expense, "description")
                                }
                                onKeyDown={(e) =>
                                  handleKeyPress(e, expense, "description")
                                }
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                ref={(el) =>
                                  (inputRefs.current[
                                    `${expense.id}-description`
                                  ] = el)
                                }
                              />
                            ) : (
                              <div
                                onClick={() =>
                                  handleCellClick(
                                    expense.id,
                                    "description",
                                    expense.description || ""
                                  )
                                }
                                className="cursor-pointer min-h-[32px] flex items-center"
                              >
                                {expense.description || "-"}
                              </div>
                            )}
                          </td>
                          <td className="border border-gray-200 px-4 py-2 text-sm text-center">
                            {expense.notesUser ? (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {expense.notesUser.name}
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="border border-gray-200 px-4 py-2 text-sm text-green-600 font-medium text-right">
                            {expense.expense.type === "credit" ? (
                              editingCell === `${expense.id}-amount` ? (
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={() =>
                                    handleCellSave(expense, "amount")
                                  }
                                  onKeyDown={(e) =>
                                    handleKeyPress(e, expense, "amount")
                                  }
                                  className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-right"
                                  ref={(el) =>
                                    (inputRefs.current[`${expense.id}-amount`] =
                                      el)
                                  }
                                />
                              ) : (
                                <div
                                  onClick={() =>
                                    handleCellClick(
                                      expense.id,
                                      "amount",
                                      expense.amount
                                    )
                                  }
                                  className="cursor-pointer"
                                >
                                  {expense.amount.toLocaleString()}
                                </div>
                              )
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="border border-gray-200 px-4 py-2 text-sm text-red-600 font-medium text-right">
                            {expense.expense.type === "debit" ? (
                              editingCell === `${expense.id}-amount` ? (
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={() =>
                                    handleCellSave(expense, "amount")
                                  }
                                  onKeyDown={(e) =>
                                    handleKeyPress(e, expense, "amount")
                                  }
                                  className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-right"
                                  ref={(el) =>
                                    (inputRefs.current[`${expense.id}-amount`] =
                                      el)
                                  }
                                />
                              ) : (
                                <div
                                  onClick={() =>
                                    handleCellClick(
                                      expense.id,
                                      "amount",
                                      expense.amount
                                    )
                                  }
                                  className="cursor-pointer"
                                >
                                  {expense.amount.toLocaleString()}
                                </div>
                              )
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="border border-gray-200 px-4 py-2 text-sm text-center">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                expense.expense.type === "credit"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {expense.expense.type}
                            </span>
                          </td>
                          <td className="border border-gray-200 px-4 py-2 text-center space-x-2">
                            <button
                              onClick={() => handleCellDelete(expense)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                          <td className="border border-gray-200 px-4 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={expense.isVerified}
                              onChange={() => handleVerifyExpense(expense)}
                              className="rounded"
                            />
                          </td>
                        </tr>
                      ))}
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
                                type: selectedExpenseType || "debit",
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
                            <option value="custom">Credit/Debit</option>
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
                          newExpense.expenseId === "custom" ? (
                            <select
                              value={newExpense.userId}
                              onChange={(e) =>
                                setNewExpense({
                                  ...newExpense,
                                  dayId: dayData.day.id,
                                  userId: e.target.value,
                                })
                              }
                              className="w-full h-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm bg-white"
                              ref={(el) =>
                                (inputRefs.current[`${dayData.day.id}-userId`] =
                                  el)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleAddExpense(dayData); // Changed from handleAddAdjust
                                }
                              }}
                            >
                              <option value="">Select User</option>
                              {notesUser.map((user) => (
                                <option key={user.id} value={user.id}>
                                  {user.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="border-gray-200 px-4 py-2 text-sm">
                              -
                            </div>
                          )}
                        </td>
                        <td className="border border-gray-200 px-0 py-0">
                          {newExpense.dayId === dayData.day.id &&
                          (newExpense.type === "credit" ||
                            getSelectedExpenseType(
                              newExpense.expenseId,
                              dayData.day.id
                            ) === "credit") ? (
                            <input
                              type="text"
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
                                  handleAddExpense(dayData);
                                }
                              }}
                            />
                          ) : (
                            <td className="border-gray-200 px-4 py-2 text-sm">
                              -
                            </td>
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
                              type="text"
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
                                  handleAddExpense(dayData); // Changed from conditional
                                }
                              }}
                            />
                          ) : (
                            <td className="border-gray-200 px-4 py-2 text-sm">
                              -
                            </td>
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
                                    `${dayData.day.id}-userId` // Focus on user dropdown after type selection
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
                            <div className="border-gray-200 px-4 py-2 text-sm">
                              -
                            </div>
                          )}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-sm">
                          -
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-sm">
                          -
                        </td>
                      </tr>
                      {/* Total Row */}
                      <tr className="bg-gray-100 font-semibold">
                        <td className="border border-gray-200 px-4 py-2 text-sm">
                          -
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-sm">
                          TOTAL
                        </td>

                        <td className="border border-gray-200 px-4 py-2 text-sm">
                          -
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
                        <td className="border border-gray-200 px-4 py-2 text-sm">
                          -
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-sm">
                          -
                        </td>
                      </tr>
                      {/* Cash Difference Row */}
                      <tr className="bg-gray-100 font-semibold">
                        <td className="border border-gray-200 px-4 py-2 text-sm">
                          -
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-sm">
                          CASH DIFFERENCE
                        </td>

                        <td className="border border-gray-200 px-4 py-2 text-sm">
                          -
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-sm">
                          -
                        </td>

                        <td className="border border-gray-200 px-4 py-2 text-sm">
                          -
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-sm text-red-600">
                          {total < 0 ? Math.abs(total).toLocaleString() : "-"}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-sm">
                          -
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-sm">
                          -
                        </td>
                        <td className="border border-gray-200 px-4 py-2 text-sm">
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
        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6 mx-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Overall Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-sm text-green-600 font-medium">
                Total Credit
              </div>
              <div className="text-xl font-bold text-green-700">
                ₹{monthlyTotals.totalCredit.toLocaleString()}
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="text-sm text-red-600 font-medium">
                Total Debit
              </div>
              <div className="text-xl font-bold text-red-700">
                ₹{monthlyTotals.totalDebit.toLocaleString()}
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-600 font-medium">
                Net Amount
              </div>
              <div className="text-xl font-bold text-blue-700">
                ₹{monthlyTotals.netAmount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MonthlyExpenseSheet;
