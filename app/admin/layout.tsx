"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { useAuth } from "@/lib/auth-provider"
import { useToast } from "@/hooks/use-toast"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!user) {
      toast({
        title: "Access denied",
        description: "Please sign in to access the admin panel",
        variant: "destructive",
      })
      router.push("/sign-in")
    } else if (!user.isAdmin) {
      toast({
        title: "Access denied",
        description: "You do not have admin privileges to access this area",
        variant: "destructive",
      })
      router.push("/")
    }
  }, [user, router, toast])

  if (!user || !user.isAdmin) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] min-h-[calc(100vh-4rem)]">
      <AdminSidebar />
      <main className="p-6 bg-muted/30">{children}</main>
    </div>
  )
}
