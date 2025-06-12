import React, { useState, useEffect } from "react";
import {
  getAllShop,
  createShop,
  editShop,
  deleteShop,
  getAllTemplate,
} from "../../api/api";
import { PlusCircle, Pencil, Trash2, X, Save, Loader2 } from "lucide-react";

const Shop = () => {
  const [shops, setShops] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formMode, setFormMode] = useState("create"); // 'create' or 'edit'
  const [currentShop, setCurrentShop] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    templateId: "",
    allowedEditDays: 7,
  });

  // Fetch shops and templates on mount
  useEffect(() => {
    fetchShops();
    fetchTemplates();
  }, []);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const data = await getAllShop();
      console.log("Fetched shops:", data);
      setShops(data.data || []);
    } catch (error) {
      console.error("Failed to fetch shops:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const data = await getAllTemplate();
      setTemplates(data.data || []);
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "templateId" || name === "allowedEditDays"
          ? Number(value)
          : value,
    });
  };

  const openCreateModal = () => {
    setFormData({
      name: "",
      templateId: templates.length > 0 ? templates[0].id : "",
      allowedEditDays: 7,
    });
    setFormMode("create");
    setIsModalOpen(true);
  };

  const openEditModal = (shop) => {
    setFormData({
      name: shop.name,
      templateId: shop.templateId,
      allowedEditDays: shop.allowedEditDays,
    });
    setCurrentShop(shop);
    setFormMode("edit");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (formMode === "create") {
        await createShop(formData);
      } else {
        await editShop(formData, currentShop.id);
      }

      fetchShops();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save shop:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this shop?")) {
      try {
        await deleteShop(id);
        fetchShops();
      } catch (error) {
        console.error("Failed to delete shop:", error);
      }
    }
  };

  // Modal component
  const Modal = () => {
    if (!isModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {formMode === "create" ? "Add New Shop" : "Edit Shop"}
            </h2>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shop Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template
                </label>
                <select
                  name="templateId"
                  value={formData.templateId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="" disabled>
                    Select a template
                  </option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allowed Edit Days
                </label>
                <input
                  type="number"
                  name="allowedEditDays"
                  value={formData.allowedEditDays}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center"
              >
                <Save size={18} className="mr-1" />
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <Modal />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shop Management</h1>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center"
        >
          <PlusCircle size={18} className="mr-1" />
          Add Shop
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 size={40} className="animate-spin text-blue-600" />
        </div>
      ) : shops.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-gray-500 text-lg">
            No shops found. Add a new shop to get started.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shop Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Template
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Allowed Edit Days
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {shops &&
                shops.map((shop) => {
                  const template = templates.find(
                    (t) => t.id === shop.templateId
                  );

                  return (
                    <tr key={shop.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {shop.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {template?.name || `Template ${shop.templateId}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {shop.allowedEditDays} day
                        {shop.allowedEditDays !== 1 ? "s" : ""}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => openEditModal(shop)}
                          className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                        >
                          <Pencil size={16} className="mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(shop.id)}
                          className="text-red-600 hover:text-red-900 inline-flex items-center"
                        >
                          <Trash2 size={16} className="mr-1" />
                          Delete
                        </button>
                      </td>
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

export default Shop;
