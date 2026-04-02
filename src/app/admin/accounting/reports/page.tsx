import { getTrialBalance, getLedgerStatement, getIncomeExpenditure, getBalanceSheet } from "@/lib/accounting"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ReportFilters } from "@/components/accounting/ReportFilters"
import { ExportExcelButton } from "@/components/ui/ExportExcelButton"
import prisma from "@/lib/prisma"
import { Suspense } from "react"
import Link from "next/link"

const getBasePath = (type: string) => {
    switch (type) {
        case "RECEIPT": return "/admin/accounting/receipts";
        case "PAYMENT": return "/admin/accounting/payments";
        case "CONTRA": return "/admin/accounting/contra";
        case "JOURNAL": return "/admin/accounting/journal";
        default: return "";
    }
}

export const dynamic = 'force-dynamic'

export default async function ReportsPage({
    searchParams,
}: {
    searchParams: Promise<{ type?: string; from?: string; to?: string; ledger?: string }>
}) {
    const resolvedParams = await searchParams
    const type = resolvedParams.type || "trial-balance"
    const from = resolvedParams.from ? new Date(resolvedParams.from) : undefined
    const to = resolvedParams.to ? new Date(resolvedParams.to) : undefined
    const selectedLedgerId = resolvedParams.ledger

    // Fetch all ledgers for the filter dropdown
    const ledgers = await prisma.ledger.findMany({
        select: { id: true, name: true, code: true },
        orderBy: { code: "asc" }
    })

    let reportTitle = "Report"
    let content = null
    let exportButton = null

    if (type === "trial-balance") {
        reportTitle = "Trial Balance"
        const tbRows = await getTrialBalance(from, to)
        const totalTbDebit = tbRows.reduce((sum, row) => sum + row.debit, 0)
        const totalTbCredit = tbRows.reduce((sum, row) => sum + row.credit, 0)

        content = (
            <Card>
                <CardHeader>
                    <CardTitle>Trial Balance {from && to ? `(${formatDate(from)} to ${formatDate(to)})` : `(As of ${formatDate(new Date())})`}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-md overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Ledger Name</TableHead>
                                    <TableHead>Nature</TableHead>
                                    <TableHead className="text-right text-emerald-700 font-bold">Debit</TableHead>
                                    <TableHead className="text-right text-red-700 font-bold">Credit</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tbRows.filter(r => r.debit !== 0 || r.credit !== 0).map((row) => (
                                    <TableRow key={row.ledgerId}>
                                        <TableCell className="text-slate-500">{row.ledgerCode}</TableCell>
                                        <TableCell className="font-medium text-slate-800">{row.ledgerName}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-[10px] text-slate-500">{row.nature}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {row.debit > 0 ? formatCurrency(row.debit) : "-"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {row.credit > 0 ? formatCurrency(row.credit) : "-"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                <TableRow className="bg-slate-100 font-bold">
                                    <TableCell colSpan={3} className="text-right">Totals</TableCell>
                                    <TableCell className="text-right text-emerald-800">{formatCurrency(totalTbDebit)}</TableCell>
                                    <TableCell className="text-right text-red-800">{formatCurrency(totalTbCredit)}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        )

        const exportData: Record<string, any>[] = tbRows.filter(r => r.debit !== 0 || r.credit !== 0).map(row => ({
            "Code": row.ledgerCode,
            "Ledger Name": row.ledgerName,
            "Nature": row.nature,
            "Debit": row.debit > 0 ? row.debit : "",
            "Credit": row.credit > 0 ? row.credit : "",
        }))
        exportData.push({ "Code": "", "Ledger Name": "TOTALS", "Nature": "", "Debit": totalTbDebit, "Credit": totalTbCredit })
        exportButton = <ExportExcelButton data={exportData} filename="Trial_Balance" sheetName="Trial Balance" />
    } else if (type === "ledger-statement") {
        reportTitle = "Ledger Statement"
        let stmtData = null
        if (selectedLedgerId) {
            try {
                stmtData = await getLedgerStatement(selectedLedgerId, from, to)
            } catch {
                stmtData = null
            }
        }

        content = (
            <Card>
                <CardHeader>
                    <CardTitle>
                        {stmtData ? (
                            `Statement: ${stmtData.ledger.name}${stmtData.ledger.name.includes(`(${stmtData.ledger.code})`) ? "" : ` (${stmtData.ledger.code})`}`
                        ) : "Please select a ledger"}
                    </CardTitle>
                    {from && to && stmtData && (
                        <p className="text-sm text-slate-500">Period: {formatDate(from)} to {formatDate(to)}</p>
                    )}
                </CardHeader>
                <CardContent>
                    {stmtData ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-slate-50 rounded-lg border">
                                    <div className="text-sm text-slate-500">Opening Balance</div>
                                    <div className="text-xl font-bold">
                                        {formatCurrency(stmtData.openingBalance)} {stmtData.openingType}
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg border">
                                    <div className="text-sm text-slate-500">Total Debits</div>
                                    <div className="text-xl font-bold text-emerald-600">
                                        {formatCurrency(stmtData.statement.reduce((s, l) => s + l.debit, 0))}
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg border">
                                    <div className="text-sm text-slate-500">Total Credits</div>
                                    <div className="text-xl font-bold text-red-600">
                                        {formatCurrency(stmtData.statement.reduce((s, l) => s + l.credit, 0))}
                                    </div>
                                </div>
                                <div className="p-4 bg-sky-50 rounded-lg border border-sky-200">
                                    <div className="text-sm text-sky-700 font-semibold">Closing Balance</div>
                                    <div className="text-2xl font-black text-sky-900">
                                        {formatCurrency(Math.abs(stmtData.closingBalance))} {stmtData.closingBalance >= 0 ? "Dr" : "Cr"}
                                    </div>
                                </div>
                            </div>

                            <div className="border rounded-md overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Voucher</TableHead>
                                            <TableHead>Narration</TableHead>
                                            <TableHead className="text-right text-emerald-700">Debit</TableHead>
                                            <TableHead className="text-right text-red-700">Credit</TableHead>
                                            <TableHead className="text-right">Balance</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {stmtData.statement.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-6 text-slate-500">No transactions recorded in this period.</TableCell>
                                            </TableRow>
                                        )}
                                        {stmtData.statement.map((tx, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>{formatDate(tx.date)}</TableCell>
                                                <TableCell className="font-mono text-xs">
                                                    <Link 
                                                        href={`${getBasePath(tx.type)}/${tx.id}`}
                                                        className="text-sky-600 hover:text-sky-800 hover:underline inline-flex items-center gap-1"
                                                        title="View Details"
                                                    >
                                                        {tx.referenceNo}
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="text-sm">{tx.narration}</TableCell>
                                                <TableCell className="text-right">{tx.debit > 0 ? formatCurrency(tx.debit) : ""}</TableCell>
                                                <TableCell className="text-right">{tx.credit > 0 ? formatCurrency(tx.credit) : ""}</TableCell>
                                                <TableCell className="text-right font-medium text-slate-600">
                                                    {formatCurrency(Math.abs(tx.balance))} {tx.balance >= 0 ? "Dr" : "Cr"}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-500 border rounded-lg bg-slate-50">
                            <p>Select a ledger from the dropdown above to view its statement.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        )

        if (stmtData) {
            const exportData = stmtData.statement.map((tx: any) => ({
                "Date": formatDate(tx.date),
                "Voucher": tx.referenceNo,
                "Narration": tx.narration,
                "Debit": tx.debit > 0 ? tx.debit : "",
                "Credit": tx.credit > 0 ? tx.credit : "",
                "Balance": `${Math.abs(tx.balance).toFixed(2)} ${tx.balance >= 0 ? "Dr" : "Cr"}`,
            }))
            exportButton = <ExportExcelButton data={exportData} filename={`Ledger_Statement_${stmtData.ledger.code}`} sheetName="Statement" />
        }
    } else if (type === "income") {
        reportTitle = "Income & Expenditure"
        const { income, expense, totalIncome, totalExpense, surplus } = await getIncomeExpenditure(from, to)

        content = (
            <Card>
                <CardHeader>
                    <CardTitle>Income & Expenditure {from && to ? `(${formatDate(from)} to ${formatDate(to)})` : ""}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg text-rose-700 bg-rose-50 px-4 py-2 rounded-md">Expenditure</h3>
                            <div className="border rounded-md">
                                <Table>
                                    <TableBody>
                                        {expense.map(r => (
                                            <TableRow key={r.ledgerId}>
                                                <TableCell>{r.ledgerName}</TableCell>
                                                <TableCell className="text-right font-medium">{formatCurrency(r.debit - r.credit)}</TableCell>
                                            </TableRow>
                                        ))}
                                        {surplus > 0 && (
                                            <TableRow className="bg-emerald-50 text-emerald-700 font-bold">
                                                <TableCell>Surplus (Income over Expenditure)</TableCell>
                                                <TableCell className="text-right">{formatCurrency(surplus)}</TableCell>
                                            </TableRow>
                                        )}
                                        <TableRow className="bg-slate-100 font-black">
                                            <TableCell>Total</TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(totalExpense + (surplus > 0 ? surplus : 0))}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold text-lg text-sky-700 bg-sky-50 px-4 py-2 rounded-md">Income</h3>
                            <div className="border rounded-md">
                                <Table>
                                    <TableBody>
                                        {income.map(r => (
                                            <TableRow key={r.ledgerId}>
                                                <TableCell>{r.ledgerName}</TableCell>
                                                <TableCell className="text-right font-medium">{formatCurrency(r.credit - r.debit)}</TableCell>
                                            </TableRow>
                                        ))}
                                        {surplus < 0 && (
                                            <TableRow className="bg-red-50 text-red-700 font-bold">
                                                <TableCell>Deficit (Expenditure over Income)</TableCell>
                                                <TableCell className="text-right">{formatCurrency(Math.abs(surplus))}</TableCell>
                                            </TableRow>
                                        )}
                                        <TableRow className="bg-slate-100 font-black">
                                            <TableCell>Total</TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(totalIncome + (surplus < 0 ? Math.abs(surplus) : 0))}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )

        const expenseData = expense.map(r => ({ "Ledger": r.ledgerName, "Amount": r.debit - r.credit }))
        if (surplus > 0) expenseData.push({ "Ledger": "Surplus (Income over Expenditure)", "Amount": surplus })
        expenseData.push({ "Ledger": "TOTAL", "Amount": totalExpense + (surplus > 0 ? surplus : 0) })

        const incomeData = income.map(r => ({ "Ledger": r.ledgerName, "Amount": r.credit - r.debit }))
        if (surplus < 0) incomeData.push({ "Ledger": "Deficit (Expenditure over Income)", "Amount": Math.abs(surplus) })
        incomeData.push({ "Ledger": "TOTAL", "Amount": totalIncome + (surplus < 0 ? Math.abs(surplus) : 0) })

        exportButton = <ExportExcelButton sheets={[{ name: "Expenditure", data: expenseData }, { name: "Income", data: incomeData }]} filename="Income_Expenditure" />
    } else if (type === "balance-sheet") {
        reportTitle = "Balance Sheet"
        const { assets, liabilities, equity, totalAssets, totalLiabilities, totalEquity } = await getBalanceSheet(to)
        
        // Income & Exp Surplus for the Balance Sheet
        const { surplus } = await getIncomeExpenditure(undefined, to)
        const bsTotalL = totalLiabilities + totalEquity + surplus

        content = (
            <Card>
                <CardHeader>
                    <CardTitle>Balance Sheet {to ? `(As of ${formatDate(to)})` : `(As of ${formatDate(new Date())})`}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg text-orange-700 bg-orange-50 px-4 py-2 rounded-md">Liabilities & Equity</h3>
                            <div className="border rounded-md">
                                <Table>
                                    <TableBody>
                                        {equity.map(r => (
                                            <TableRow key={r.ledgerId}>
                                                <TableCell>{r.ledgerName}</TableCell>
                                                <TableCell className="text-right font-medium">{formatCurrency(r.credit - r.debit)}</TableCell>
                                            </TableRow>
                                        ))}
                                        {liabilities.map(r => (
                                            <TableRow key={r.ledgerId}>
                                                <TableCell>{r.ledgerName}</TableCell>
                                                <TableCell className="text-right font-medium">{formatCurrency(r.credit - r.debit)}</TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow className="bg-slate-50 text-slate-700 font-bold border-t-2">
                                            <TableCell>Surplus / (Deficit)</TableCell>
                                            <TableCell className="text-right">{formatCurrency(surplus)}</TableCell>
                                        </TableRow>
                                        <TableRow className="bg-slate-100 font-black text-lg">
                                            <TableCell>Total</TableCell>
                                            <TableCell className="text-right">{formatCurrency(bsTotalL)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold text-lg text-emerald-700 bg-emerald-50 px-4 py-2 rounded-md">Assets</h3>
                            <div className="border rounded-md">
                                <Table>
                                    <TableBody>
                                        {assets.map(r => (
                                            <TableRow key={r.ledgerId}>
                                                <TableCell>{r.ledgerName}</TableCell>
                                                <TableCell className="text-right font-medium">{formatCurrency(r.debit - r.credit)}</TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow className="bg-slate-100 font-black text-lg h-[92px]">
                                            <TableCell className="align-bottom">Total</TableCell>
                                            <TableCell className="text-right align-bottom">{formatCurrency(totalAssets)}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )

        const liabData = [
            ...equity.map(r => ({ "Ledger": r.ledgerName, "Amount": r.credit - r.debit })),
            ...liabilities.map(r => ({ "Ledger": r.ledgerName, "Amount": r.credit - r.debit })),
            { "Ledger": "Surplus / (Deficit)", "Amount": surplus },
            { "Ledger": "TOTAL", "Amount": bsTotalL },
        ]
        const assetData = [
            ...assets.map(r => ({ "Ledger": r.ledgerName, "Amount": r.debit - r.credit })),
            { "Ledger": "TOTAL", "Amount": totalAssets },
        ]
        exportButton = <ExportExcelButton sheets={[{ name: "Liabilities & Equity", data: liabData }, { name: "Assets", data: assetData }]} filename="Balance_Sheet" />
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">{reportTitle}</h1>
                    <p className="text-slate-500">Real-time financial statement reporting.</p>
                </div>
                {exportButton}
            </div>

            <Suspense fallback={<Card className="h-20 animate-pulse bg-slate-50" />}>
                <ReportFilters ledgers={ledgers} />
            </Suspense>

            <div className="mt-8">
                {content}
            </div>
        </div>
    )
}
