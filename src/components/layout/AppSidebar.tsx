import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    Users,
    Receipt,
    CreditCard,
    ArrowRightLeft,
    BookOpen,
    Library,
    PieChart,
    Settings,
    LogOut,
    ChevronRight,
    Landmark
} from "lucide-react"

const adminNavItems = [
    { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
    { title: "Members", url: "/admin/members", icon: Users },
]

const accountingNavItems = [
    { title: "Receipts", url: "/admin/accounting/receipts", icon: Receipt },
    { title: "Payments", url: "/admin/accounting/payments", icon: CreditCard },
    { title: "Contra", url: "/admin/accounting/contra", icon: ArrowRightLeft },
    { title: "Journal", url: "/admin/accounting/journal", icon: BookOpen },
    { title: "Ledgers", url: "/admin/accounting/ledgers", icon: Library },
    { title: "Reports", url: "/admin/accounting/reports", icon: PieChart },
]

const settingsNavItems = [
    { title: "Bank Accounts", url: "/admin/settings/banks", icon: Landmark },
    { title: "Settings", url: "/admin/settings", icon: Settings },
]

export function AppSidebar() {
    const pathname = usePathname()

    return (
        <Sidebar>
            <SidebarHeader className="border-b px-4 py-3">
                <Link href="/admin" className="flex items-center gap-2 font-bold text-sky-600">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white">
                        TT
                    </div>
                    <span>Town Team</span>
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {adminNavItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Accounting</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {accountingNavItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={pathname.startsWith(item.url)}>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>System</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {settingsNavItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                                        <Link href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t p-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => console.log("Sign out")}>
                            <LogOut className="text-red-500" />
                            <span className="text-red-500">Log out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
