import { getTransactionById } from "@/app/actions/accounting"
import { EditJournalForm } from "@/components/accounting/EditJournalForm"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function EditJournalPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const [txnRaw, rawLedgers] = await Promise.all([
        getTransactionById(id).catch(() => null),
        prisma.ledger.findMany({ include: { group: true }, orderBy: { name: "asc" } }),
    ])

    if (!txnRaw || txnRaw.type !== "JOURNAL") notFound()

    const ledgers = JSON.parse(JSON.stringify(rawLedgers))

    const defaultValues = {
        date: new Date(txnRaw.date).toISOString().split("T")[0],
        narration: txnRaw.narration ?? "",
        lines: txnRaw.lines.map((l: any) => ({
            ledgerId: l.ledgerId,
            debit: Number(l.debit),
            credit: Number(l.credit),
            description: l.description ?? "",
        })),
    }

    return (
        <div className="space-y-4 max-w-4xl mx-auto">
            <div>
                <p className="text-xs text-slate-400 font-mono">{txnRaw.referenceNo}</p>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit Journal Entry</h1>
            </div>
            <EditJournalForm
                transactionId={id}
                defaultValues={defaultValues}
                ledgers={ledgers}
            />
        </div>
    )
}
