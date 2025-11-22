import React from 'react'

export function Button({ children, className = '', variant = 'primary', size = 'md', ...rest }){
  const base = 'ui-button group relative overflow-hidden font-medium rounded-lg transition-all duration-300';

  const sizeMap = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5',
    lg: 'px-7 py-3 text-base'
  };

  const variantMap = {
    primary: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-0.5',
    outline: 'border-2 border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-400 hover:bg-slate-50 hover:shadow-md transform hover:scale-105',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 hover:shadow-md transform hover:scale-105',
    destructive: 'bg-red-600 hover:bg-red-700 text-white shadow-md',
    success: 'bg-green-600 hover:bg-green-700 text-white shadow-md'
  };

  const classes = [base, sizeMap[size] || sizeMap.md, variantMap[variant] || ''].join(' ');

  return (
    <button className={`${classes} ${className}`} {...rest}>
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      )}
    </button>
  )
}

export default Button
