import { TransactionView } from "@/components/accounting/TransactionView"

export const dynamic = 'force-dynamic'

export default async function ViewJournalPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    return (
        <TransactionView
            id={id}
            type="JOURNAL"
            editBasePath="/admin/accounting/journal"
            basePath="/admin/accounting/journal"
        />
    )
}
