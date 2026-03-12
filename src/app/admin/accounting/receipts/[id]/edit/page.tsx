import { getTransactionById } from "@/app/actions/accounting"
import { EditReceiptForm } from "@/components/accounting/EditReceiptForm"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"

export const dynamic = 'force-dynamic'

export default async function EditReceiptPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params

    const [txnRaw, rawLedgers, rawExecutives] = await Promise.all([
        getTransactionById(id).catch(() => null),
        prisma.ledger.findMany({ include: { group: true }, orderBy: { name: "asc" } }),
        prisma.member.findMany({ where: { isExecutive: true }, orderBy: { name: "asc" } }),
    ])

    if (!txnRaw || txnRaw.type !== "RECEIPT") notFound()

    const ledgers = JSON.parse(JSON.stringify(rawLedgers))
    const executives = JSON.parse(JSON.stringify(rawExecutives))

    // Derive the cashOrBank from the debit line (1001 = CASH, 1002 = BANK)
    const cashCodes = ["1001", "1002"]
    const debitLine = txnRaw.lines.find((l: any) => Number(l.debit) > 0)
    const cashOrBank = debitLine
        ? (rawLedgers.find(le => le.id === debitLine.ledgerId)?.code === "1001" ? "CASH" : "BANK")
        : "CASH"

    // The credit line is the income ledger
    const creditLine = txnRaw.lines.find((l: any) => Number(l.credit) > 0)

    const defaultValues = {
        date: new Date(txnRaw.date).toISOString().split("T")[0],
        amount: Number(txnRaw.totalAmount),
        cashOrBank: cashOrBank as "CASH" | "BANK",
        incomeLedgerId: creditLine?.ledgerId ?? "",
        narration: txnRaw.narration ?? "",
        collectedById: txnRaw.collectedById ?? "",
    }

    return (
        <div className="space-y-4 max-w-4xl mx-auto">
            <div>
                <p className="text-xs text-slate-400 font-mono">{txnRaw.referenceNo}</p>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit Receipt</h1>
            </div>
            <EditReceiptForm
                transactionId={id}
                defaultValues={defaultValues}
                ledgers={ledgers}
                executives={executives}
            />
        </div>
    )
}
