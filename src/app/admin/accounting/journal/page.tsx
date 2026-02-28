import { JournalForm } from "@/components/accounting/JournalForm"
import prisma from "@/lib/prisma"

export default async function JournalPage() {
    const ledgers = await prisma.ledger.findMany({
        include: { group: true },
        orderBy: { name: "asc" }
    })

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Journal Entry</h1>
                <p className="text-slate-500">Record complex manual adjustments across multiple accounts simultaneously.</p>
            </div>

            <JournalForm ledgers={ledgers} />
        </div>
    )
}
