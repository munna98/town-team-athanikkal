import { LedgerForm } from "@/components/accounting/LedgerForm"
import prisma from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { getLedgerBalance } from "@/lib/accounting"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"

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

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Chart of Accounts</h1>
                    <p className="text-slate-500">Manage all ledgers and view their statements.</p>
                </div>
                <LedgerForm groups={groups} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {groupedLedgers.filter(g => g.ledgers.length > 0).map(group => (
                    <div key={group.id} className="border rounded-xl bg-white shadow-sm overflow-hidden flex flex-col">
                        <div className="bg-slate-50 border-b px-4 py-3 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-slate-800">{group.name}</h3>
                                {group.isSystem && <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">System Group</span>}
                            </div>
                            <Badge className={`${natureColors[group.nature]} border-none text-white px-2 py-0.5`}>
                                {group.nature}
                            </Badge>
                        </div>

                        <div className="flex-1 p-0">
                            <div className="grid grid-cols-12 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50 px-4 py-2 border-b">
                                <div className="col-span-2">Code</div>
                                <div className="col-span-7">Name</div>
                                <div className="col-span-3 text-right">Action</div>
                            </div>

                            <div className="divide-y max-h-80 overflow-y-auto">
                                {group.ledgers.map(ledger => (
                                    <div key={ledger.id} className="grid grid-cols-12 items-center px-4 py-3 hover:bg-slate-50 transition group">
                                        <div className="col-span-2 text-sm text-slate-500 font-medium">{ledger.code}</div>
                                        <div className="col-span-7">
                                            <div className="text-sm font-semibold text-slate-800">{ledger.name}</div>
                                            {ledger.isSystem && <span className="text-[10px] text-slate-400 uppercase">System Ledger</span>}
                                        </div>
                                        <div className="col-span-3 text-right">
                                            <Link href={`/admin/accounting/reports?ledger=${ledger.id}`}>
                                                <Button variant="ghost" size="sm" className="h-8 text-sky-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <FileText className="w-4 h-4 mr-1" /> Stmt
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
