import { MemberTable } from "@/components/members/MemberTable"

export default function MembersPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Members</h1>
                <p className="text-slate-500">Manage club members, track status, and view details.</p>
            </div>

            <MemberTable />
        </div>
    )
}
