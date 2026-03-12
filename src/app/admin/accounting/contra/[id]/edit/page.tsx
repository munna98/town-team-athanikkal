import { getTransactionById } from "@/app/actions/accounting"
import { EditContraForm } from "@/components/accounting/EditContraForm"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function EditContraPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const [txnRaw, rawLedgers] = await Promise.all([
        getTransactionById(id).catch(() => null),
        prisma.ledger.findMany({ include: { group: true }, orderBy: { name: "asc" } }),
    ])

    if (!txnRaw || txnRaw.type !== "CONTRA") notFound()

    const ledgers = JSON.parse(JSON.stringify(rawLedgers))

    // In contra: DR = toLedger, CR = fromLedger
    const debitLine = txnRaw.lines.find((l: any) => Number(l.debit) > 0)
    const creditLine = txnRaw.lines.find((l: any) => Number(l.credit) > 0)

    const defaultValues = {
        date: new Date(txnRaw.date).toISOString().split("T")[0],
        amount: Number(txnRaw.totalAmount),
        fromLedgerId: creditLine?.ledgerId ?? "",
        toLedgerId: debitLine?.ledgerId ?? "",
        narration: txnRaw.narration ?? "",
    }

    return (
        <div className="space-y-4 max-w-4xl mx-auto">
            <div>
                <p className="text-xs text-slate-400 font-mono">{txnRaw.referenceNo}</p>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit Contra Entry</h1>
            </div>
            <EditContraForm
                transactionId={id}
                defaultValues={defaultValues}
                ledgers={ledgers}
            />
        </div>
    )
}
