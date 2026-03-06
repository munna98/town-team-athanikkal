import { ReceiptForm } from "@/components/accounting/ReceiptForm"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export default async function ReceiptsPage() {
    const [rawLedgers, rawExecutives] = await Promise.all([
        prisma.ledger.findMany({
            include: { group: true },
            orderBy: { name: "asc" }
        }),
        prisma.member.findMany({
            where: { isExecutive: true },
            orderBy: { name: "asc" }
        }),
    ])

    // Convert Decimal/Date objects to plain numbers/strings for client component serialization
    const ledgers = JSON.parse(JSON.stringify(rawLedgers))
    const executives = JSON.parse(JSON.stringify(rawExecutives))

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Receipts</h1>
                <p className="text-slate-500">Record incoming payments.</p>
            </div>

            <ReceiptForm ledgers={ledgers} executives={executives} />

            {/* We could add a Recent Receipts table here later */}
        </div>
    )
}

