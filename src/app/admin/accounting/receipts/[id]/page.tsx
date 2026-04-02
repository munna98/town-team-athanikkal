import { TransactionView } from "@/components/accounting/TransactionView"

export const dynamic = 'force-dynamic'

export default async function ViewReceiptPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    return (
        <TransactionView
            id={id}
            type="RECEIPT"
            editBasePath="/admin/accounting/receipts"
            basePath="/admin/accounting/receipts"
        />
    )
}
