import prisma from "@/lib/prisma"
import { LedgerGroupReportFilters } from "@/components/accounting/LedgerGroupReportFilters"

export const dynamic = "force-dynamic"

export default async function LedgerGroupsPage() {
    const groups = await prisma.ledgerGroup.findMany({
        orderBy: [{ nature: "asc" }, { name: "asc" }],
    })

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                    Ledger Group Reports
                </h1>
                <p className="max-w-2xl text-sm text-slate-500">
                    Select a ledger group and date range to open the consolidated report.
                </p>
            </div>

            <LedgerGroupReportFilters groups={groups} />
        </div>
    )
}
