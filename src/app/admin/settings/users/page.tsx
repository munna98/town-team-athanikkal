import prisma from "@/lib/prisma"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserManagementClient } from "./UserManagementClient"

export default async function UserManagementPage() {
    // Get all executives
    const rawExecutives = await prisma.member.findMany({
        where: { isExecutive: true },
        include: { user: true },
        orderBy: { name: "asc" }
    })

    const executives = JSON.parse(JSON.stringify(rawExecutives))

    const usersWithAccess = executives.filter((e: any) => e.user !== null).length

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h1>
                <p className="text-slate-500">Manage login access for Executive Committee members.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="col-span-1 shadow-sm md:col-span-1 border-sky-100">
                    <CardHeader className="bg-sky-50 border-b border-sky-100 pb-4">
                        <CardTitle className="text-lg text-sky-900 flex items-center justify-between">
                            Access Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="flex justify-between items-center pb-4 border-b">
                            <span className="text-slate-500">Total Executives</span>
                            <span className="font-bold text-slate-800 text-xl">{executives.length}</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b">
                            <span className="text-slate-500">Active Accounts</span>
                            <span className="font-bold text-emerald-600 text-xl">{usersWithAccess}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">Pending Setup</span>
                            <span className="font-bold text-amber-600 text-xl">{executives.length - usersWithAccess}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-2 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Executive Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <UserManagementClient executives={executives} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
