import prisma from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CreditCard, Landmark, TrendingUp, TrendingDown, Award, UserCheck } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export const dynamic = 'force-dynamic'

async function getDashboardStats() {
    const [
        totalMembers,
        pendingMembers,
        basicMembers,
        silverMembers,
        goldMembers,
        platinumMembers,
        cashLedger,
        bankLedger,
        recentTransactions
    ] = await Promise.all([
        prisma.member.count({ where: { isActive: true } }),
        prisma.member.count({ where: { tier: { name: "PENDING" }, isActive: true } }),
        prisma.member.count({ where: { tier: { name: "BASIC" }, isActive: true } }),
        prisma.member.count({ where: { tier: { name: "SILVER" }, isActive: true } }),
        prisma.member.count({ where: { tier: { name: "GOLD" }, isActive: true } }),
        prisma.member.count({ where: { tier: { name: "PLATINUM" }, isActive: true } }),
        prisma.ledger.findUnique({ where: { code: "1001" } }),
        prisma.ledger.findUnique({ where: { code: "1002" } }),
        prisma.transaction.findMany({
            orderBy: { date: "desc" },
            take: 8,
        })
    ])

    // Compute balances
    const cashLines = cashLedger ? await prisma.transactionLine.aggregate({
        where: { ledgerId: cashLedger.id },
        _sum: { debit: true, credit: true }
    }) : null

    const bankLines = bankLedger ? await prisma.transactionLine.aggregate({
        where: { ledgerId: bankLedger.id },
        _sum: { debit: true, credit: true }
    }) : null

    const cashBalance = cashLines
        ? Number(cashLines._sum.debit || 0) - Number(cashLines._sum.credit || 0) + Number(cashLedger?.openingBalance || 0)
        : 0
    const bankBalance = bankLines
        ? Number(bankLines._sum.debit || 0) - Number(bankLines._sum.credit || 0) + Number(bankLedger?.openingBalance || 0)
        : 0

    // Month income/expense
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const monthIncome = await prisma.transactionLine.aggregate({
        where: {
            ledger: { group: { nature: "INCOME" } },
            transaction: { date: { gte: startOfMonth } }
        },
        _sum: { credit: true }
    })

    const monthExpense = await prisma.transactionLine.aggregate({
        where: {
            ledger: { group: { nature: "EXPENSE" } },
            transaction: { date: { gte: startOfMonth } }
        },
        _sum: { debit: true }
    })

    return {
        totalMembers,
        pendingMembers,
        basicMembers,
        silverMembers,
        goldMembers,
        platinumMembers,
        cashBalance,
        bankBalance,
        monthIncome: Number(monthIncome._sum.credit || 0),
        monthExpense: Number(monthExpense._sum.debit || 0),
        recentTransactions
    }
}

export default async function AdminDashboard() {
    const stats = await getDashboardStats()

    const cards = [
        { title: "Total Members", value: stats.totalMembers.toString(), icon: Users, color: "text-slate-600", bg: "bg-slate-50", href: "/admin/members" },
        { title: "Pending", value: stats.pendingMembers.toString(), icon: UserCheck, color: "text-amber-600", bg: "bg-amber-50", href: "/admin/members?status=PENDING" },
        { title: "Basic", value: stats.basicMembers.toString(), icon: UserCheck, color: "text-blue-600", bg: "bg-blue-50", href: "/admin/members?status=BASIC" },
        { title: "Silver", value: stats.silverMembers.toString(), icon: Award, color: "text-slate-400", bg: "bg-slate-50", href: "/admin/members?status=SILVER" },
        { title: "Gold", value: stats.goldMembers.toString(), icon: Award, color: "text-amber-500", bg: "bg-amber-50", href: "/admin/members?status=GOLD" },
        { title: "Platinum", value: stats.platinumMembers.toString(), icon: Award, color: "text-indigo-600", bg: "bg-indigo-50", href: "/admin/members?status=PLATINUM" },
        { title: "Cash Balance", value: formatCurrency(stats.cashBalance), icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-50" },
        { title: "Bank Balance", value: formatCurrency(stats.bankBalance), icon: Landmark, color: "text-violet-600", bg: "bg-violet-50" },
        { title: "Month Income", value: formatCurrency(stats.monthIncome), icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
        { title: "Month Expense", value: formatCurrency(stats.monthExpense), icon: TrendingDown, color: "text-rose-600", bg: "bg-rose-50" },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
                <p className="text-slate-500">Overview of Town Team Athanikkal operations.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-5 gap-4">
                {cards.map((card) => {
                    const Content = (
                        <Card key={card.title} className={`shadow-sm hover:shadow-md transition-shadow ${card.href ? 'cursor-pointer hover:border-sky-500/50 hover:bg-slate-50/50' : ''}`}>
                            <CardContent className="p-2 flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center shrink-0`}>
                                    <card.icon className={`h-4 w-4 ${card.color}`} />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-lg font-bold text-slate-800 leading-tight truncate">{card.value}</div>
                                    <div className="text-[9px] font-medium text-slate-500 uppercase tracking-tighter truncate">{card.title}</div>
                                </div>
                            </CardContent>
                        </Card>
                    )

                    if (card.href) {
                        return (
                            <Link key={card.title} href={card.href}>
                                {Content}
                            </Link>
                        )
                    }

                    return Content
                })}
            </div>

            {/* Quick Actions + Recent Transactions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Link href="/admin/members/new" className="block">
                            <Button variant="outline" className="w-full justify-start text-left">
                                <Users className="mr-2 h-4 w-4 text-sky-500" /> Add New Member
                            </Button>
                        </Link>
                        <Link href="/admin/accounting/receipts" className="block">
                            <Button variant="outline" className="w-full justify-start text-left">
                                <TrendingUp className="mr-2 h-4 w-4 text-emerald-500" /> Record Receipt
                            </Button>
                        </Link>
                        <Link href="/admin/accounting/payments" className="block">
                            <Button variant="outline" className="w-full justify-start text-left">
                                <TrendingDown className="mr-2 h-4 w-4 text-rose-500" /> Record Payment
                            </Button>
                        </Link>
                        <Link href="/admin/accounting/reports" className="block">
                            <Button variant="outline" className="w-full justify-start text-left">
                                <Landmark className="mr-2 h-4 w-4 text-violet-500" /> View Reports
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Recent Transactions */}
                <Card className="md:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Recent Transactions</CardTitle>
                        <Link href="/admin/accounting/reports">
                            <Button variant="ghost" size="sm" className="text-sky-600">View All</Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {stats.recentTransactions.length === 0 ? (
                            <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                                No transactions yet. Start by recording a receipt.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {stats.recentTransactions.map((txn) => (
                                    <div key={txn.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold
                        ${txn.type === "RECEIPT" ? "bg-emerald-100 text-emerald-600" :
                                                    txn.type === "PAYMENT" ? "bg-rose-100 text-rose-600" :
                                                        txn.type === "CONTRA" ? "bg-violet-100 text-violet-600" :
                                                            "bg-sky-100 text-sky-600"}`}>
                                                {txn.type.slice(0, 3)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-slate-800">{txn.referenceNo}</div>
                                                <div className="text-xs text-slate-500">
                                                    {txn.narration}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-slate-800">{formatCurrency(Number(txn.totalAmount))}</div>
                                            <div className="text-[10px] text-slate-400">
                                                {new Date(txn.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
