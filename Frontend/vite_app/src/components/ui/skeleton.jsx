import React from 'react'

export function Skeleton({ className = '' }){
  return <div className={`ui-skeleton ${className}`} style={{minHeight:10}} />
}

export default Skeleton
