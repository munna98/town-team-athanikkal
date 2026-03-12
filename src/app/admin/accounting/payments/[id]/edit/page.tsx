import { getTransactionById } from "@/app/actions/accounting"
import { EditPaymentForm } from "@/components/accounting/EditPaymentForm"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function EditPaymentPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const [txnRaw, rawLedgers] = await Promise.all([
        getTransactionById(id).catch(() => null),
        prisma.ledger.findMany({ include: { group: true }, orderBy: { name: "asc" } }),
    ])

    if (!txnRaw || txnRaw.type !== "PAYMENT") notFound()

    const ledgers = JSON.parse(JSON.stringify(rawLedgers))

    // Credit line is the cash/bank ledger, debit line is the expense ledger
    const creditLine = txnRaw.lines.find((l: any) => Number(l.credit) > 0)
    const cashOrBank = creditLine
        ? (rawLedgers.find(le => le.id === creditLine.ledgerId)?.code === "1001" ? "CASH" : "BANK")
        : "CASH"

    const debitLine = txnRaw.lines.find((l: any) => Number(l.debit) > 0)

    const defaultValues = {
        date: new Date(txnRaw.date).toISOString().split("T")[0],
        amount: Number(txnRaw.totalAmount),
        cashOrBank: cashOrBank as "CASH" | "BANK",
        expenseLedgerId: debitLine?.ledgerId ?? "",
        narration: txnRaw.narration ?? "",
    }

    return (
        <div className="space-y-4 max-w-4xl mx-auto">
            <div>
                <p className="text-xs text-slate-400 font-mono">{txnRaw.referenceNo}</p>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit Payment</h1>
            </div>
            <EditPaymentForm
                transactionId={id}
                defaultValues={defaultValues}
                ledgers={ledgers}
            />
        </div>
    )
}
