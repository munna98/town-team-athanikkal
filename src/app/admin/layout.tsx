import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Header } from "@/components/layout/Header"
import { SessionProvider } from "next-auth/react"
import { Suspense } from "react"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SessionProvider>
            <SidebarProvider>
                <div className="flex min-h-screen w-full">
                    <Suspense fallback={<div className="w-64 bg-slate-50 border-r" />}>
                        <AppSidebar />
                    </Suspense>
                    <div className="flex w-full flex-col overflow-hidden">
                        <Header />
                        <main className="flex-1 overflow-auto bg-slate-50/50 p-4 md:p-6 lg:p-8">
                            {children}
                        </main>
                    </div>
                </div>
            </SidebarProvider>
        </SessionProvider>
    )
}
