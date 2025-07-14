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
import ModernNavbar from "../../components/nav";

function MonthlyExpenseSheet() {
  const [searchParams, setSearchParams] = useState(
    new URLSearchParams(window.location.search)
  );
  const currentMonth = new Date().toISOString().slice(0, 7);
  const role = localStorage.getItem("role");
  const isAdmin = role === "admin";

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

  const shopId = searchParams.get("shopId") || 1;

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
    console.log("klkl", currentExpenseId, currentField, direction);

    // Handle new expense navigation (keep existing logic)
    if (currentExpenseId && currentExpenseId.toString().startsWith("new-")) {
      const dayId = currentExpenseId.replace("new-", "");
      switch (direction) {
        case "next":
        case "right":
          if (currentField === "expenseId") {
            return {
              expenseId: currentExpenseId,
              field: "description",
              dayId: dayId,
              isNewExpense: true,
            };
          }
          if (currentField === "description") {
            if (newExpense.expenseId === "custom") {
              return {
                expenseId: currentExpenseId,
                field: "userId",
                dayId: dayId,
                isNewExpense: true,
              };
            } else {
              return {
                expenseId: currentExpenseId,
                field: "amount",
                dayId: dayId,
                isNewExpense: true,
              };
            }
          }
          if (currentField === "type") {
            return {
              expenseId: currentExpenseId,
              field: "userId",
              dayId: dayId,
              isNewExpense: true,
            };
          }
          if (currentField === "userId") {
            console.log("newExpense", currentField);
            return {
              expenseId: currentExpenseId,
              field: "amount",
              dayId: dayId,
              isNewExpense: true,
            };
          }
          if (currentField === "amount" && newExpense.expenseId === "custom") {
            return {
              expenseId: currentExpenseId,
              field: "type",
              dayId: dayId,
              isNewExpense: true,
            };
          }
          break;

        case "left":
          if (currentField === "amount") {
            if (newExpense.expenseId === "custom") {
              return {
                expenseId: currentExpenseId,
                field: "userId",
                dayId: dayId,
                isNewExpense: true,
              };
            } else {
              return {
                expenseId: currentExpenseId,
                field: "description",
                dayId: dayId,
                isNewExpense: true,
              };
            }
          }
          if (currentField === "userId") {
            return {
              expenseId: currentExpenseId,
              field: "description",
              dayId: dayId,
              isNewExpense: true,
            };
          }
          if (currentField === "type") {
            return {
              expenseId: currentExpenseId,
              field: "amount",
              dayId: dayId,
              isNewExpense: true,
            };
          }
          if (currentField === "description") {
            return {
              expenseId: currentExpenseId,
              field: "expenseId",
              dayId: dayId,
              isNewExpense: true,
            };
          }
          break;

        case "down":
          const currentDayIndex = monthlyData.findIndex(
            (day) => day.day.id === dayId
          );
          for (
            let dayIndex = currentDayIndex + 1;
            dayIndex < monthlyData.length;
            dayIndex++
          ) {
            const nextDay = monthlyData[dayIndex];
            return {
              expenseId: `new-${nextDay.day.id}`,
              field: currentField,
              dayId: nextDay.day.id,
              isNewExpense: true,
            };
          }
          break;

        case "up":
          const currentDayData = monthlyData.find(
            (day) => day.day.id === dayId
          );
          if (currentDayData && currentDayData.expenses.length > 0) {
            const lastExpense =
              currentDayData.expenses[currentDayData.expenses.length - 1];
            return {
              expenseId: lastExpense.id,
              field: currentField === "expenseId" ? "amount" : currentField,
              dayId: lastExpense.dayId,
            };
          }
          const currentDayIdx = monthlyData.findIndex(
            (day) => day.day.id === dayId
          );
          for (let dayIndex = currentDayIdx - 1; dayIndex >= 0; dayIndex--) {
            const prevDay = monthlyData[dayIndex];
            return {
              expenseId: `new-${prevDay.day.id}`,
              field: currentField,
              dayId: prevDay.day.id,
              isNewExpense: true,
            };
          }
          break;
      }
      return null;
    }

    // Find current expense position
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

    // Helper function to check if expense is credit or debit
    const isCreditOrDebit = (expense) => {
      return expense.expenseId === 1 || expense.expenseId === 2;
    };

    switch (direction) {
      case "next":
        // Skip name field for non-credit/debit expenses
        if (currentField === "description") {
          if (isCreditOrDebit(currentExpense)) {
            return {
              expenseId: currentExpenseId,
              field: "name",
              dayId: currentExpense.dayId,
            };
          } else {
            // Skip name field and go directly to amount for non-credit/debit expenses
            return {
              expenseId: currentExpenseId,
              field: "amount",
              dayId: currentExpense.dayId,
            };
          }
        }
        if (currentField === "name") {
          return {
            expenseId: currentExpenseId,
            field: "amount",
            dayId: currentExpense.dayId,
          };
        }
        // FIXED: Enter on amount should go down to next expense's amount field
        if (currentField === "amount") {
          // Move down to next expense's amount field
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
          // If no more expenses in current day, go to next day's first expense amount
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
          // If no next expense, go to new expense row
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
        if (currentField === "name") {
          for (
            let expenseIndex = currentExpenseIndex + 1;
            expenseIndex < monthlyData[currentDayIndex].expenses.length;
            expenseIndex++
          ) {
            const expense = monthlyData[currentDayIndex].expenses[expenseIndex];
            // Skip to name only if next expense is credit/debit
            if (isCreditOrDebit(expense)) {
              return {
                expenseId: expense.id,
                field: "name",
                dayId: expense.dayId,
              };
            } else {
              // Skip name and go to amount for non-credit/debit
              return {
                expenseId: expense.id,
                field: "amount",
                dayId: expense.dayId,
              };
            }
          }
          for (
            let dayIndex = currentDayIndex + 1;
            dayIndex < monthlyData.length;
            dayIndex++
          ) {
            if (monthlyData[dayIndex].expenses.length > 0) {
              const firstExpense = monthlyData[dayIndex].expenses[0];
              // Skip to name only if first expense is credit/debit
              if (isCreditOrDebit(firstExpense)) {
                return {
                  expenseId: firstExpense.id,
                  field: "name",
                  dayId: firstExpense.dayId,
                };
              } else {
                return {
                  expenseId: firstExpense.id,
                  field: "amount",
                  dayId: firstExpense.dayId,
                };
              }
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
        if (currentField === "name") {
          if (currentExpenseIndex > 0) {
            const prevExpense =
              monthlyData[currentDayIndex].expenses[currentExpenseIndex - 1];
            // Skip to name only if previous expense is credit/debit
            if (isCreditOrDebit(prevExpense)) {
              return {
                expenseId: prevExpense.id,
                field: "name",
                dayId: prevExpense.dayId,
              };
            } else {
              return {
                expenseId: prevExpense.id,
                field: "amount",
                dayId: prevExpense.dayId,
              };
            }
          }
          for (let dayIndex = currentDayIndex - 1; dayIndex >= 0; dayIndex--) {
            if (monthlyData[dayIndex].expenses.length > 0) {
              const lastExpense =
                monthlyData[dayIndex].expenses[
                  monthlyData[dayIndex].expenses.length - 1
                ];
              if (isCreditOrDebit(lastExpense)) {
                return {
                  expenseId: lastExpense.id,
                  field: "name",
                  dayId: lastExpense.dayId,
                };
              } else {
                return {
                  expenseId: lastExpense.id,
                  field: "amount",
                  dayId: lastExpense.dayId,
                };
              }
            }
          }
        }
        break;

      case "right":
        // Complete right arrow navigation
        if (currentField === "description") {
          if (isCreditOrDebit(currentExpense)) {
            return {
              expenseId: currentExpenseId,
              field: "name",
              dayId: currentExpense.dayId,
            };
          } else {
            // Skip name field and go directly to amount
            return {
              expenseId: currentExpenseId,
              field: "amount",
              dayId: currentExpense.dayId,
            };
          }
        }
        if (currentField === "name") {
          return {
            expenseId: currentExpenseId,
            field: "amount",
            dayId: currentExpense.dayId,
          };
        }
        // Right arrow from amount field moves to next expense's description
        if (currentField === "amount") {
          // Move to next expense's description
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
          // If no more expenses in current day, go to new expense row
          const currentDay = monthlyData[currentDayIndex];
          return {
            expenseId: `new-${currentDay.day.id}`,
            field: "expenseId",
            dayId: currentDay.day.id,
            isNewExpense: true,
          };
        }
        break;

      case "left":
        // Complete left arrow navigation
        if (currentField === "amount") {
          if (isCreditOrDebit(currentExpense)) {
            return {
              expenseId: currentExpenseId,
              field: "name",
              dayId: currentExpense.dayId,
            };
          } else {
            // Skip name field and go directly to description
            return {
              expenseId: currentExpenseId,
              field: "description",
              dayId: currentExpense.dayId,
            };
          }
        }
        if (currentField === "name") {
          return {
            expenseId: currentExpenseId,
            field: "description",
            dayId: currentExpense.dayId,
          };
        }
        // Left arrow from description field moves to previous expense's amount
        if (currentField === "description") {
          // Move to previous expense's amount
          if (currentExpenseIndex > 0) {
            const prevExpense =
              monthlyData[currentDayIndex].expenses[currentExpenseIndex - 1];
            return {
              expenseId: prevExpense.id,
              field: "amount",
              dayId: prevExpense.dayId,
            };
          }
          // If first expense in day, go to previous day's last expense
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
    console.log("exp1", expense);
    const currentValue =
      field === "description"
        ? expense?.description || ""
        : field === "name"
        ? expense?.expense?.user?.id || expense?.userId || ""
        : expense.amount;

    const newValue =
      field === "description"
        ? editValue.trim()
        : field === "name"
        ? editValue
        : parseFloat(editValue || 0);

    const hasChanged =
      field === "description"
        ? editValue.trim() !== (currentValue || "").trim()
        : field === "name"
        ? editValue !== (currentValue || "").toString()
        : parseFloat(editValue || 0) !== parseFloat(currentValue || 0);

    // Handle username field separately
    if (field === "name") {
      if (!hasChanged || !editValue) {
        setEditingCell(null);
        setEditValue("");
        // Still navigate even if no change
        if (fromKeyPress) {
          navigateToNextCell(expense, field, direction);
        }
        return;
      }

      const selectedUser = notesUser.find((u) => u.id == editValue);
      if (!selectedUser) {
        setEditingCell(null);
        setEditValue("");
        return;
      }

      const payload = {
        ...expense,
        expense: {
          ...expense.expense,
          name: selectedUser.name,
          user: {
            id: selectedUser.id,
            name: selectedUser.name,
          },
        },
        userId: selectedUser.id,
        shopId: shopId,
      };

      try {
        await updateDayExpense(expense.id, payload);
        const updatedData = monthlyData.map((day) => {
          if (day.day.id === expense.dayId) {
            return {
              ...day,
              expenses: day.expenses.map((e) =>
                e.id === expense.id
                  ? {
                      ...e,
                      expense: {
                        ...e.expense,
                        user: {
                          id: selectedUser.id,
                          name: selectedUser.name,
                        },
                      },
                      userId: selectedUser.id,
                    }
                  : e
              ),
            };
          }
          return day;
        });
        setMonthlyData(updatedData);
      } catch (error) {
        console.error("Error saving user:", error);
        fetchMonthlyData();
        return;
      }
    }

    const dayId = expense.dayId;
    scrollPositions.current[dayId] = dayRefs.current[dayId]?.scrollTop || 0;

    // Handle other fields (description, amount)
    if (
      hasChanged &&
      field !== "name" &&
      (field === "amount" ? newValue > 0 : newValue !== "")
    ) {
      const payload = {
        shopId: shopId,
        expenseId: expense.expenseId,
        dayId: expense.dayId,
        templateId: expense.templateId,
        amount: field === "amount" ? newValue : expense.amount,
        description: field === "description" ? newValue : expense.description,
        userId: expense.userId || expense.expense?.user?.id || null,
      };

      try {
        await updateDayExpense(expense.id, payload);
        const updatedData = monthlyData.map((day) => {
          if (day.day.id === expense.dayId) {
            return {
              ...day,
              expenses: day.expenses.map((e) =>
                e.id === expense.id
                  ? {
                      ...e,
                      ...payload,
                      expense: {
                        ...e.expense,
                        user: e.expense.user,
                      },
                    }
                  : e
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

    // Handle keyboard navigation after API call
    if (fromKeyPress) {
      navigateToNextCell(expense, field, direction);
    }

    setTimeout(() => {
      if (dayRefs.current[dayId]) {
        dayRefs.current[dayId].scrollTop = scrollPositions.current[dayId];
      }
    }, 0);
  };

  // Helper function for navigation
  const navigateToNextCell = (expense, field, direction) => {
    console.log("jk23", expense.id, field, direction);
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
          const nextExpense = monthlyData
            .flatMap((day) => day.expenses)
            .find((exp) => exp.id === nextCell.expenseId);
          if (nextExpense) {
            const nextCellValue =
              nextCell.field === "amount"
                ? nextExpense.amount
                : nextCell.field === "name"
                ? nextExpense?.expense?.user?.id || nextExpense?.userId || ""
                : nextExpense.description || "";
            handleCellClick(nextCell.expenseId, nextCell.field, nextCellValue);
          }
        }
      }, 100);
    }
  };

  const handleKeyPress = (e, expense, field) => {
    console.log("key1", e);
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
        return;
    }

    if (direction) {
      handleCellSave(expense, field, true, direction);
    }
  };

  // Replace the handleCellClick function
  const handleCellClick = (rowId, field, currentValue) => {
    // Only allow editing username for credit/debit expenses or if admin

    const expense = monthlyData
      .flatMap((day) => day.expenses)
      .find((exp) => exp.id === rowId);

    if (expense?.isVerified && !isAdmin) return;

    if (field === "name") {
      const expense = monthlyData
        .flatMap((day) => day.expenses)
        .find((exp) => exp.id === rowId);

      if (
        expense &&
        (expense.expenseId === 1 || expense.expenseId === 2 || isAdmin)
      ) {
        setEditingCell(`${rowId}-${field}`);
        setEditValue(currentValue === 0 ? "" : currentValue.toString());
        setTimeout(() => {
          const input = inputRefs.current[`${rowId}-${field}`];
          if (input) {
            input.focus();
          }
        }, 50);
      }
      return;
    }

    // Handle other fields normally
    setEditingCell(`${rowId}-${field}`);
    setEditValue(currentValue === 0 ? "" : currentValue.toString());
    setTimeout(() => {
      const input = inputRefs.current[`${rowId}-${field}`];
      if (input) {
        input.focus();
      }
    }, 50);
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
    if (!newExpense.expenseId || !newExpense.dayId) return;

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
      const selectedUser = notesUser.find(
        (u) => u.id === parseInt(newExpense.userId)
      );

      const updatedData = monthlyData.map((day) => {
        if (day.day.id === newExpense.dayId) {
          return {
            ...day,
            expenses: [
              ...day.expenses,
              {
                ...payload,
                id: response.data.id,
                isVerified: false,
                expense: {
                  ...expenseType,
                  // Fix: Properly set user data in expense object
                  user: selectedUser
                    ? {
                        id: selectedUser.id,
                        name: selectedUser.name,
                      }
                    : null,
                },
                user: selectedUser || null,
                userId: selectedUser?.id || null, // Add userId at root level
              },
            ],
          };
        }
        return day;
      });

      setMonthlyData(updatedData);
      setTimeout(() => {
        const nextDayIndex = monthlyData.findIndex(
          (day) => day.day.id === newExpense.dayId
        );
        if (nextDayIndex !== -1) {
          const expenseSelect =
            inputRefs.current[`${newExpense.dayId}-expenseId`];
          if (expenseSelect) {
            expenseSelect.focus();
          }
        }
      }, 100);
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

  console.log(monthlyTotals, "hu");

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

  const handleNewExpenseNavigation = (dayId, field, direction) => {
    console.log("newExpense88", dayId, field, direction);
    const nextCell = findNextEditableCell(`new-${dayId}`, field, direction);

    if (nextCell) {
      setTimeout(() => {
        if (nextCell.isNewExpense) {
          const inputRef =
            inputRefs.current[`${nextCell.dayId}-${nextCell.field}`];
          if (inputRef) {
            inputRef.focus();
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
                : nextCell.field === "name"
                ? nextExpense?.expense?.user?.id || nextExpense?.userId || ""
                : nextExpense.description ||
                  nextExpense.expense.description ||
                  "";

            handleCellClick(nextCell.expenseId, nextCell.field, nextCellValue);
          }
        }
      }, 100);
    }
  };
  // Add this helper function near the top of your component
  const isEditingDisabled = (dayData) => {
    return !isAdmin && (dayData.day.isFrozen || dayData.day.isVerified);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <ModernNavbar monthlyExpense={monthlyTotals.netAmount || 0} />
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden mt-20">
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

        <div className="p-6 space-y-6">
          {monthlyData.map((dayData) => {
            const { creditTotal, debitTotal, total } = calculateDayTotals(
              dayData.expenses
            );
            const isToday =
              dayData.day.date.split("T")[0] ===
              new Date().toISOString().split("T")[0];
            return (
              // Update the main day container
              <div
                key={dayData.day.id}
                ref={(el) => (dayRefs.current[dayData.day.id] = el)}
                className={`bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-200
    ${isToday ? "ring-2 ring-blue-500" : ""}
    ${
      isEditingDisabled(dayData)
        ? "opacity-90 grayscale-[30%] cursor-not-allowed pointer-events-none select-none"
        : ""
    }
  `}
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
                      {/* isadmin */}
                      {isAdmin && (
                        <>
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
                        </>
                      )}
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
                        {isAdmin && (
                          <>
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
                          </>
                        )}
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
                            {/* Username/Notes User Column */}
                            {editingCell === `${expense.id}-name` &&
                            (expense.expenseId === 1 ||
                              expense.expenseId === 2 ||
                              isAdmin) ? (
                              <select
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={() => handleCellSave(expense, "name")}
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "ArrowUp" ||
                                    e.key === "ArrowDown"
                                  ) {
                                    // Don't prevent default - let browser handle dropdown navigation
                                    e.target.focus();
                                  } else {
                                    handleKeyPress(e, expense, "name");
                                  }
                                }}
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                ref={(el) =>
                                  (inputRefs.current[`${expense.id}-name`] = el)
                                }
                              >
                                <option value="">Select User</option>
                                {notesUser.map((user) => (
                                  <option key={user.id} value={user.id}>
                                    {user.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <div
                                onClick={() =>
                                  (expense.expenseId === 1 ||
                                    expense.expenseId === 2 ||
                                    isAdmin) &&
                                  handleCellClick(
                                    expense.id,
                                    "name",
                                    expense.expense?.user?.id ||
                                      expense.userId ||
                                      ""
                                  )
                                }
                                className={`cursor-pointer min-h-[32px] flex items-center justify-center ${
                                  expense.expenseId === 1 ||
                                  expense.expenseId === 2 ||
                                  isAdmin
                                    ? "hover:bg-gray-50"
                                    : "cursor-not-allowed opacity-50"
                                }`}
                              >
                                {expense.expense?.user?.name ||
                                expense.notesUser?.name ? (
                                  <span className="text-blue-600 font-medium">
                                    {expense.expense?.user?.name ||
                                      expense.notesUser?.name}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </div>
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
                          {isAdmin && (
                            <>
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
                            </>
                          )}
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
                              if (
                                e.key === "ArrowUp" ||
                                e.key === "ArrowDown"
                              ) {
                                // Let browser handle dropdown navigation
                                return;
                              }
                              switch (e.key) {
                                case "Enter":
                                case "ArrowRight":
                                  e.preventDefault();
                                  handleNewExpenseNavigation(
                                    dayData.day.id,
                                    "expenseId",
                                    "next"
                                  );
                                  break;
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
                              switch (e.key) {
                                case "Enter":
                                case "ArrowRight":
                                  e.preventDefault();
                                  handleNewExpenseNavigation(
                                    dayData.day.id,
                                    "description",
                                    "next"
                                  );
                                  break;
                                case "ArrowLeft":
                                  e.preventDefault();
                                  handleNewExpenseNavigation(
                                    dayData.day.id,
                                    "description",
                                    "left"
                                  );
                                  break;
                                case "ArrowDown":
                                  e.preventDefault();
                                  handleNewExpenseNavigation(
                                    dayData.day.id,
                                    "description",
                                    "down"
                                  );
                                  break;
                                case "ArrowUp":
                                  e.preventDefault();
                                  handleNewExpenseNavigation(
                                    dayData.day.id,
                                    "description",
                                    "up"
                                  );
                                  break;
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
                                if (
                                  e.key === "ArrowUp" ||
                                  e.key === "ArrowDown"
                                ) {
                                  // Let browser handle dropdown navigation
                                  return;
                                }
                                switch (e.key) {
                                  case "Enter":
                                  case "ArrowRight":
                                    e.preventDefault();
                                    handleAddExpense(dayData);
                                    handleNewExpenseNavigation(
                                      dayData.day.id,
                                      "userId",
                                      "next"
                                    );
                                    break;
                                  case "ArrowLeft":
                                    e.preventDefault();
                                    handleNewExpenseNavigation(
                                      dayData.day.id,
                                      "userId",
                                      "left"
                                    );
                                    break;
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
                            <td className="border-gray-200 px-4 py-2 text-sm">
                              -
                            </td>
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
                              className="w-full h-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm text-red-600 font-medium"
                              placeholder="Amount"
                              ref={(el) =>
                                (inputRefs.current[`${dayData.day.id}-amount`] =
                                  el)
                              }
                              onKeyDown={(e) => {
                                switch (e.key) {
                                  case "Enter":
                                  case "ArrowRight":
                                    e.preventDefault();
                                    handleAddExpense(dayData);
                                    handleNewExpenseNavigation(
                                      dayData.day.id,
                                      "amount",
                                      "next"
                                    );
                                    break;
                                  case "ArrowLeft":
                                    e.preventDefault();
                                    handleNewExpenseNavigation(
                                      dayData.day.id,
                                      "amount",
                                      "left"
                                    );
                                    break;
                                  case "ArrowDown":
                                    e.preventDefault();
                                    handleNewExpenseNavigation(
                                      dayData.day.id,
                                      "amount",
                                      "down"
                                    );
                                    break;
                                  case "ArrowUp":
                                    e.preventDefault();
                                    handleNewExpenseNavigation(
                                      dayData.day.id,
                                      "amount",
                                      "up"
                                    );
                                    break;
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
                              placeholder="Amount"
                              ref={(el) =>
                                (inputRefs.current[`${dayData.day.id}-amount`] =
                                  el)
                              }
                              onKeyDown={(e) => {
                                switch (e.key) {
                                  case "Enter":
                                  case "ArrowRight":
                                    e.preventDefault();
                                    handleAddExpense(dayData);
                                    handleNewExpenseNavigation(
                                      dayData.day.id,
                                      "amount",
                                      "next"
                                    );
                                    break;
                                  case "ArrowLeft":
                                    e.preventDefault();
                                    handleNewExpenseNavigation(
                                      dayData.day.id,
                                      "amount",
                                      "left"
                                    );
                                    break;
                                  case "ArrowDown":
                                    e.preventDefault();
                                    handleNewExpenseNavigation(
                                      dayData.day.id,
                                      "amount",
                                      "down"
                                    );
                                    break;
                                  case "ArrowUp":
                                    e.preventDefault();
                                    handleNewExpenseNavigation(
                                      dayData.day.id,
                                      "amount",
                                      "up"
                                    );
                                    break;
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
                                if (
                                  e.key === "ArrowUp" ||
                                  e.key === "ArrowDown"
                                ) {
                                  // Let browser handle dropdown navigation
                                  return;
                                }
                                switch (e.key) {
                                  case "Enter":
                                  case "ArrowRight":
                                    e.preventDefault();
                                    break;
                                  case "ArrowLeft":
                                    e.preventDefault();
                                    handleNewExpenseNavigation(
                                      dayData.day.id,
                                      "type",
                                      "left"
                                    );
                                    break;
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
                        {isAdmin && (
                          <>
                            <td className="border border-gray-200 px-4 py-2 text-sm">
                              -
                            </td>
                            <td className="border border-gray-200 px-4 py-2 text-sm">
                              -
                            </td>
                          </>
                        )}
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
                        {isAdmin && (
                          <>
                            <td className="border border-gray-200 px-4 py-2 text-sm">
                              -
                            </td>
                            <td className="border border-gray-200 px-4 py-2 text-sm">
                              -
                            </td>
                          </>
                        )}
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
                        {isAdmin && (
                          <>
                            <td className="border border-gray-200 px-4 py-2 text-sm">
                              -
                            </td>
                            <td className="border border-gray-200 px-4 py-2 text-sm">
                              -
                            </td>
                          </>
                        )}
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
