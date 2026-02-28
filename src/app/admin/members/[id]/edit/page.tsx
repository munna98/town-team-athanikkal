import { MemberForm } from "@/components/members/MemberForm"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function EditMemberPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const resolvedParams = await params
    const { id } = resolvedParams

    const member = await prisma.member.findUnique({
        where: { id }
    })

    if (!member) {
        notFound()
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Edit Member</h1>
                <p className="text-slate-500">Update personal details for {member.name}.</p>
            </div>

            <MemberForm initialData={member} memberId={member.id} />
        </div>
    )
}
