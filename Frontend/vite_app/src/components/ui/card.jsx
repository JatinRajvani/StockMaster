import React from 'react'

export function Card({ children, className = '' }){
  return <div className={`ui-card ${className}`}>{children}</div>
}

export function CardHeader({ children, className = '' }){
  return <div className={`ui-card-header ${className}`}>{children}</div>
}

export function CardContent({ children, className = '' }){
  return <div className={`ui-card-content ${className}`}>{children}</div>
}

export function CardTitle({ children, className = '' }){
  return <div className={`ui-card-title ${className}`}>{children}</div>
}

export default Card
