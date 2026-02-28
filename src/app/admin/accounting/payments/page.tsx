import { PaymentForm } from "@/components/accounting/PaymentForm"
import prisma from "@/lib/prisma"

export default async function PaymentsPage() {
    const ledgers = await prisma.ledger.findMany({
        include: { group: true },
        orderBy: { name: "asc" }
    })

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Payments</h1>
                <p className="text-slate-500">Record outgoing payments for expenses, vendor settlements, or member advances.</p>
            </div>

            <PaymentForm ledgers={ledgers} />
        </div>
    )
}
