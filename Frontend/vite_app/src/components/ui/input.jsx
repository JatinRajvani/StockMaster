import React from 'react'

export function Input(props){
  const { className = '', ...rest } = props
  return <input className={`ui-input ${className}`} {...rest} />
}

export default Input
