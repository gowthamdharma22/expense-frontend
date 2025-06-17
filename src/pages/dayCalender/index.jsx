import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Snowflake,
  Calendar,
  Badge,
} from "lucide-react";
import { getDayByDate } from "../../api/api";
import { useNavigate } from "react-router-dom";
function DayCalender() {
  const nav = useNavigate();
  const [monthData, setMonthData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const shopId = () => {
    const templateId = window.location.pathname.split("/").pop();
    return templateId;
  };

  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    fetchMonthData();
  }, [currentDate]);

  const fetchMonthData = async () => {
    setLoading(true);
    try {
      // Format current date as YYYY-MM string
      const monthString = `${currentYear}-${String(currentMonth + 1).padStart(
        2,
        "0"
      )}`;
      const data = await getDayByDate(monthString, shopId());
      console.log("Fetched month data:", data);
      setMonthData(data.data || []);
    } catch (error) {
      console.error("Failed to fetch month data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Generate calendar days
  const calendarDays = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Check if a date exists in API data
  const getDateData = (day) => {
    if (!day) return null;
    const targetDate = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;
    return monthData.find((item) => {
      // Extract date part from UTC string without timezone conversion
      const itemDate = item.date.split("T")[0];
      return itemDate === targetDate;
    });
  };

  // Check if date is in future
  const isFutureDate = (day) => {
    if (!day) return false;
    const date = new Date(currentYear, currentMonth, day);
    return date > today;
  };

  const handleDateClick = (day) => {
    if (!day || isFutureDate(day)) return;

    setSelectedDate(day);
    const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(
      2,
      "0"
    )}-${String(day).padStart(2, "0")}`;

    console.log("Date clicked:", formattedDate);
    nav(`/dayExpense/${formattedDate}?shopId=${shopId()}`);
  };

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Calendar className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-800">Day Calendar</h1>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center space-x-4">
              <button
                onClick={goToPreviousMonth}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>

              <div className="text-xl font-semibold text-gray-800 min-w-[200px] text-center">
                {monthNames[currentMonth]} {currentYear}
              </div>

              <button
                onClick={goToNextMonth}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          )}

          {!loading && (
            <>
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="p-4 text-center font-semibold text-gray-600 text-sm"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => {
                  const dateData = getDateData(day);
                  const isFuture = isFutureDate(day);
                  const isToday =
                    day &&
                    currentYear === today.getFullYear() &&
                    currentMonth === today.getMonth() &&
                    day === today.getDate();
                  const isSelected = day === selectedDate;

                  return (
                    <div
                      key={index}
                      className={`
                        relative aspect-square p-2 rounded-xl border-2 transition-all duration-200
                        ${
                          !day
                            ? "border-transparent"
                            : isFuture
                            ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                            : isSelected
                            ? "border-indigo-500 bg-indigo-50"
                            : isToday
                            ? "border-green-400 bg-green-50"
                            : dateData
                            ? "border-blue-300 bg-blue-50 hover:border-blue-400 cursor-pointer"
                            : "border-gray-200 hover:border-gray-300 cursor-pointer"
                        }
                      `}
                      onClick={() => handleDateClick(day)}
                    >
                      {day && (
                        <>
                          {/* Day Number */}
                          <div
                            className={`
                            text-lg font-semibold text-center mb-1
                            ${
                              isFuture
                                ? "text-gray-400"
                                : isToday
                                ? "text-green-700"
                                : isSelected
                                ? "text-indigo-700"
                                : dateData
                                ? "text-blue-700"
                                : "text-gray-700"
                            }
                          `}
                          >
                            {day}
                          </div>

                          {/* Created Badge */}
                          {dateData && (
                            <div className="absolute top-1 right-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            </div>
                          )}

                          {/* Status Indicators */}
                          {dateData && (
                            <div className="flex justify-center space-x-1 mt-1">
                              {/* Verified Status */}
                              {dateData.isVerified ? (
                                <div className="bg-green-100 p-1 rounded-full">
                                  <Check className="w-3 h-3 text-green-600" />
                                </div>
                              ) : (
                                <div className="bg-yellow-100 p-1 rounded-full">
                                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                </div>
                              )}

                              {/* Frozen Status */}
                              {dateData.isFrozen && (
                                <div className="bg-blue-100 p-1 rounded-full">
                                  <Snowflake className="w-3 h-3 text-blue-600" />
                                </div>
                              )}
                            </div>
                          )}

                          {/* Today Indicator */}
                          {isToday && (
                            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                              <div className="text-xs font-bold text-green-700">
                                Today
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Legend */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Legend</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Date Created</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-green-100 p-1 rounded-full">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-sm text-gray-600">Verified</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-yellow-100 p-1 rounded-full">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              </div>
              <span className="text-sm text-gray-600">Not Verified</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-blue-100 p-1 rounded-full">
                <Snowflake className="w-3 h-3 text-blue-600" />
              </div>
              <span className="text-sm text-gray-600">Frozen</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DayCalender;
