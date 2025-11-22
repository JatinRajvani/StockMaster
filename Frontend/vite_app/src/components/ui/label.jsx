import React from 'react'

export function Label({ children, htmlFor, className = '' }){
  return <label htmlFor={htmlFor} className={`ui-label ${className}`}>{children}</label>
}

export default Label
