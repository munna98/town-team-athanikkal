"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { useSession } from "next-auth/react"

export function Header() {
    const { data: session } = useSession()

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-6" />
            <div className="flex-1">
                <h1 className="font-semibold text-sm sm:text-base">
                    Town Team Athanikkal
                </h1>
            </div>
            <div className="flex items-center gap-2">
                <div className="text-sm text-muted-foreground mr-2 hidden sm:block">
                    {session?.user?.email}
                </div>
                <div className="h-8 w-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold text-xs uppercase">
                    {session?.user?.email?.charAt(0) || "U"}
                </div>
            </div>
        </header>
    )
}
