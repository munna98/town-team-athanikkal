import { LedgerForm } from "@/components/accounting/LedgerForm"
import prisma from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { getLedgerBalance } from "@/lib/accounting"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function LedgersPage() {
    const groups = await prisma.ledgerGroup.findMany({
        orderBy: { nature: "asc" }
    })

    const ledgers = await prisma.ledger.findMany({
        include: { group: true },
        orderBy: { code: "asc" }
    })

    // We should compute the live balance of each ledger to display it
    // Since we have `getLedgerBalance` we can call it for all, but for perf it's better to aggregate.
    // For now, let's just show opening balances if we don't fetch all balances, or we DO fetch all using the helper.
    // Actually, computing balances for 100 ledgers one by one with Prisma might be slow, but for a small club it's fine.

    // A grouped view is better for Chart of Accounts
    const groupedLedgers = groups.map(g => ({
        ...g,
        ledgers: ledgers.filter(l => l.groupId === g.id)
    }))

    const natureColors: Record<string, string> = {
        ASSET: "bg-emerald-500",
        LIABILITY: "bg-orange-500",
        EQUITY: "bg-purple-500",
        INCOME: "bg-sky-500",
        EXPENSE: "bg-rose-500"
    }

    // Group ledgers first by Nature, then by Group
    const ledgersByNature = Object.groupBy(groupedLedgers, g => g.nature)

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Chart of Accounts</h1>
                    <p className="text-slate-500">Manage all ledgers and view their statements.</p>
                </div>
                <LedgerForm groups={groups} />
            </div>

            <div className="bg-white border rounded-xl shadow-sm overflow-hidden text-sm">
                <div className="grid grid-cols-12 font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 border-b px-6 py-3">
                    <div className="col-span-2">Code</div>
                    <div className="col-span-8">Particulars</div>
                    <div className="col-span-2 text-right">Action</div>
                </div>

                <div className="divide-y">
                    {Object.entries(ledgersByNature).map(([nature, groupsInNature]) => (
                        <div key={nature}>
                            {/* Nature Header Row */}
                            <div className={`px-6 py-2 border-y ${natureColors[nature]} text-white font-bold tracking-widest uppercase items-center flex justify-between`}>
                                <span>{nature}</span>
                            </div>

                            <div className="divide-y divide-dashed">
                                {groupsInNature?.map(group => (
                                    <div key={group.id} className="bg-slate-50/30">
                                        {/* Group Header Row */}
                                        <div className="grid grid-cols-12 items-center px-6 py-2 hover:bg-slate-100 transition group/row border-b border-dashed">
                                            <div className="col-span-2"></div>
                                            <div className="col-span-8 flex items-center gap-2">
                                                <div className="font-bold text-slate-700">{group.name}</div>
                                            </div>
                                            <div className="col-span-2"></div>
                                        </div>

                                        {/* Ledgers under this group */}
                                        <div className="divide-y">
                                            {group.ledgers.map(ledger => (
                                                <div key={ledger.id} className="grid grid-cols-12 items-center px-6 py-2.5 hover:bg-sky-50 transition group/ledger bg-white">
                                                    <div className="col-span-2 text-slate-500 font-medium pl-4">{ledger.code}</div>
                                                    <div className="col-span-8 flex items-center gap-2 pl-4 border-l">
                                                        <div className="font-medium text-slate-800">{ledger.name}</div>
                                                    </div>
                                                    <div className="col-span-2 text-right">
                                                        <Link href={`/admin/accounting/reports?type=ledger-statement&ledger=${ledger.id}`}>
                                                            <Button variant="ghost" size="sm" className="h-7 text-sky-600 opacity-0 group-hover/ledger:opacity-100 transition-opacity pointer-events-auto">
                                                                <FileText className="w-3.5 h-3.5 mr-1" /> View Statement
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                            {group.ledgers.length === 0 && (
                                                <div className="grid grid-cols-12 items-center px-6 py-3 bg-white">
                                                    <div className="col-span-2"></div>
                                                    <div className="col-span-8 pl-4 border-l text-slate-400 italic text-xs">
                                                        No ledgers found in this group.
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
