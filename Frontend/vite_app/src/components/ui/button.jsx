import React from 'react'

export function Button({ children, className = '', variant, size, ...rest }){
  return (
    <button className={`ui-button ${className}`} {...rest}>
      {children}
    </button>
  )
}

export default Button
