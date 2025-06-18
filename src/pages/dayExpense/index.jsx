import React, { useState, useEffect } from "react";
import {
  Plus,
  Calendar,
  DollarSign,
  Save,
  X,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Settings,
  Edit,
} from "lucide-react";
import {
  createDayExpense,
  getDayExpenseByDate,
  getExpenseByShopId,
  updateDayExpense,
} from "../../api/api";
import { useParams, useSearchParams } from "react-router-dom";
function DayExpenseSheet() {
  const [dayData, setDayData] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [defaultExpenses, setDefaultExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddCredit, setShowAddCredit] = useState(false);
  const [showAddAdjust, setShowAddAdjust] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const { selectedDate } = useParams();
  const [searchParams] = useSearchParams();
  const shopId = searchParams.get("shopId");
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
  });

  useEffect(() => {
    fetchDayData();
    fetchDefaultExpenses();
  }, [selectedDate, shopId]);

  const fetchDayData = async () => {
    setLoading(true);
    try {
      const mockData = await getDayExpenseByDate(selectedDate, shopId);
      setDayData(mockData.data.day);
      setExpenses(mockData.data.expenses);
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

  const handleAddExpense = async () => {
    if (!newExpense.expenseId || !newExpense.amount) return;

    const payload = {
      dayId: dayData?.id,
      expenseId: parseInt(newExpense.expenseId),
      templateId: 5, // You might want to make this dynamic
      amount: parseFloat(newExpense.amount),
      description: newExpense.description,
    };

    console.log("Adding expense:", payload);
    // Make API call here

    setShowAddExpense(false);
    setNewExpense({ expenseId: "", amount: "", description: "" });
    // Refresh data
    fetchDayData();
  };

  const handleAddCredit = async () => {
    if (!newCredit.amount) return;

    const expenseId = newCredit.type === "credit" ? 1 : 2;
    const payload = {
      dayId: dayData?.id,
      expenseId: expenseId,
      templateId: 5,
      amount: parseFloat(newCredit.amount),
      description: newCredit.description,
    };

    console.log("Adding credit/debit:", payload);
    // Make API call here

    setShowAddCredit(false);
    setNewCredit({ type: "credit", amount: "", description: "" });
    fetchDayData();
  };

  const handleAddAdjust = async () => {
    if (!newAdjust.amount) return;

    const payload = {
      shopId: shopId,
      amount: parseFloat(newAdjust.amount),
      description: newAdjust.description,
    };

    console.log("Adding adjustment:", payload);
    // Make API call here

    setShowAddAdjust(false);
    setNewAdjust({ amount: "", description: "" });
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense.id);
    setEditAmount(expense.amount.toString());
    setEditDescription(expense.expense.description);
  };

  const handleSaveExpense = async (expense) => {
    const payload = {
      shopId: shopId,
      expenseId: expense.expenseId,
      dayId: expense.dayId,
      templateId: expense.templateId,
      amount: parseFloat(editAmount),
      description: editDescription,
    };

    console.log("Saving expense:", payload);

    try {
      await updateDayExpense(selectedDate, payload);
      setEditingExpense(null);
      setEditAmount("");
      setEditDescription("");
      fetchDayData();
    } catch (error) {
      console.error("Error saving expense:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
    setEditAmount("");
    setEditDescription("");
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Day Expense Sheet
                </h1>
                <p className="text-gray-600">
                  {formatDate(dayData?.date || selectedDate)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Shop ID</p>
                <p className="text-lg font-semibold">{shopId}</p>
              </div>
              <div className="flex items-center space-x-2">
                {dayData?.isVerified ? (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    Verified
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                    Not Verified
                  </span>
                )}
                {dayData?.isFrozen && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Frozen
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Expense Table */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Expenses</h2>
              <button
                onClick={() => setShowAddExpense(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Expense</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    S.No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expense Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Debit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map((expense, index) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {expense.expense.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {editingExpense === expense.id ? (
                        <input
                          type="text"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="w-full p-1 border border-gray-300 rounded text-sm"
                        />
                      ) : (
                        expense.expense.description
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {expense.expense.type === "credit" ? (
                        editingExpense === expense.id ? (
                          <input
                            type="number"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="w-20 p-1 border border-gray-300 rounded text-sm text-green-600"
                          />
                        ) : (
                          <span className="text-green-600">
                            ₹{expense.amount}
                          </span>
                        )
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {expense.expense.type === "debit" ? (
                        editingExpense === expense.id ? (
                          <input
                            type="number"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="w-20 p-1 border border-gray-300 rounded text-sm text-red-600"
                          />
                        ) : (
                          <span className="text-red-600">
                            ₹{expense.amount}
                          </span>
                        )
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {expense.isVerified ? (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingExpense === expense.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSaveExpense(expense)}
                            className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                          >
                            <Save className="w-3 h-3" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="bg-gray-400 text-white px-2 py-1 rounded text-xs hover:bg-gray-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditExpense(expense)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {/* Add Credit Button Row */}
                <tr className="border-t-2 border-dashed border-gray-300">
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setShowAddCredit(true)}
                      className="flex items-center space-x-1 text-green-600 hover:text-green-800 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Credit</span>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setShowAddCredit(true)}
                      className="flex items-center space-x-1 text-red-600 hover:text-red-800 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Debit</span>
                    </button>
                  </td>
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setShowAddAdjust(true)}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adjust</span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="bg-gray-100 px-6 py-4 border-t-2">
            <div className="flex justify-between items-center">
              <div className="text-lg font-semibold text-gray-700">Total</div>
              <div className="flex space-x-8">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Credit</p>
                  <p className="text-xl font-bold text-green-600">
                    ₹
                    {expenses
                      .filter((e) => e.expense.type === "credit")
                      .reduce((sum, e) => sum + e.amount, 0)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Debit</p>
                  <p className="text-xl font-bold text-red-600">
                    ₹
                    {expenses
                      .filter((e) => e.expense.type === "debit")
                      .reduce((sum, e) => sum + e.amount, 0)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Net Amount</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{calculateTotal()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Credit/Debit Borrow Section */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Credit/Debit Borrow Notes
              </h2>
              <button
                onClick={() => setShowAddCredit(true)}
                className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                <CreditCard className="w-4 h-4" />
                <span>Add Note</span>
              </button>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-500 text-center py-8">
              No borrow notes added yet
            </p>
          </div>
        </div>

        {/* Adjust and Store Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Adjust and Store
              </h2>
              <button
                onClick={() => setShowAddAdjust(true)}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <Settings className="w-4 h-4" />
                <span>Add Adjustment</span>
              </button>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-500 text-center py-8">
              No adjustments added yet
            </p>
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
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

      {/* Add Credit/Debit Modal */}
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

      {/* Add Adjustment Modal */}
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

export default DayExpenseSheet;
