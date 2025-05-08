import { useEffect, useState } from "react";
import { User, Edit, Trash2, PlusCircle, Check, X } from "lucide-react";
import {
  createTemplate,
  deleteTemplate,
  editTemplate,
  getAllTemplate,
} from "../../api/auth";

export default function Template() {
  const [names, setNames] = useState([]);
  const [view, setView] = useState("list"); // 'list', 'create'
  const [currentEditId, setCurrentEditId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [newName, setNewName] = useState("");

  useEffect(() => {
    handleGetAllTemplate();
  }, []);

  const handleGetAllTemplate = async () => {
    try {
      const response = await getAllTemplate();
      setNames(response.data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const handleCreateName = async () => {
    if (newName.trim() === "") return;
    try {
      const newItem = { name: newName };
      const response = await createTemplate(newItem);
      setNames([...names, response.data]); // Assuming API returns new item with `id`
      setNewName("");
      setView("list");
    } catch (error) {
      console.error("Error creating template:", error);
    }
  };

  const handleEditName = async () => {
    if (editValue.trim() === "") return;
    try {
      const updatedNameObj = { allowedEditDays: 1, name: editValue };
      await editTemplate(updatedNameObj, currentEditId);
      setNames((prev) =>
        prev.map((item) =>
          item.id === currentEditId ? { ...item, name: editValue } : item
        )
      );
      setCurrentEditId(null);
      setEditValue("");
    } catch (error) {
      console.error("Error editing template:", error);
    }
  };

  const handleDeleteName = async (id) => {
    try {
      await deleteTemplate(id);
      setNames((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting template:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Template</h1>
      </header>

      {view === "list" && (
        <>
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setView("create")}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <PlusCircle size={16} className="mr-1" />
              Add Template
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {names.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {currentEditId === item.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                        autoFocus
                      />
                      <button
                        onClick={handleEditName}
                        className="p-1 text-green-600 hover:text-green-800"
                      >
                        <Check size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setCurrentEditId(null);
                          setEditValue("");
                        }}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div>
                          <h3 className="font-medium text-gray-800">
                            {item.name}
                          </h3>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setCurrentEditId(item.id);
                            setEditValue(item.name);
                          }}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteName(item.id)}
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
        </>
      )}

      {view === "create" && (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-lg mx-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Add New Name
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter name"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setView("list")}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateName}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={newName.trim() === ""}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
