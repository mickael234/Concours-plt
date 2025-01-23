import React from 'react'

export function Sidebar({ children, className, ...props }) {
  return (
    <div className={`w-64 bg-gray-100 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function SidebarContent({ children, className, ...props }) {
  return (
    <div className={`p-4 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function SidebarHeader({ children, className, ...props }) {
  return (
    <div className={`p-4 border-b ${className}`} {...props}>
      {children}
    </div>
  )
}

export function SidebarProvider({ children }) {
  return <>{children}</>
}

