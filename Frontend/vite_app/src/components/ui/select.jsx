import React from 'react'

// Very small select implementation: renders a native <select> using provided SelectItem children.
export function Select({ children, value, onValueChange, className = '' }){
  // collect SelectItem children
  const items = []
  React.Children.forEach(children, (child) => {
    if (!child) return
    if (child.type && child.type.displayName === 'SelectItem') {
      items.push(child.props)
    } else if (child.props && child.props.children) {
      // search deeper
      React.Children.forEach(child.props.children, (c) => {
        if (!c) return
        if (c.type && c.type.displayName === 'SelectItem') items.push(c.props)
      })
    }
  })

  return (
    <select className={`ui-select ${className}`} value={value} onChange={(e)=>onValueChange?.(e.target.value)}>
      {items.map((it)=> <option key={it.value} value={it.value}>{it.children}</option>)}
    </select>
  )
}

export const SelectTrigger = ({ children }) => <div>{children}</div>
export const SelectValue = ({ placeholder }) => <span>{placeholder}</span>
export const SelectContent = ({ children }) => <div>{children}</div>
export const SelectItem = ({ value, children }) => {
  return null
}
SelectItem.displayName = 'SelectItem'

export default Select
