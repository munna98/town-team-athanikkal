import { ReceiptForm } from "@/components/accounting/ReceiptForm"
import prisma from "@/lib/prisma"

export default async function ReceiptsPage() {
    const [ledgers, users, members] = await Promise.all([
        prisma.ledger.findMany({
            include: { group: true },
            orderBy: { name: "asc" }
        }),
        prisma.user.findMany({
            orderBy: { email: "asc" }
        }),
        prisma.member.findMany({
            orderBy: { membershipCode: "asc" },
            select: { id: true, membershipCode: true, name: true }
        })
    ])

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Receipts</h1>
                <p className="text-slate-500">Record incoming payments to the club.</p>
            </div>

            <ReceiptForm ledgers={ledgers} users={users} members={members} />

            {/* We could add a Recent Receipts table here later */}
        </div>
    )
}
