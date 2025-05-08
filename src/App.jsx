import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AuthContainer from './pages/auth'
import "./index.css"
import "./App.css"
import Template from './pages/template'
import FinancialEntryTemplate from './pages/expense'
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthContainer />} />
        <Route path="/template" element={<Template />} />
        <Route path="/expense" element={<FinancialEntryTemplate />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
