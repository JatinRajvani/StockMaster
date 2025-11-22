import React from 'react'

export function Table({ children, className = '' }){
  return <table className={`ui-table ${className}`}>{children}</table>
}

export function TableHeader({ children, className = '' }){
  return <thead className={className}>{children}</thead>
}

export function TableBody({ children, className = '' }){
  return <tbody className={className}>{children}</tbody>
}

export function TableRow({ children, className = '' }){
  return <tr className={className}>{children}</tr>
}

export function TableHead({ children, className = '' }){
  return <th className={className}>{children}</th>
}

export function TableCell({ children, className = '' }){
  return <td className={className}>{children}</td>
}

export default Table
