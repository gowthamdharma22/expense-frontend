import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthContainer from "./pages/auth";
import "./index.css";
import "./App.css";
import Template from "./pages/template";
import FinancialEntryTemplate from "./pages/expense";
import ProtectedRoute from "./components/protectedRoute/index.jsx";
import Shop from "./pages/shop/index.jsx";
import DayExpense from "./pages/dayExpense/index.jsx";
import ShopList from "./pages/shopList/index.jsx";
import ExpenseNote from "./pages/note/index.jsx";
import Summary from "./pages/summary/index.jsx";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthContainer />} />
        <Route
          path="/template"
          element={
            <ProtectedRoute>
              <Template />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expense/:id"
          element={
            <ProtectedRoute>
              <FinancialEntryTemplate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/data"
          element={
            <ProtectedRoute>
              <Shop />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expense"
          element={
            <ProtectedRoute>
              <DayExpense />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ShopList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes/:shopId"
          element={
            <ProtectedRoute>
              <ExpenseNote />
            </ProtectedRoute>
          }
        />
        <Route
          path="/summary"
          element={
            <ProtectedRoute>
              <Summary />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
