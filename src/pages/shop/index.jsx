import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Loader2,
} from "lucide-react";
import {
  getAllTemplate,
  createTemplate,
  editTemplate,
  deleteTemplate,
  getExpenseByTemplateId,
  createExpense,
  editExpense,
  deleteExpense,
  getAllShop,
  createShop,
  editShop,
  deleteShop,
  createNoteUser,
  getAllNoteUser,
  updateNoteUser,
  deleteNoteUser,
  getAllEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../../api/api";
import Navbar from "../../components/nav";

const TABS = {
  TEMPLATES: "templates",
  EXPENSES: "expenses",
  SHOPS: "shops",
  EMPLOYEES: "employees",
};

const TemplateList = ({ setSelectedTemplate, setActiveTab }) => {
  const [templates, setTemplates] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [newTemplateName, setNewTemplateName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await getAllTemplate();
      setTemplates(response.data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;
    try {
      await createTemplate({ name: newTemplateName });
      await fetchTemplates();
      setNewTemplateName("");
    } catch (error) {
      console.error("Error creating template:", error);
    }
  };

  const handleEdit = async (id) => {
    if (!editValue.trim()) return;
    try {
      await editTemplate({ name: editValue }, id);
      setTemplates(
        templates.map((t) => (t.id === id ? { ...t, name: editValue } : t))
      );
      setEditingId(null);
    } catch (error) {
      console.error("Error editing template:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this template?")) {
      try {
        await deleteTemplate(id);
        setTemplates(templates.filter((t) => t.id !== id));
      } catch (error) {
        console.error("Error deleting template:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin text-blue-500" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Templates</h1>
      </div>

      <form onSubmit={handleCreate} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTemplateName}
          onChange={(e) => setNewTemplateName(e.target.value)}
          placeholder="New template name"
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={!newTemplateName.trim()}
        >
          Add
        </button>
      </form>

      <div className="border rounded-lg divide-y">
        {templates.map((template) => (
          <div key={template.id} className="p-3 hover:bg-gray-50 group">
            {editingId === template.id ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleEdit(template.id);
                    if (e.key === "Escape") setEditingId(null);
                  }}
                />
                <button
                  onClick={() => handleEdit(template.id)}
                  className="p-1 text-green-600 hover:text-green-800"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="p-1 text-red-600 hover:text-red-800"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div
                className="flex justify-between items-center px-2 py-1 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSelectedTemplate(template.id);
                  setActiveTab(TABS.EXPENSES);
                }}
              >
                <span className="font-medium">{template.name}</span>

                <div className="flex gap-2 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // prevent triggering parent onClick
                      setEditingId(template.id);
                      setEditValue(template.name);
                    }}
                    className="p-1 text-blue-600 hover:text-blue-800"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // prevent triggering parent onClick
                      setSelectedTemplate(template.id);
                      setActiveTab(TABS.EXPENSES);
                    }}
                    className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
                  >
                    Manage Expenses
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // prevent triggering parent onClick
                      handleDelete(template.id);
                    }}
                    className="p-1 text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const ExpenseList = ({ templateId }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [newExpense, setNewExpense] = useState({
    name: "",
    type: "debit",
    isDefault: false,
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    if (templateId) fetchExpenses();
  }, [templateId]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await getExpenseByTemplateId(templateId);
      setExpenses(response.data || []);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedExpenses = [...expenses].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createExpense({ ...newExpense, templateId });
      await fetchExpenses();
      setNewExpense({
        name: "",
        type: "debit",
        isDefault: false,
      });
    } catch (error) {
      console.error("Error creating expense:", error);
    }
  };

  const handleEdit = async (id) => {
    try {
      await editExpense(editValues, id);
      await fetchExpenses();
      setEditingId(null);
    } catch (error) {
      console.error("Error editing expense:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this expense?")) {
      try {
        await deleteExpense(id);
        setExpenses(expenses.filter((e) => e.id !== id));
      } catch (error) {
        console.error("Error deleting expense:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin text-blue-500" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Expense Entries</h1>
      </div>

      <form
        onSubmit={handleCreate}
        className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6"
      >
        <input
          type="text"
          name="name"
          value={newExpense.name}
          onChange={(e) =>
            setNewExpense({ ...newExpense, name: e.target.value })
          }
          placeholder="Name"
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <select
          name="type"
          value={newExpense.type}
          onChange={(e) =>
            setNewExpense({ ...newExpense, type: e.target.value })
          }
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="debit">Debit</option>
          <option value="credit">Credit</option>
        </select>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isDefault"
            checked={newExpense.isDefault}
            onChange={(e) =>
              setNewExpense({ ...newExpense, isDefault: e.target.checked })
            }
            className="h-4 w-4"
          />
          <label htmlFor="isDefault">Default</label>
          <button
            type="submit"
            className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      </form>

      {expenses.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No expenses found. Add your first expense.
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    Name
                    <ArrowUpDown className="ml-1" size={14} />
                  </div>
                </th>

                <th
                  className="px-4 py-3 text-left text-sm font-medium text-gray-500 cursor-pointer"
                  onClick={() => handleSort("type")}
                >
                  <div className="flex items-center">
                    Type
                    <ArrowUpDown className="ml-1" size={14} />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Default
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  {editingId === expense.id ? (
                    <>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          name="name"
                          value={editValues.name}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              name: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleEdit(expense.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                        />
                      </td>

                      <td className="px-4 py-3">
                        <select
                          name="type"
                          value={editValues.type}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              type: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="debit">Debit</option>
                          <option value="credit">Credit</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          name="isDefault"
                          checked={editValues.isDefault}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              isDefault: e.target.checked,
                            })
                          }
                          className="h-4 w-4"
                        />
                      </td>
                      <td className="px-4 py-3 text-right space-x-1">
                        <button
                          onClick={() => handleEdit(expense.id)}
                          className="p-1 text-green-600 hover:text-green-800"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <X size={16} />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-medium">{expense.name}</td>

                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            expense.type === "credit"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {expense.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {expense.isDefault ? (
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            Default
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right space-x-1">
                        <button
                          onClick={() => {
                            setEditingId(expense.id);
                            setEditValues({
                              name: expense.name,
                              type: expense.type,
                              isDefault: expense.isDefault,
                            });
                          }}
                          className="p-1 text-blue-600 hover:text-blue-800"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const ShopList = () => {
  const [shops, setShops] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [newShop, setNewShop] = useState({
    name: "",
    templateId: "",
    allowedEditDays: 7,
    shopType: "retail",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [shopsRes, templatesRes] = await Promise.all([
        getAllShop(),
        getAllTemplate(),
      ]);
      setShops(shopsRes.data || []);
      setTemplates(templatesRes.data || []);
      if (templatesRes.data?.length > 0) {
        setNewShop((prev) => ({
          ...prev,
          templateId: templatesRes.data[0].id,
        }));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createShop(newShop);
      await fetchData();
      setNewShop({
        name: "",
        templateId: templates.length > 0 ? templates[0].id : "",
        allowedEditDays: 7,
        shopType: "retail",
      });
    } catch (error) {
      console.error("Error creating shop:", error);
    }
  };

  const handleEdit = async (id) => {
    try {
      await editShop(editValues, id);
      await fetchData();
      setEditingId(null);
    } catch (error) {
      console.error("Error editing shop:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this shop?")) {
      try {
        await deleteShop(id);
        setShops(shops.filter((s) => s.id !== id));
      } catch (error) {
        console.error("Error deleting shop:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin text-blue-500" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Shops</h1>
      </div>

      <form
        onSubmit={handleCreate}
        className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6"
      >
        <input
          type="text"
          name="name"
          value={newShop.name}
          onChange={(e) => setNewShop({ ...newShop, name: e.target.value })}
          placeholder="Shop name"
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <select
          name="templateId"
          value={newShop.templateId}
          onChange={(e) =>
            setNewShop({ ...newShop, templateId: e.target.value })
          }
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
        <select
          name="shopType"
          value={newShop.shopType}
          onChange={(e) => setNewShop({ ...newShop, shopType: e.target.value })}
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="retail">Retail</option>
          <option value="wholesale">Wholesale</option>
        </select>
        <div className="flex items-center gap-2">
          <input
            type="number"
            name="allowedEditDays"
            value={newShop.allowedEditDays}
            onChange={(e) =>
              setNewShop({
                ...newShop,
                allowedEditDays: parseInt(e.target.value) || 0,
              })
            }
            min="0"
            className="w-20 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <span>days</span>
          <button
            type="submit"
            className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      </form>

      {shops.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No shops found. Add your first shop.
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Template
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Edit Days
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {shops.map((shop) => {
                const template = templates.find(
                  (t) => t.id === shop.templateId
                );
                return (
                  <tr key={shop.id} className="hover:bg-gray-50">
                    {editingId === shop.id ? (
                      <>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            name="name"
                            value={editValues.name}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                name: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleEdit(shop.id);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <select
                            name="templateId"
                            value={editValues.templateId}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                templateId: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {templates.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            name="shopType"
                            value={editValues.shopType}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                shopType: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="retail">Retail</option>
                            <option value="wholesale">Wholesale</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            name="allowedEditDays"
                            value={editValues.allowedEditDays}
                            onChange={(e) =>
                              setEditValues({
                                ...editValues,
                                allowedEditDays: parseInt(e.target.value) || 0,
                              })
                            }
                            min="0"
                            className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-3 text-right space-x-1">
                          <button
                            onClick={() => handleEdit(shop.id)}
                            className="p-1 text-green-600 hover:text-green-800"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 text-red-600 hover:text-red-800"
                          >
                            <X size={16} />
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 font-medium">{shop.name}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {template?.name || `Template ${shop.templateId}`}
                        </td>
                        <td className="px-4 py-3">
                          <span className="capitalize">{shop.shopType}</span>
                        </td>
                        <td className="px-4 py-3">
                          {shop.allowedEditDays} day
                          {shop.allowedEditDays !== 1 ? "s" : ""}
                        </td>
                        <td className="px-4 py-3 text-right space-x-1">
                          <button
                            onClick={() => {
                              setEditingId(shop.id);
                              setEditValues({
                                name: shop.name,
                                templateId: shop.templateId,
                                shopType: shop.shopType,
                                allowedEditDays: shop.allowedEditDays,
                              });
                            }}
                            className="p-1 text-blue-600 hover:text-blue-800"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(shop.id)}
                            className="p-1 text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    password: "employee@2025",
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await getAllEmployees();
      setEmployees(response.data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newEmployee.name.trim() || !newEmployee.email.trim()) return;
    try {
      await createEmployee(newEmployee);
      await fetchEmployees();
      setNewEmployee({
        name: "",
        email: "",
        password: "employee@2025",
      });
    } catch (error) {
      console.error("Error creating employee:", error);
    }
  };

  const handleEdit = async (id) => {
    try {
      await updateEmployee(id, editValues);
      await fetchEmployees();
      setEditingId(null);
    } catch (error) {
      console.error("Error editing employee:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this employee?")) {
      try {
        await deleteEmployee(id);
        setEmployees(employees.filter((e) => e.id !== id));
      } catch (error) {
        console.error("Error deleting employee:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin text-blue-500" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Register Employee</h1>
      </div>

      <form
        onSubmit={handleCreate}
        className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6"
      >
        <input
          type="text"
          name="name"
          value={newEmployee.name}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, name: e.target.value })
          }
          placeholder="Employee Name"
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="email"
          name="email"
          value={newEmployee.email}
          onChange={(e) =>
            setNewEmployee({ ...newEmployee, email: e.target.value })
          }
          placeholder="Email"
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          disabled={!newEmployee.name.trim() || !newEmployee.email.trim()}
        >
          Register Employee
        </button>
      </form>

      {employees.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No employees found. Register your first employee.
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Employee ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Created At
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  {editingId === employee.id ? (
                    <>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          name="name"
                          value={editValues.name}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              name: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleEdit(employee.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="email"
                          name="email"
                          value={editValues.email}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              email: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-sm">
                        {employee.id}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-sm">
                        {employee.createdAt
                          ? new Date(employee.createdAt).toLocaleString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-right space-x-1">
                        <button
                          onClick={() => handleEdit(employee.id)}
                          className="p-1 text-green-600 hover:text-green-800"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <X size={16} />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-medium">{employee.name}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {employee.email}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-sm font-mono">
                        {employee.id}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-sm">
                        {employee.createdAt
                          ? new Date(employee.createdAt).toLocaleString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-right space-x-1">
                        <button
                          onClick={() => {
                            setEditingId(employee.id);
                            setEditValues({
                              name: employee.name,
                              email: employee.email,
                            });
                          }}
                          className="p-1 text-blue-600 hover:text-blue-800"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(employee.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
const NotesUserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [newUser, setNewUser] = useState({
    name: "",
    phone: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllNoteUser();
      setUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching note users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createNoteUser(newUser);
      await fetchUsers();
      setNewUser({
        name: "",
        phone: "",
      });
    } catch (error) {
      console.error("Error creating note user:", error);
    }
  };

  const handleEdit = async (id) => {
    try {
      await updateNoteUser(id, editValues);
      await fetchUsers();
      setEditingId(null);
    } catch (error) {
      console.error("Error editing note user:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this user?")) {
      try {
        await deleteNoteUser(id);
        setUsers(users.filter((u) => u.id !== id));
      } catch (error) {
        console.error("Error deleting note user:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin text-blue-500" size={24} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Notes Users</h1>
      </div>

      <form
        onSubmit={handleCreate}
        className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6"
      >
        <input
          type="text"
          name="name"
          value={newUser.name}
          onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          placeholder="Name"
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="text"
          name="phone"
          value={newUser.phone}
          onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
          placeholder="Phone (optional)"
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add User
        </button>
      </form>

      {users.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No users found. Add your first note user.
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                  Created At
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  {editingId === user.id ? (
                    <>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          name="name"
                          value={editValues.name}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              name: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleEdit(user.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          name="phone"
                          value={editValues.phone}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              phone: e.target.value,
                            })
                          }
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-sm">
                        {new Date(user.createdAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          // hour: 'numeric',
                          // minute: '2-digit',
                          // hour12: true,
                        })}
                      </td>
                      <td className="px-4 py-3 text-right space-x-1">
                        <button
                          onClick={() => handleEdit(user.id)}
                          className="p-1 text-green-600 hover:text-green-800"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <X size={16} />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-medium">{user.name}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {user.phone || "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-sm">
                        {new Date(user.createdAt).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          // hour: "numeric",
                          // minute: "2-digit",
                          // hour12: true,
                        })}
                      </td>
                      <td className="px-4 py-3 text-right space-x-1">
                        <button
                          onClick={() => {
                            setEditingId(user.id);
                            setEditValues({
                              name: user.name,
                              phone: user.phone,
                            });
                          }}
                          className="p-1 text-blue-600 hover:text-blue-800"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const ExpenseManagement = () => {
  const [activeTab, setActiveTab] = useState(TABS.TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  return (
    <>
      <Navbar />
      <div className="px-4 py-6 max-w-6xl mx-auto mt-20">
        <div className="flex border-b mb-6">
          <button
            onClick={() => {
              setActiveTab(TABS.TEMPLATES);
              setSelectedTemplate(null);
            }}
            className={`px-4 py-2 font-medium ${
              activeTab === TABS.TEMPLATES
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Templates
          </button>
          <button
            onClick={() =>
              activeTab !== TABS.EXPENSES &&
              selectedTemplate &&
              setActiveTab(TABS.EXPENSES)
            }
            className={`px-4 py-2 font-medium ${
              activeTab === TABS.EXPENSES
                ? "border-b-2 border-blue-500 text-blue-600"
                : !selectedTemplate
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-500 hover:text-gray-700"
            }`}
            disabled={!selectedTemplate && activeTab !== TABS.EXPENSES}
          >
            Expenses
          </button>
          <button
            onClick={() => setActiveTab(TABS.SHOPS)}
            className={`px-4 py-2 font-medium ${
              activeTab === TABS.SHOPS
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Shops
          </button>
          <button
            onClick={() => setActiveTab(TABS.NOTES_USERS)}
            className={`px-4 py-2 font-medium ${
              activeTab === TABS.NOTES_USERS
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Notes Users
          </button>
          <button
            onClick={() => setActiveTab(TABS.EMPLOYEES)}
            className={`px-4 py-2 font-medium ${
              activeTab === TABS.EMPLOYEES
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Register Employee
          </button>
        </div>

        {activeTab === TABS.TEMPLATES && (
          <TemplateList
            setSelectedTemplate={setSelectedTemplate}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === TABS.EXPENSES && (
          <ExpenseList templateId={selectedTemplate} />
        )}
        {activeTab === TABS.SHOPS && <ShopList />}
        {activeTab === TABS.NOTES_USERS && <NotesUserList />}
        {activeTab === TABS.EMPLOYEES && <EmployeeList />}
      </div>
    </>
  );
};

export default ExpenseManagement;
