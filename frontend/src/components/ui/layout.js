import * as React from "react"

import { cn } from "../../lib/utils"

const Layout = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("grid min-h-screen w-full lg:grid-cols-[280px_1fr]", className)}
    {...props}
  />
))
Layout.displayName = "Layout"

const LayoutHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex h-14 items-center gap-4 border-b bg-background px-6", className)}
    {...props}
  />
))
LayoutHeader.displayName = "LayoutHeader"

const LayoutContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex-1 flex flex-col", className)} {...props} />
))
LayoutContent.displayName = "LayoutContent"

const LayoutSidebar = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("hidden lg:block", className)} {...props} />
))
LayoutSidebar.displayName = "LayoutSidebar"

export { Layout, LayoutHeader, LayoutContent, LayoutSidebar }

