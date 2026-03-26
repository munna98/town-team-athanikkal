"use client"

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
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
    useSidebar,
} from "@/components/ui/sidebar"
import * as React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
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
    Landmark,
    KeyRound,
    Award
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
    { 
        title: "Reports", 
        url: "/admin/accounting/reports", 
        icon: PieChart,
        items: [
            { title: "Trial Balance", url: "/admin/accounting/reports?type=trial-balance" },
            { title: "Ledger Statement", url: "/admin/accounting/reports?type=ledger-statement" },
            { title: "Ledger Groups", url: "/admin/accounting/ledger-groups" },
            { title: "Income & Expenditure", url: "/admin/accounting/reports?type=income" },
            { title: "Balance Sheet", url: "/admin/accounting/reports?type=balance-sheet" },
        ]
    },
]

const settingsNavItems = [
    {
        title: "Settings",
        url: "/admin/settings",
        icon: Settings,
        items: [
            { title: "General", url: "/admin/settings" },
            { title: "User Access", url: "/admin/settings/users" },
            { title: "Membership Tiers", url: "/admin/systems/tiers" },
            { title: "Change Password", url: "/admin/settings/password" },
        ]
    }
]

export function AppSidebar() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const currentType = searchParams.get("type") || "trial-balance"
    const { data: session } = useSession()
    const currentUserRole = session?.user?.role
    const { setOpenMobile, isMobile } = useSidebar()
    const [reportsOpen, setReportsOpen] = useState(
        pathname.startsWith("/admin/accounting/reports") ||
        pathname.startsWith("/admin/accounting/ledger-groups")
    )
    const [settingsOpen, setSettingsOpen] = useState(pathname.startsWith("/admin/settings") || pathname.startsWith("/admin/systems"))

    const filteredSettingsNavItems = settingsNavItems.map(item => {
        if (item.items) {
            return {
                ...item,
                items: item.items.filter(subItem => {
                    if (subItem.title === "User Access" || subItem.title === "Membership Tiers") {
                        return currentUserRole === "SUPER_ADMIN"
                    }
                    return true
                })
            }
        }
        return item
    })

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
                                    <SidebarMenuButton 
                                        asChild 
                                        isActive={pathname === item.url}
                                        onClick={() => isMobile && setOpenMobile(false)}
                                    >
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
                                    {item.items ? (
                                        <>
                                            <SidebarMenuButton
                                                onClick={() => setReportsOpen(!reportsOpen)}
                                                isActive={
                                                    pathname.startsWith(item.url) ||
                                                    pathname.startsWith("/admin/accounting/ledger-groups")
                                                }
                                            >
                                                <item.icon />
                                                <span>{item.title}</span>
                                                <ChevronRight className={`ml-auto h-4 w-4 transition-transform duration-200 ${reportsOpen ? "rotate-90" : ""}`} />
                                            </SidebarMenuButton>
                                            {reportsOpen && (
                                                <SidebarMenuSub className="transition-all duration-200">
                                                    {item.items.map((subItem) => {
                                                        const subItemUrl = new URL(subItem.url, "http://localhost")
                                                        const subItemType = subItemUrl.searchParams.get("type")
                                                        const isActive = subItemType
                                                            ? pathname === subItemUrl.pathname && currentType === subItemType
                                                            : pathname.startsWith(subItemUrl.pathname)

                                                        return (
                                                            <SidebarMenuSubItem key={subItem.title}>
                                                                <SidebarMenuSubButton 
                                                                    asChild 
                                                                    isActive={isActive}
                                                                    onClick={() => isMobile && setOpenMobile(false)}
                                                                >
                                                                    <Link href={subItem.url}>
                                                                        <span>{subItem.title}</span>
                                                                    </Link>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        )
                                                    })}
                                                </SidebarMenuSub>
                                            )}
                                        </>
                                    ) : (
                                        <SidebarMenuButton 
                                            asChild 
                                            isActive={pathname.startsWith(item.url)}
                                            onClick={() => isMobile && setOpenMobile(false)}
                                        >
                                            <Link href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    )}
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>System</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {filteredSettingsNavItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    {item.items ? (
                                        <>
                                            <SidebarMenuButton
                                                onClick={() => setSettingsOpen(!settingsOpen)}
                                                isActive={pathname.startsWith(item.url) || pathname.startsWith("/admin/systems")}
                                            >
                                                <item.icon />
                                                <span>{item.title}</span>
                                                <ChevronRight className={`ml-auto h-4 w-4 transition-transform duration-200 ${settingsOpen ? "rotate-90" : ""}`} />
                                            </SidebarMenuButton>
                                            {settingsOpen && (
                                                <SidebarMenuSub className="transition-all duration-200">
                                                    {item.items.map((subItem) => (
                                                        <SidebarMenuSubItem key={subItem.title}>
                                                            <SidebarMenuSubButton 
                                                                asChild 
                                                                isActive={pathname === subItem.url}
                                                                onClick={() => isMobile && setOpenMobile(false)}
                                                            >
                                                                <Link href={subItem.url}>
                                                                    <span>{subItem.title}</span>
                                                                </Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            )}
                                        </>
                                    ) : (
                                        <SidebarMenuButton 
                                            asChild 
                                            isActive={pathname === item.url}
                                            onClick={() => isMobile && setOpenMobile(false)}
                                        >
                                            <Link href={item.url}>
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    )}
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t p-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => signOut({ callbackUrl: '/login' })}>
                            <LogOut className="text-red-500" />
                            <span className="text-red-500">Log out</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
