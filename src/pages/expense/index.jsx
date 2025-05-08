import { useState, useEffect } from "react";
import {
  Trash2,
  Edit,
  Plus,
  Check,
  X,
  ArrowUpDown,
  Loader,
} from "lucide-react";
import {
  getAllExpense,
  createExpense,
  editExpense,
  deleteExpense,
} from "../../api/auth";

// Helper function to get template ID from route
const getTemplateId = () => {
  return "1";
};

export default function FinancialEntryTemplate() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);
  const [isNotify,setIsNotify] = useState(false);
  const [newEntry, setNewEntry] = useState({
    name: "",
    description: "",
    type: "debit",
    templateId: getTemplateId(),
    isDefault: false,
  });
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all expense entries on component mount
  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const response = await getAllExpense();
      // Handle the specific API response structure
      if (response && response.code === 200 && response.data) {
        setEntries(response.data);
        setError(null);
      } else {
        throw new Error(response?.status || "Unknown error occurred");
      }
    } catch (err) {
      setError("Failed to fetch entries. Please try again.");
      console.error("Error fetching entries:", err);
    } finally {
      setLoading(false);
    }
  };

  // Sort entries based on current sort field and direction
  const sortedEntries = [...entries].sort((a, b) => {
    if (!sortField) return 0;

    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Extract isDefault value from template array
  const getIsDefault = (entry) => {
    if (entry.template && entry.template.length > 0) {
      return entry.template[0].isDefault;
    }
    return false;
  };

  // Prepare entry for editing
  const handleEditClick = (entry) => {
    // Transform the data structure for editing
    const editableEntry = {
      id: entry.id,
      name: entry.name,
      description: entry.description,
      type: entry.type,
      templateId:
        entry.template && entry.template.length > 0
          ? entry.template[0].templateId
          : getTemplateId(),
      isDefault: getIsDefault(entry),
    };

    setEditingEntry(editableEntry);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      setIsSubmitting(true);
      try {
        await deleteExpense(id);
        fetchEntries();
      } catch (err) {
        console.error("Error deleting entry:", err);
        alert("Failed to delete entry. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingEntry({
      ...editingEntry,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Transform edited entry to match API payload structure
  const handleEditSave = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: editingEntry.name,
        description: editingEntry.description,
        type: editingEntry.type,
        templateId: editingEntry.templateId,
        isDefault: editingEntry.isDefault,
      };

      await editExpense(payload, editingEntry.id);

      await fetchEntries();
      setEditingEntry(null);
    } catch (err) {
      console.error("Error updating entry:", err);
      alert("Failed to update entry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCancel = () => {
    setEditingEntry(null);
  };

  const handleNewEntryChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewEntry({
      ...newEntry,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    // Set the current template ID from the route
    setNewEntry({
      ...newEntry,
      templateId: getTemplateId(),
    });
  };

  const handleNewEntrySave = async () => {
    setIsSubmitting(true);
    try {
      // The payload already matches the expected format
      const response = await createExpense(newEntry);
      await fetchEntries();

      // Reset form
      setNewEntry({
        name: "",
        description: "",
        type: "debit",
        templateId: getTemplateId(),
        isDefault: false,
      });
      setIsAddingNew(false);
    } catch (err) {
      console.error("Error creating entry:", err);
      alert("Failed to create entry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewEntryCancel = () => {
    setIsAddingNew(false);
    setNewEntry({
      name: "",
      description: "",
      type: "debit",
      templateId: getTemplateId(),
      isDefault: false,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 text-blue-600 animate-spin" />
        <span className="ml-2 text-lg text-gray-700">Loading entries...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
        <p>{error}</p>
        <button
          onClick={fetchEntries}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Financial Entries</h1>
        <button
          onClick={handleAddNew}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          disabled={isSubmitting}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Entry
        </button>
      </div>

      {/* New Entry Form */}
      {isAddingNew && (
        <div className="mb-6 p-4 border border-blue-200 rounded-md bg-blue-50">
          <h2 className="text-lg font-semibold mb-4 text-blue-800">
            New Financial Entry
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={newEntry.name}
                onChange={handleNewEntryChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                name="description"
                value={newEntry.description}
                onChange={handleNewEntryChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                name="type"
                value={newEntry.type}
                onChange={handleNewEntryChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="debit">Debit</option>
                <option value="credit">Credit</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isDefault"
                checked={newEntry.isDefault}
                onChange={handleNewEntryChange}
                className="h-4 w-4 text-blue-600 rounded"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                Set as Default
              </label>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleNewEntryCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleNewEntrySave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader className="animate-spin h-4 w-4 mr-2" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {entries.length === 0 && !isAddingNew && (
        <div className="text-center py-8 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">
            No entries found. Create your first entry!
          </p>
          <button
            onClick={handleAddNew}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors mx-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Entry
          </button>
        </div>
      )}

      {/* Entries Table */}
      {entries.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    Name
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("description")}
                >
                  <div className="flex items-center">
                    Description
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("type")}
                >
                  <div className="flex items-center">
                    Type
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                  <div className="flex items-center">
                    Default
                    <ArrowUpDown className="ml-1 h-3 w-3" />
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {editingEntry ? (
                <tr className="bg-blue-50">
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      name="name"
                      value={editingEntry.name}
                      onChange={handleEditChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      name="description"
                      value={editingEntry.description}
                      onChange={handleEditChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <select
                      name="type"
                      value={editingEntry.type}
                      onChange={handleEditChange}
                      className="w-full px-2 py-1 border border-gray-300 rounded-md"
                    >
                      <option value="debit">Debit</option>
                      <option value="credit">Credit</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={editingEntry.isDefault}
                      onChange={handleEditChange}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                    <button
                      onClick={handleEditSave}
                      className="text-green-600 hover:text-green-900 inline-flex items-center"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="animate-spin h-4 w-4 mr-1" />
                          Saving
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-1" /> Save
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="text-gray-600 hover:text-gray-900 inline-flex items-center"
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </button>
                  </td>
                </tr>
              ) : null}

              {sortedEntries.map((entry) =>
                editingEntry && editingEntry.id === entry.id ? null : (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {entry.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {entry.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          entry.type === "credit"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {entry.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getIsDefault(entry) ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Default
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(entry)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        disabled={isSubmitting || editingEntry !== null}
                      >
                        <Edit className="h-4 w-4 inline" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(entry.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={isSubmitting || editingEntry !== null}
                      >
                        <Trash2 className="h-4 w-4 inline" />
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
