import React, { createContext, useContext, useState, useCallback } from 'react'

const DialogContext = createContext({ open: false, setOpen: () => {} })

export function Dialog({ children, open: controlledOpen, onOpenChange }){
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const setOpen = useCallback((value) => {
    if (isControlled) {
      onOpenChange && onOpenChange(value)
    } else {
      setUncontrolledOpen(value)
    }
  }, [isControlled, onOpenChange])

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  )
}

export const DialogTrigger = ({ children, asChild }) => {
  const { setOpen } = useContext(DialogContext)

  if (asChild && React.isValidElement(children)) {
    const existingOnClick = children.props.onClick
    const handleClick = (e) => {
      existingOnClick && existingOnClick(e)
      setOpen(true)
    }
    return React.cloneElement(children, { onClick: handleClick })
  }

  return (
    <button onClick={() => setOpen(true)}>
      {children}
    </button>
  )
}

export const DialogContent = ({ children, className = '' }) => {
  const { open, setOpen } = useContext(DialogContext)
  if (!open) return null

  return (
    <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',zIndex:60}}>
      <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.45)'}} onClick={() => setOpen(false)} />
      <div className={className} role="dialog" style={{position:'relative',zIndex:61,background:'#fff',borderRadius:8,padding:20,boxShadow:'0 10px 30px rgba(2,6,23,0.2)'}}>
        <button onClick={() => setOpen(false)} style={{position:'absolute',right:12,top:12,border:'none',background:'transparent',cursor:'pointer'}}>✕</button>
        {children}
      </div>
    </div>
  )
}

export const DialogHeader = ({ children }) => <div className="dialog-header">{children}</div>
export const DialogTitle = ({ children }) => <h3 className="dialog-title">{children}</h3>

export default Dialog
