"use client"

import { Home, TrendingUp, Users, BookOpen, Search, Settings, LogOut, Plus, ChevronDown, PanelLeftClose } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

// Menu items
const items = [
  {
    title: "Home",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Popular",
    url: "/popular",
    icon: TrendingUp,
  },
  {
    title: "College",
    url: "/college",
    icon: Users,
  },
  {
    title: "Projects",
    url: "/projects",
    icon: BookOpen,
  },
]

interface AppSidebarProps {
  subgroups?: Array<{ id: number; name: string }>
}

export function AppSidebar({ subgroups = [] }: AppSidebarProps) {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { setOpen } = useSidebar()

  const handleLogout = () => {
    logout()
    router.push('/auth')
  }

  const handleNavigation = (url: string) => {
    router.push(url)
    setOpen(false) // Close sidebar on mobile after navigation
  }

  return (
    <Sidebar collapsible="icon" className="glass-sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground interactive-hover">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-sidebar-primary-foreground">
                <BookOpen className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold accent-blue">Prodiny</span>
                <span className="truncate text-xs">Platform</span>
              </div>
              <SidebarTrigger className="ml-auto button-press" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="interactive-hover">
                    <button onClick={() => handleNavigation(item.url)} className="button-press">
                      <item.icon />
                      <span>{item.title}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Communities</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {subgroups.slice(0, 5).map((subgroup) => (
                <SidebarMenuItem key={subgroup.id}>
                  <SidebarMenuButton asChild>
                    <button 
                      onClick={() => handleNavigation(`/subgroups/${subgroup.name.toLowerCase().replace(/\s+/g, '-')}`)}
                      className="w-full justify-start"
                    >
                      <span className="truncate">{subgroup.name}</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button onClick={() => handleNavigation('/subgroups')} className="w-full justify-start text-muted-foreground">
                    <Plus className="size-4" />
                    <span>View all</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name || 'User'}</span>
                    <span className="truncate text-xs">{user?.email}</span>
                  </div>
                  <ChevronDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem onClick={() => handleNavigation('/profile-setup')}>
                  <Settings className="size-4 mr-2" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="size-4 mr-2" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
