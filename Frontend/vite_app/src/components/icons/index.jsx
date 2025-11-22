import React from 'react'

export const Search = (props) => <span {...props} style={{display:'inline-block',width:14,height:14}}>🔍</span>
export const PackageOpen = (props) => <span {...props} style={{display:'inline-block',width:14,height:14}}>📦</span>
export const TruckIcon = (props) => <span {...props} style={{display:'inline-block',width:14,height:14}}>🚚</span>
export const ArrowRightLeft = (props) => <span {...props} style={{display:'inline-block',width:14,height:14}}>↔️</span>
export const ClipboardList = (props) => <span {...props} style={{display:'inline-block',width:14,height:14}}>📋</span>

export const Package = PackageOpen
export const AlertTriangle = (props) => <span {...props}>⚠️</span>
export const TrendingUp = (props) => <span {...props}>📈</span>
export const TrendingDown = (props) => <span {...props}>📉</span>
export const Plus = (props) => <span {...props}>➕</span>
export const Trash2 = (props) => <span {...props}>🗑️</span>
export const CheckCircle = (props) => <span {...props}>✅</span>
export const CheckCircle2 = CheckCircle
export const Edit = (props) => <span {...props}>✏️</span>
export const Warehouse = (props) => <span {...props}>🏬</span>

export default {
  Search, PackageOpen, TruckIcon, ArrowRightLeft, ClipboardList,
  Package, AlertTriangle, TrendingUp, TrendingDown,
  Plus, Trash2, CheckCircle, CheckCircle2, Edit, Warehouse
}
