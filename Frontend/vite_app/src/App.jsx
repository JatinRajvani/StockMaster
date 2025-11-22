import React from 'react'
import './index.css'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Dashboard from '@/pages/Dashboard'
import Products from '@/pages/Products'
import MoveHistory from '@/pages/MoveHistory'
import Receipts from '@/pages/Receipts'
import Deliveries from '@/pages/Deliveries'
import Transfers from '@/pages/Transfers'
import Adjustments from '@/pages/Adjustments'
import Settings from '@/pages/Settings'
import WarehouseDetails from '@/pages/WarehouseDetails'
import LocationDetails from "@/pages/LocationDetails";
import Profile from '@/pages/Profile'
import Auth from '@/pages/Auth'
import Sidebar from '@/components/Sidebar'
import NewReceipt from "@/pages/NewReceipt";
import ReceiptDetails from "@/pages/ReceiptDetails";
function App() {
  return (
    <BrowserRouter>
      <InnerApp />
    </BrowserRouter>
  )
}

export default App

function RequireAuth({ children }){
  const isAuthed = !!localStorage.getItem('authUser')
  if (!isAuthed) return <Navigate to="/auth" replace />
  return children
}

function InnerApp(){
  const location = useLocation()
  const isAuthPage = location.pathname.startsWith('/auth')
  const isAuthed = !!localStorage.getItem('authUser')

  return (
    <div style={{display:'flex',minHeight:'100vh'}}>
      {!isAuthPage && <Sidebar />}
      <main style={{flex:1,padding:'28px',background:'#f7fafc'}}>
        <Routes>
          <Route path="/auth" element={isAuthed ? <Navigate to="/dashboard" replace /> : <Auth />} />

          <Route path="/" element={<RequireAuth><Settings /></RequireAuth>} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/products" element={<RequireAuth><Products /></RequireAuth>} />
          <Route path="/move-history" element={<RequireAuth><MoveHistory /></RequireAuth>} />
          <Route path="/receipts" element={<RequireAuth><Receipts /></RequireAuth>} />
          <Route path="/deliveries" element={<RequireAuth><Deliveries /></RequireAuth>} />
          <Route path="/transfers" element={<RequireAuth><Transfers /></RequireAuth>} />
          <Route path="/adjustments" element={<RequireAuth><Adjustments /></RequireAuth>} />
          <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/warehouses/:warehouseId" element={<RequireAuth><WarehouseDetails /></RequireAuth>} />
          <Route path="/warehouses/:warehouseId/locations/:locationId" element={<RequireAuth><LocationDetails /></RequireAuth>} />
          <Route path="/receipts/new" element={<NewReceipt />} />
          <Route path="/receipts/:id" element={<ReceiptDetails />} />

        </Routes>
      </main>
    </div>
  )
}
