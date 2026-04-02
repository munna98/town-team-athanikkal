import { TransactionView } from "@/components/accounting/TransactionView"

export const dynamic = 'force-dynamic'

export default async function ViewPaymentPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    return (
        <TransactionView
            id={id}
            type="PAYMENT"
            editBasePath="/admin/accounting/payments"
            basePath="/admin/accounting/payments"
        />
    )
}
