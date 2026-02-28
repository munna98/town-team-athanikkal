import { MemberForm } from "@/components/members/MemberForm"

export default function NewMemberPage() {
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Add Member</h1>
                <p className="text-slate-500">Register a new person into the club. Their party ledger will be auto-created.</p>
            </div>

            <MemberForm />
        </div>
    )
}
