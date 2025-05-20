"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  FileText,
  Home,
  LogOut,
  PlusCircle,
  Settings,
  Users,
  ImageIcon,
  Layers,
  Sun,
  Moon,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { useTheme } from "next-themes"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarSeparator,
  SidebarGroupLabel,
  SidebarGroup,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function AdminSidebar() {
  const pathname = usePathname()
  const { logout, profile } = useAuth()
  const { theme, setTheme } = useTheme()
  const [isMounted, setIsMounted] = useState(false)
  const [postCount, setPostCount] = useState<number | null>(null)
  const [projectCount, setProjectCount] = useState<number | null>(null)
  const [isLoadingPostCount, setIsLoadingPostCount] = useState(true)
  const [isLoadingProjectCount, setIsLoadingProjectCount] = useState(true)

  useEffect(() => {
    setIsMounted(true)

    const fetchCounts = async () => {
      setIsLoadingPostCount(true)
      setIsLoadingProjectCount(true)
      try {
        const [postResponse, projectResponse] = await Promise.all([
          fetch('/api/posts/count'),
          fetch('/api/projects?count=true')
        ]);

        if (!postResponse.ok) {
          console.error('Failed to fetch post count')
          setPostCount(null)
        } else {
          const postData = await postResponse.json()
          setPostCount(postData.count ?? 0)
        }

        if (!projectResponse.ok) {
          console.error('Failed to fetch project count')
          setProjectCount(null)
        } else {
          const projectData = await projectResponse.json()
          setProjectCount(projectData.count ?? 0)
        }
        
      } catch (error) {
        console.error("Error fetching counts:", error)
        setPostCount(null)
        setProjectCount(null)
      } finally {
        setIsLoadingPostCount(false)
        setIsLoadingProjectCount(false)
      }
    }

    fetchCounts()
  }, [])

  const isActive = (path: string) => {
    if (path === "/admin" && pathname === "/admin") {
      return true
    }
    if (path !== "/admin" && pathname.startsWith(path)) {
      return true
    }
    return false
  }

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border bg-background [&>[data-mobile=true]]:bg-black/60 [&>[data-mobile=true]]:backdrop-blur-md"
    >
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary">
            <Layers className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-sm font-bold">Admin Dashboard</span>
            <span className="truncate text-xs text-muted-foreground">v1.0.0</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium px-2 py-1.5">Main</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/admin")} tooltip="Dashboard">
                <Link href="/admin" className="flex items-center gap-2">
                  <Home className="h-4 w-4 shrink-0" />
                  <span className="truncate">Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/admin/analytics")} tooltip="Analytics">
                <Link href="/admin/analytics" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 shrink-0" />
                  <span className="truncate">Analytics</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator className="my-2" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium px-2 py-1.5">Content</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/admin/posts")} tooltip="Posts">
                <Link href="/admin/posts" className="flex items-center gap-2">
                  <FileText className="h-4 w-4 shrink-0" />
                  <span className="truncate">Posts</span>
                  <Badge className="ml-auto text-xs py-0 px-1.5 h-5 bg-muted text-muted-foreground min-w-[20px] flex items-center justify-center" variant="secondary">
                    {isLoadingPostCount ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : postCount !== null ? (
                      postCount
                    ) : (
                      '?'
                    )}
                  </Badge>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/admin/projects")} tooltip="Projects">
                <Link href="/admin/projects" className="flex items-center gap-2">
                  <Layers className="h-4 w-4 shrink-0" />
                  <span className="truncate">Projects</span>
                  <Badge className="ml-auto text-xs py-0 px-1.5 h-5 bg-muted text-muted-foreground min-w-[20px] flex items-center justify-center" variant="secondary">
                    {isLoadingProjectCount ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : projectCount !== null ? (
                      projectCount
                    ) : (
                      '?'
                    )}
                  </Badge>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/admin/posts/create")} tooltip="Create Post">
                <Link href="/admin/posts/create" className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4 shrink-0" />
                  <span className="truncate">Create Post</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/admin/media")} tooltip="Media Library">
                <Link href="/admin/media" className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 shrink-0" />
                  <span className="truncate">Media Library</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator className="my-2" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium px-2 py-1.5">Administration</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/admin/users")} tooltip="Users">
                <Link href="/admin/users" className="flex items-center gap-2">
                  <Users className="h-4 w-4 shrink-0" />
                  <span className="truncate">Users</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={isActive("/admin/settings")} tooltip="Settings">
                <Link href="/admin/settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4 shrink-0" />
                  <span className="truncate">Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4 space-y-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage 
                src={profile?.avatar || "/placeholder.svg?height=32&width=32"} 
                alt={profile?.name ? `${profile.name}'s avatar` : "User avatar"} />
              <AvatarFallback>{
                profile?.name
                  ? profile.name.charAt(0).toUpperCase()
                  : "E"
              }</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{ profile?.name || "Error"}</p>
              <p className="text-xs text-muted-foreground truncate">{ profile?.role || "Error"}</p>
            </div>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full shrink-0"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {isMounted && theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{theme === "dark" ? "Light mode" : "Dark mode"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Button variant="outline" className="w-full justify-start" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4 shrink-0" />
          <span className="truncate">Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}

export function AdminSidebarTrigger() {
  return (
    <SidebarTrigger className="absolute left-4 top-4 z-50 md:hidden rounded-md bg-black/65 backdrop-blur-sm shadow-sm" />
  )
}
