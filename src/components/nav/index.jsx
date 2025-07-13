import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  LogOut,
  User,
  TrendingUp,
  BarChart3,
  Database,
  Store,
  Menu,
  DollarSign,
  Calendar,
} from "lucide-react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { getAllShop } from "../../api/api";

const ModernNavbar = ({ monthlyExpense }) => {
  const nav = useNavigate();
  const location = useLocation();
  const userName = localStorage.getItem("name");
  const [searchParams, setSearchParams] = useSearchParams();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [activeRoute, setActiveRoute] = useState("expense");

  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const data = await getAllShop();
      const shopList = data.data || [];
      setShops(shopList);

      // Set selected shop from URL
      const shopIdFromUrl = searchParams.get("shopId");
      console.log(shopIdFromUrl, shopList, "op");
      if (shopIdFromUrl) {
        const matchedShop = shopList.find((s) => s.id == shopIdFromUrl);
        console.log(matchedShop, "op");
        if (matchedShop) {
          setSelectedShop(matchedShop);
        }
      } else if (shopList.length > 0) {
        setSelectedShop(shopList[0]);
        searchParams.set("shopId", shopList[0].id);
        setSearchParams(searchParams);
      }
    } catch (error) {
      console.error("Failed to fetch shops:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleShopSelect = (shop) => {
    setIsDropdownOpen(false);
    const newParams = new URLSearchParams(searchParams);
    newParams.set("shopId", shop.id); // or shop._id if that's what you're using
    window.location.href = `${location.pathname}?${newParams.toString()}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getCurrentMonthAndDate = () => {
    const now = new Date();
    const month = now.toLocaleString("default", { month: "long" });
    const date = now.getDate();
    return { month, date };
  };

  const totalMonthlyExpense = shops.reduce(
    (sum, shop) => sum + shop.monthlyExpense,
    0
  );

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              {[
                {
                  label: "Expense",
                  icon: TrendingUp,
                  route: "/expense",
                  key: "expense",
                },
                {
                  label: "Summary",
                  icon: BarChart3,
                  route: "/summary",
                  key: "summary",
                },
                { label: "Data", icon: Database, route: "/data", key: "data" },
              ].map(({ label, icon: Icon, route, key }) => (
                <div
                  key={key}
                  onClick={() =>
                    nav(`${route}?shopId=${selectedShop?.id || ""}`)
                  }
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm cursor-pointer ${
                    activeRoute === key
                      ? "bg-white text-blue-600 shadow-md"
                      : "text-blue-100 hover:text-white hover:bg-blue-500"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Center - Shop & Expense */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white border-opacity-20">
              <Store className="w-4 h-4 text-white" />
              <h1 className="text-sm font-semibold text-white">
                {selectedShop?.name || "Loading..."}
              </h1>
            </div>

            <div className="flex items-center space-x-4 bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white border-opacity-20">
              <div className="flex items-center space-x-2 text-white">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {getCurrentMonthAndDate().month}{" "}
                  {getCurrentMonthAndDate().date}
                </span>
              </div>
              {monthlyExpense && (
                <>
                  <div className="h-4 w-px bg-white bg-opacity-30" />
                  <div className="flex items-center space-x-2">
                    {/* <DollarSign className="w-4 h-4 text-white" /> */}

                    <span className="text-sm font-semibold text-white">
                      {formatCurrency(
                        selectedShop?.monthlyExpense || monthlyExpense
                      )}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right - User & Menu */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-white">
              <User className="w-4 h-4" />
              <span className="font-medium text-sm">{userName}</span>
            </div>

            {/* Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-center w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg transition-all duration-200 backdrop-blur-sm border border-white border-opacity-20"
              >
                <Menu className="w-5 h-5" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-3">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">Switch Shop</span>
                      <div className="text-xs opacity-90 bg-white bg-opacity-20 px-2 py-1 rounded">
                        Current: {selectedShop?.name}
                      </div>
                    </div>
                  </div>

                  <div className="py-2 max-h-48 overflow-y-auto">
                    {shops.map((shop) => (
                      <button
                        key={shop.id}
                        onClick={() => handleShopSelect(shop)}
                        className={`w-full text-left px-5 py-3 hover:bg-blue-50 transition-colors duration-150 flex items-center justify-between text-sm ${
                          selectedShop?.id === shop.id
                            ? "bg-blue-50 border-l-4 border-blue-500"
                            : ""
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                              selectedShop?.id === shop.id
                                ? "bg-blue-500"
                                : "bg-gray-200"
                            }`}
                          >
                            <Store
                              className={`w-4 h-4 ${
                                selectedShop?.id === shop.id
                                  ? "text-white"
                                  : "text-gray-600"
                              }`}
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">
                              {shop.name}
                            </div>
                          </div>
                        </div>
                        {selectedShop?.id === shop.id && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 bg-gray-50">
                    {monthlyExpense && (
                      <div className="px-5 py-3 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">
                            Total Monthly
                          </span>

                          <span className="font-bold text-blue-600">
                            {formatCurrency(monthlyExpense)}
                          </span>
                        </div>
                      </div>
                    )}

                    <button className="w-full text-left px-5 py-3 text-red-600 hover:bg-red-50 transition-colors duration-150 flex items-center space-x-2 border-t border-gray-200 text-sm">
                      <LogOut className="w-4 h-4" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isDropdownOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-10 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </nav>
  );
};

export default ModernNavbar;
