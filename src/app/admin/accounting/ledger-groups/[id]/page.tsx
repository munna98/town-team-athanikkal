import Link from "next/link"
import { notFound } from "next/navigation"
import { getLedgerGroupReport } from "@/lib/accounting"
import { formatCurrency, formatDate } from "@/lib/utils"
import prisma from "@/lib/prisma"
import { LedgerGroupReportFilters } from "@/components/accounting/LedgerGroupReportFilters"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { ArrowLeft, FileText } from "lucide-react"

export const dynamic = "force-dynamic"

const natureStyles: Record<string, string> = {
    ASSET: "bg-emerald-50 text-emerald-700 border-emerald-200",
    LIABILITY: "bg-orange-50 text-orange-700 border-orange-200",
    EQUITY: "bg-violet-50 text-violet-700 border-violet-200",
    INCOME: "bg-sky-50 text-sky-700 border-sky-200",
    EXPENSE: "bg-rose-50 text-rose-700 border-rose-200",
}

function formatSignedBalance(amount: number) {
    return `${formatCurrency(Math.abs(amount))} ${amount >= 0 ? "Dr" : "Cr"}`
}

export default async function LedgerGroupReportPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>
    searchParams: Promise<{ from?: string; to?: string }>
}) {
    const { id } = await params
    const resolvedSearchParams = await searchParams
    const from = resolvedSearchParams.from ? new Date(resolvedSearchParams.from) : undefined
    const to = resolvedSearchParams.to ? new Date(resolvedSearchParams.to) : undefined
    const groups = await prisma.ledgerGroup.findMany({
        select: {
            id: true,
            name: true,
            nature: true,
        },
        orderBy: [{ nature: "asc" }, { name: "asc" }],
    })

    let report
    try {
        report = await getLedgerGroupReport(id, from, to)
    } catch {
        notFound()
    }

    return (
        <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-3">
                    <Link
                        href="/admin/accounting/ledger-groups"
                        className="inline-flex items-center gap-2 text-sm font-medium text-sky-700 hover:text-sky-800"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to ledger group reports
                    </Link>
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                {report.group.name}
                            </h1>
                            <Badge variant="outline" className={natureStyles[report.group.nature]}>
                                {report.group.nature}
                            </Badge>
                        </div>
                        <p className="max-w-3xl text-sm text-slate-500">
                            {report.group.description || "Consolidated balances and transactions for all ledgers in this group."}
                        </p>
                        {from && to && (
                            <p className="text-sm text-slate-500">
                                Period: {formatDate(from)} to {formatDate(to)}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <LedgerGroupReportFilters
                groups={groups}
                currentGroupId={report.group.id}
                currentFrom={resolvedSearchParams.from}
                currentTo={resolvedSearchParams.to}
            />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-500">Opening Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">
                            {formatCurrency(report.summary.openingBalance)} {report.summary.openingType}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-500">Total Debits</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">
                            {formatCurrency(report.summary.totalDebit)}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-500">Total Credits</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {formatCurrency(report.summary.totalCredit)}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-500">Closing Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-sky-700">
                            {formatCurrency(report.summary.closingBalance)} {report.summary.closingType}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-slate-500">Active Ledgers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">
                            {report.summary.activeLedgerCount}/{report.summary.ledgerCount}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="overflow-hidden border-slate-200 shadow-sm">
                <CardHeader className="border-b bg-slate-50/80">
                    <CardTitle className="text-lg text-slate-900">Ledgers in Group</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Ledger</TableHead>
                                <TableHead className="text-right">Opening</TableHead>
                                <TableHead className="text-right text-emerald-700">Debit</TableHead>
                                <TableHead className="text-right text-red-700">Credit</TableHead>
                                <TableHead className="text-right">Closing</TableHead>
                                <TableHead className="text-right">Transactions</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {report.ledgers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-10 text-center text-slate-500">
                                        No ledgers found in this group.
                                    </TableCell>
                                </TableRow>
                            )}
                            {report.ledgers.map((ledger) => {
                                const statementParams = new URLSearchParams()
                                statementParams.set("type", "ledger-statement")
                                statementParams.set("ledger", ledger.id)
                                if (resolvedSearchParams.from) statementParams.set("from", resolvedSearchParams.from)
                                if (resolvedSearchParams.to) statementParams.set("to", resolvedSearchParams.to)

                                return (
                                    <TableRow key={ledger.id}>
                                        <TableCell className="text-slate-500">{ledger.code}</TableCell>
                                        <TableCell className="font-medium text-slate-900">{ledger.name}</TableCell>
                                        <TableCell className="text-right font-medium text-slate-600">
                                            {formatCurrency(ledger.openingBalance)} {ledger.openingType}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {ledger.totalDebit > 0 ? formatCurrency(ledger.totalDebit) : "-"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {ledger.totalCredit > 0 ? formatCurrency(ledger.totalCredit) : "-"}
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-slate-700">
                                            {formatSignedBalance(ledger.closingBalance)}
                                        </TableCell>
                                        <TableCell className="text-right text-slate-500">
                                            {ledger.transactionCount}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild variant="ghost" size="sm" className="text-sky-700 hover:text-sky-800">
                                                <Link href={`/admin/accounting/reports?${statementParams.toString()}`}>
                                                    <FileText className="mr-1 h-4 w-4" />
                                                    View Statement
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                            <TableRow className="bg-slate-100 font-bold">
                                <TableCell colSpan={2} className="text-right">Totals</TableCell>
                                <TableCell className="text-right">
                                    {formatCurrency(report.summary.openingBalance)} {report.summary.openingType}
                                </TableCell>
                                <TableCell className="text-right text-emerald-800">
                                    {formatCurrency(report.summary.totalDebit)}
                                </TableCell>
                                <TableCell className="text-right text-red-800">
                                    {formatCurrency(report.summary.totalCredit)}
                                </TableCell>
                                <TableCell className="text-right">
                                    {formatCurrency(report.summary.closingBalance)} {report.summary.closingType}
                                </TableCell>
                                <TableCell className="text-right">
                                    {report.ledgers.reduce((sum, ledger) => sum + ledger.transactionCount, 0)}
                                </TableCell>
                                <TableCell />
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
