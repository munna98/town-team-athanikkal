import { Suspense } from "react"
import { MemberTable } from "@/components/members/MemberTable"
import { Loader2 } from "lucide-react"

export default function MembersPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Members</h1>
                <p className="text-slate-500">Manage club members, track status, and view details.</p>
            </div>

            <Suspense fallback={
                <div className="h-96 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                </div>
            }>
                <MemberTable />
            </Suspense>
        </div>
    )
}
