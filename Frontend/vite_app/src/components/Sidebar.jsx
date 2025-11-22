import React from 'react'
import { NavLink } from 'react-router-dom'
import './sidebar.css'
import {
  PackageOpen,
  Search,
  TruckIcon,
  ArrowRightLeft,
  ClipboardList,
  Package as PackageIcon,
  Warehouse,
} from '@/components/icons'

export default function Sidebar(){
  const items = [
    { to: '/dashboard', label: 'Dashboard', icon: PackageIcon },
    { to: '/products', label: 'Products', icon: PackageOpen },
    { to: '/receipts', label: 'Receipts', icon: PackageOpen },
    { to: '/deliveries', label: 'Deliveries', icon: TruckIcon },
    { to: '/transfers', label: 'Transfers', icon: ArrowRightLeft },
    { to: '/adjustments', label: 'Adjustments', icon: ClipboardList },
    { to: '/move-history', label: 'Move History', icon: Search },
    { to: '/settings', label: 'Settings', icon: Warehouse },
  ]

  return (
    <aside className="sm-sidebar">
      {/* Animated Background Pattern */}
      <div className="sm-sidebar-bg"></div>

      <div className="sm-sidebar-content">
        {/* Logo Section */}
        <div className="sm-logo-wrapper">
          <div className="sm-logo">
            <div className="sm-logo-icon-wrapper">
              <div className="sm-logo-glow"></div>
              <div className="sm-logo-icon">
                <div className="sm-logo-shine"></div>
                📦
              </div>
            </div>
            <div className="sm-logo-text">
              <div className="sm-brand">StockMaster</div>
              <div className="sm-sub">Inventory</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sm-nav">
          {items.map((item, index) => {
            const Icon = item.icon
            return (
              <NavLink 
                key={item.to} 
                to={item.to} 
                className={({isActive}) => `sm-nav-item ${isActive ? 'active' : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="sm-nav-indicator"></div>
                <span className="sm-nav-icon">
                  <Icon />
                </span>
                <span className="sm-nav-label">{item.label}</span>
                <div className="sm-nav-hover-bg"></div>
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* Profile Section */}
      <div className="sm-sidebar-bottom">
        <div className="sm-profile">
          <div className="sm-avatar-wrapper">
            <div className="sm-avatar">
              <div className="sm-avatar-shine"></div>
              <span className="sm-avatar-text">PK</span>
            </div>
          </div>
          <div className="sm-user">
            <div className="sm-name">Prem Kambaliya</div>
            <div className="sm-email">premkambaliya1@gmail.com</div>
          </div>
          <div className="sm-status-indicator"></div>
        </div>
      </div>
    </aside>
  )
}