import { ContraForm } from "@/components/accounting/ContraForm"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export default async function ContraPage() {
    const rawLedgers = await prisma.ledger.findMany({
        include: { group: true },
        orderBy: { name: "asc" }
    })

    // Convert Decimal objects to plain numbers for client component serialization
    const ledgers = JSON.parse(JSON.stringify(rawLedgers))

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Contra Entry</h1>
                <p className="text-slate-500">Transfer funds between Cash and Bank accounts.</p>
            </div>

            <ContraForm ledgers={ledgers} />
        </div>
    )
}
