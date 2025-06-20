import React, { useState, useEffect } from "react";
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
  Settings,
} from "lucide-react";
import {
  adjustTransaction,
  createDayExpense,
  getDayExpenseByDate,
  getExpenseByShopId,
  updateDayExpense,
  verifyDayExpense,
} from "../../api/api";
import { useParams, useSearchParams } from "react-router-dom";

function ExcelExpenseSheet() {
  const [templateId, setTemplateId] = useState(0);
  const [dayData, setDayData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [defaultExpenses, setDefaultExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  // Modal states
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddCredit, setShowAddCredit] = useState(false);
  const [showAddAdjust, setShowAddAdjust] = useState(false);

  // Editing states
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState("");

  // Form states
  const [newExpense, setNewExpense] = useState({
    expenseId: "",
    amount: "",
    description: "",
  });

  const [newCredit, setNewCredit] = useState({
    type: "credit",
    amount: "",
    description: "",
  });

  const [newAdjust, setNewAdjust] = useState({
    amount: "",
    description: "",
    type: "credit",
  });

  const { selectedDate } = useParams();
  const [searchParams] = useSearchParams();
  const shopId = searchParams.get("shopId");

  useEffect(() => {
    fetchDayData();
    fetchDefaultExpenses();
  }, []);

  const fetchDayData = async () => {
    setLoading(true);
    try {
      const mockData = await getDayExpenseByDate(selectedDate, shopId);
      setTemplateId(mockData.data.templateId);
      setDayData(mockData.data.day);
      setExpenses(mockData.data.expenses);
      setIsVerified(mockData.data.day.isVerified);
    } catch (error) {
      console.error("Error fetching day data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDefaultExpenses = async () => {
    try {
      const mockExpenses = await getExpenseByShopId(shopId);
      setDefaultExpenses(mockExpenses.data);
    } catch (error) {
      console.error("Error fetching default expenses:", error);
    }
  };

  const handleCellClick = (rowId, field, currentValue) => {
    setEditingCell(`${rowId}-${field}`);
    setEditValue(currentValue.toString());
  };

  const handleCellSave = async (expense, field) => {
    const payload = {
      shopId: shopId,
      expenseId: expense.expenseId,
      dayId: expense.dayId,
      templateId: expense.templateId,
      amount: field === "amount" ? parseFloat(editValue) : expense.amount,
      description:
        field === "description"
          ? editValue
          : expense.description || expense.expense.description,
    };

    try {
      await updateDayExpense(expense.id, payload);
      setEditingCell(null);
      setEditValue("");
      fetchDayData();
    } catch (error) {
      console.error("Error saving expense:", error);
    }
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const handleKeyPress = (e, expense, field) => {
    if (e.key === "Enter") {
      handleCellSave(expense, field);
    } else if (e.key === "Escape") {
      handleCellCancel();
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.expenseId || !newExpense.amount) return;

    const payload = {
      dayId: dayData?.id,
      expenseId: parseInt(newExpense.expenseId),
      templateId: templateId,
      amount: parseFloat(newExpense.amount),
      description: newExpense.description,
    };

    try {
      await createDayExpense(payload);
      setShowAddExpense(false);
      setNewExpense({ expenseId: "", amount: "", description: "" });
      fetchDayData();
    } catch (error) {
      console.error("Error saving expense:", error);
    }
  };

  const handleAddCredit = async () => {
    if (!newCredit.amount) return;

    const expenseId = newCredit.type === "credit" ? 1 : 2;
    const payload = {
      dayId: dayData?.id,
      expenseId: expenseId,
      templateId: templateId,
      amount: parseFloat(newCredit.amount),
      description: newCredit.description,
    };

    try {
      await createDayExpense(payload);
      setShowAddCredit(false);
      setNewCredit({ type: "credit", amount: "", description: "" });
      fetchDayData();
    } catch (error) {
      console.error("Error saving expense:", error);
    }
  };

  const handleAddAdjust = async () => {
    if (!newAdjust.amount) return;

    const payload = {
      shopId: shopId,
      amount: parseFloat(newAdjust.amount),
      description: newAdjust.description,
      type: newAdjust.type,
    };

    try {
      await adjustTransaction(payload);
      setShowAddAdjust(false);
      setNewAdjust({ amount: "", description: "", type: "credit" });
      fetchDayData();
    } catch (error) {
      console.error("Error saving expense:", error);
    }
  };

  const handleVerifyDay = async () => {
    try {
      await verifyDayExpense(dayData.id, !isVerified);
      setIsVerified(!isVerified);
      fetchDayData();
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateTotal = () => {
    return expenses.reduce((total, expense) => {
      return expense.expense.type === "credit"
        ? total + expense.amount
        : total - expense.amount;
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-full mx-auto bg-white shadow-lg rounded-lg">
        {/* Excel-style Header Bar */}
        <div className="bg-gray-50 border-b-2 border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-800">
                  Day Expense Sheet
                </h1>
                <p className="text-sm text-gray-600">
                  {formatDate(dayData?.date || selectedDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                Shop ID: <strong>{shopId}</strong>
              </span>
              <div className="flex items-center space-x-2">
                {isVerified ? (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                    Verified
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                    Not Verified
                  </span>
                )}
                <button
                  onClick={handleVerifyDay}
                  className={`flex items-center space-x-1 px-3 py-1 rounded text-white text-sm ${
                    isVerified
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-500 hover:bg-gray-600"
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>{isVerified ? "Verified" : "Verify"}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-white p-3 rounded border">
            <button
              onClick={() => setShowAddExpense(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>

            <button
              onClick={() => {
                setShowAddCredit(true);
                setNewCredit({ ...newCredit, type: "credit" });
              }}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Add Credit</span>
            </button>

            <button
              onClick={() => {
                setShowAddCredit(true);
                setNewCredit({ ...newCredit, type: "debit" });
              }}
              className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
            >
              <TrendingDown className="w-4 h-4" />
              <span>Add Debit</span>
            </button>

            <button
              onClick={() => setShowAddAdjust(true)}
              className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm"
            >
              <Settings className="w-4 h-4" />
              <span>Adjust</span>
            </button>
          </div>
        </div>

        {/* Excel-style Grid */}
        <div className="overflow-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 w-16">
                  S.No
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 min-w-36">
                  Expense Name
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 min-w-36">
                  Description
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 w-44">
                  Credit (₹)
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 w-44">
                  Debit (₹)
                </th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-700 w-24">
                  Verified
                </th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense, index) => (
                <tr key={expense.id} className="hover:bg-blue-50">
                  {/* S.No */}
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center bg-gray-50">
                    {index + 1}
                  </td>

                  {/* Expense Name */}
                  <td className="border border-gray-300 px-3 py-2 text-sm font-medium bg-gray-50">
                    {expense.expense.name}
                  </td>

                  {/* Description - Editable */}
                  <td className="border border-gray-300 px-0 py-0">
                    {editingCell === `${expense.id}-description` ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={() => handleCellSave(expense, "description")}
                        onKeyDown={(e) =>
                          handleKeyPress(e, expense, "description")
                        }
                        className="w-full h-full px-3 py-2 border-0 outline-0 focus:bg-white text-sm"
                        autoFocus
                      />
                    ) : (
                      <div
                        className="px-3 py-2 cursor-pointer hover:bg-blue-50 min-h-[32px] text-sm"
                        onClick={() =>
                          handleCellClick(
                            expense.id,
                            "description",
                            expense?.description || expense.expense.description
                          )
                        }
                      >
                        {expense?.description || expense.expense.description}
                      </div>
                    )}
                  </td>

                  {/* Credit - Editable */}
                  <td className="border border-gray-300 px-0 py-0">
                    {expense.expense.type === "credit" ? (
                      editingCell === `${expense.id}-amount` ? (
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleCellSave(expense, "amount")}
                          onKeyDown={(e) =>
                            handleKeyPress(e, expense, "amount")
                          }
                          className="w-full h-full px-3 py-2 border-0 outline-0 focus:bg-white text-sm text-green-600 font-medium"
                          autoFocus
                        />
                      ) : (
                        <div
                          className="px-3 py-2 cursor-pointer hover:bg-blue-50 min-h-[32px] text-sm text-green-600 font-medium"
                          onClick={() =>
                            handleCellClick(
                              expense.id,
                              "amount",
                              expense.amount
                            )
                          }
                        >
                          {expense.amount.toLocaleString()}
                        </div>
                      )
                    ) : (
                      <div className="px-3 py-2 text-center text-gray-400 text-sm">
                        -
                      </div>
                    )}
                  </td>

                  {/* Debit - Editable */}
                  <td className="border border-gray-300 px-0 py-0">
                    {expense.expense.type === "debit" ? (
                      editingCell === `${expense.id}-amount` ? (
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleCellSave(expense, "amount")}
                          onKeyDown={(e) =>
                            handleKeyPress(e, expense, "amount")
                          }
                          className="w-full h-full px-3 py-2 border-0 outline-0 focus:bg-white text-sm text-red-600 font-medium"
                          autoFocus
                        />
                      ) : (
                        <div
                          className="px-3 py-2 cursor-pointer hover:bg-blue-50 min-h-[32px] text-sm text-red-600 font-medium"
                          onClick={() =>
                            handleCellClick(
                              expense.id,
                              "amount",
                              expense.amount
                            )
                          }
                        >
                          {expense.amount.toLocaleString()}
                        </div>
                      )
                    ) : (
                      <div className="px-3 py-2 text-center text-gray-400 text-sm">
                        -
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="border border-gray-300 px-3 py-2 text-center">
                    {expense.isVerified ? (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                        ✓
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-red-100 text-yellow-800 rounded">
                        x
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {/* Totals Row */}
              <tr className="bg-gray-100 font-bold">
                <td className="border border-gray-300 px-3 py-3 text-center text-sm">
                  -
                </td>
                <td className="border border-gray-300 px-3 py-3 text-sm">
                  TOTAL
                </td>
                <td className="border border-gray-300 px-3 py-3 text-sm">-</td>
                <td className="border border-gray-300 px-3 py-3 text-sm text-green-600">
                  {expenses
                    .filter((e) => e.expense.type === "credit")
                    .reduce((sum, e) => sum + e.amount, 0)
                    .toLocaleString()}
                </td>
                <td className="border border-gray-300 px-3 py-3 text-sm text-red-600">
                  {expenses
                    .filter((e) => e.expense.type === "debit")
                    .reduce((sum, e) => sum + e.amount, 0)
                    .toLocaleString()}
                </td>
                <td className="border border-gray-300 px-3 py-3 text-center text-sm">
                  -
                </td>
              </tr>

              {/* Net Amount Row */}
              <tr className="bg-blue-50 font-bold">
                <td className="border border-gray-300 px-3 py-3 text-center text-sm">
                  -
                </td>
                <td className="border border-gray-300 px-3 py-3 text-sm">
                  NET AMOUNT
                </td>
                <td className="border border-gray-300 px-3 py-3 text-sm">-</td>
                <td
                  className="border border-gray-300 px-3 py-3 text-sm"
                  colSpan="2"
                >
                  <div className="text-center text-blue-700 text-lg">
                    ₹{calculateTotal().toLocaleString()}
                  </div>
                </td>
                <td className="border border-gray-300 px-3 py-3 text-center text-sm">
                  -
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals remain the same as your original code */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Expense</h3>
              <button onClick={() => setShowAddExpense(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expense Type
                </label>
                <select
                  value={newExpense.expenseId}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, expenseId: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select expense type</option>
                  {defaultExpenses.map((expense) => (
                    <option key={expense.id} value={expense.id}>
                      {expense.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, amount: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newExpense.description}
                  onChange={(e) =>
                    setNewExpense({
                      ...newExpense,
                      description: e.target.value,
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows="3"
                  placeholder="Enter description"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddExpense}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Add Expense
              </button>
              <button
                onClick={() => setShowAddExpense(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddCredit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Credit/Debit Note</h3>
              <button onClick={() => setShowAddCredit(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="credit"
                      checked={newCredit.type === "credit"}
                      onChange={(e) =>
                        setNewCredit({ ...newCredit, type: e.target.value })
                      }
                      className="mr-2"
                    />
                    <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    Credit
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="debit"
                      checked={newCredit.type === "debit"}
                      onChange={(e) =>
                        setNewCredit({ ...newCredit, type: e.target.value })
                      }
                      className="mr-2"
                    />
                    <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                    Debit
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  value={newCredit.amount}
                  onChange={(e) =>
                    setNewCredit({ ...newCredit, amount: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newCredit.description}
                  onChange={(e) =>
                    setNewCredit({ ...newCredit, description: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows="3"
                  placeholder="Enter description"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddCredit}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700"
              >
                Add Note
              </button>
              <button
                onClick={() => setShowAddCredit(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddAdjust && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Adjustment</h3>
              <button onClick={() => setShowAddAdjust(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={newAdjust.type || ""}
                  onChange={(e) =>
                    setNewAdjust({ ...newAdjust, type: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="" disabled>
                    Select type
                  </option>
                  <option value="debit">Debit</option>
                  <option value="credit">Credit</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  value={newAdjust.amount}
                  onChange={(e) =>
                    setNewAdjust({ ...newAdjust, amount: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter adjustment amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newAdjust.description}
                  onChange={(e) =>
                    setNewAdjust({ ...newAdjust, description: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                  rows="3"
                  placeholder="Enter adjustment description"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddAdjust}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
              >
                Add Adjustment
              </button>
              <button
                onClick={() => setShowAddAdjust(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExcelExpenseSheet;
