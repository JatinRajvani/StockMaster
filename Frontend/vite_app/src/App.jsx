import React from 'react'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
import Sidebar from '@/components/Sidebar'

function App() {
  return (
    <BrowserRouter>
      <div style={{display:'flex',minHeight:'100vh'}}>
        <Sidebar />
        <main style={{flex:1,padding:'28px',background:'#f7fafc'}}>
          <Routes>
            <Route path="/" element={<Settings />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/move-history" element={<MoveHistory />} />
            <Route path="/receipts" element={<Receipts />} />
            <Route path="/deliveries" element={<Deliveries />} />
            <Route path="/transfers" element={<Transfers />} />
            <Route path="/adjustments" element={<Adjustments />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/warehouses/:warehouseId" element={<WarehouseDetails />} />
            <Route path="/warehouses/:warehouseId/locations/:locationId" element={<LocationDetails />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
