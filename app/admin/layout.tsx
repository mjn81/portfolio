"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { AdminSidebar, AdminSidebarTrigger } from "@/components/admin/sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toaster"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Don't show sidebar on login page
  const isLoginPage = pathname === "/admin/login"

  if (isLoginPage) {
    return (
      <>
        {children}
        <Toaster />
      </>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <SidebarInset className="flex-1">
          <div className="relative flex min-h-screen flex-col">
            <AdminSidebarTrigger />
            <main className="flex-1 p-4 md:p-6">{children}</main>
          </div>
        </SidebarInset>
      </div>
      <Toaster />
    </SidebarProvider>
  )
}
