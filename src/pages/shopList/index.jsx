import React, { useState, useEffect } from "react";
import { Store, ChevronRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAllShop } from "../../api/api";
import Navbar from "../../components/nav";
const ShopSelection = () => {
  const nav = useNavigate();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    fetchShops();
  }, []);

  const handleShopClick = (shopId) => {
    nav(`/expense?shopId=${shopId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-blue-600 text-lg font-medium">
              Loading shops...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <Store className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-3">
              Choose Shop
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Select a shop to view and manage your daily expenses
            </p>
          </div>

          {/* Shop Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <div
                key={shop.id}
                onClick={() => handleShopClick(shop.id)}
                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-blue-100 hover:border-blue-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Store className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                        {shop.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Click to view expenses
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {shops.length === 0 && !loading && (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Store className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No shops found
              </h3>
              <p className="text-gray-600 mb-6">
                There are no shops available at the moment.
              </p>
              <button
                onClick={() => nav("/shop")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
              >
                Create shop
              </button>
            </div>
          )}

          {/* Footer */}
          {shops.length > 0 && (
            <div className="text-center mt-12 pt-8 border-t border-blue-100">
              <p className="text-gray-500">
                Found {shops.length} shop{shops.length !== 1 ? "s" : ""} • Click
                any card to continue
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ShopSelection;
