import { TransactionView } from "@/components/accounting/TransactionView"

export const dynamic = 'force-dynamic'

export default async function ViewContraPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    return (
        <TransactionView
            id={id}
            type="CONTRA"
            editBasePath="/admin/accounting/contra"
            basePath="/admin/accounting/contra"
        />
    )
}
