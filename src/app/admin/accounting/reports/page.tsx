import { getTrialBalance, getLedgerStatement } from "@/lib/accounting"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default async function ReportsPage({
    searchParams,
}: {
    searchParams: Promise<{ ledger?: string }>
}) {
    const resolvedParams = await searchParams
    const selectedLedgerId = resolvedParams.ledger

    // 1. Fetch Trial Balance Data
    const tbRows = await getTrialBalance()

    const totalTbDebit = tbRows.reduce((sum, row) => sum + row.debit, 0)
    const totalTbCredit = tbRows.reduce((sum, row) => sum + row.credit, 0)

    // 2. Fetch specific Ledger Statement if requested
    let stmtData: Awaited<ReturnType<typeof getLedgerStatement>> | null = null
    if (selectedLedgerId) {
        try {
            stmtData = await getLedgerStatement(selectedLedgerId)
        } catch {
            stmtData = null
        }
    }

    // 3. Compute Income & Expenditure from TB
    const incomeRows = tbRows.filter(r => r.nature === "INCOME")
    const expenseRows = tbRows.filter(r => r.nature === "EXPENSE")

    const totalIncome = incomeRows.reduce((sum, r) => sum + r.credit, 0)
    const totalExpense = expenseRows.reduce((sum, r) => sum + r.debit, 0)
    const surplusDeficit = totalIncome - totalExpense

    // 4. Compute Balance Sheet from TB
    const assetRows = tbRows.filter(r => r.nature === "ASSET")
    const liabilityRows = tbRows.filter(r => r.nature === "LIABILITY")
    const equityRows = tbRows.filter(r => r.nature === "EQUITY")

    const totalAssets = assetRows.reduce((sum, r) => sum + r.debit - r.credit, 0)
    const totalLiabilities = liabilityRows.reduce((sum, r) => sum + r.credit - r.debit, 0)
    const totalEquity = equityRows.reduce((sum, r) => sum + r.credit - r.debit, 0)

    const bsTotalL = totalLiabilities + totalEquity + surplusDeficit
    const bsTotalA = totalAssets

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-12">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Financial Reports</h1>
                <p className="text-slate-500">View real-time financial statements and ledger books.</p>
            </div>

            <Tabs defaultValue={selectedLedgerId ? "statement" : "trial-balance"} className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-slate-100 p-1 mb-8">
                    <TabsTrigger value="trial-balance">Trial Balance</TabsTrigger>
                    <TabsTrigger value="statement">Ledger Statement</TabsTrigger>
                    <TabsTrigger value="income">Income & Exp</TabsTrigger>
                    <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
                </TabsList>

                {/* ─── Trial Balance ─── */}
                <TabsContent value="trial-balance">
                    <Card>
                        <CardHeader>
                            <CardTitle>Trial Balance (As of {formatDate(new Date())})</CardTitle>
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
                </TabsContent>

                {/* ─── Ledger Statement ─── */}
                <TabsContent value="statement">
                    <Card>
                        <CardHeader>
                            <CardTitle>
                                {stmtData ? `Statement: ${stmtData.ledger.name} (${stmtData.ledger.code})` : "Select a Ledger from Chart of Accounts"}
                            </CardTitle>
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
                                                        <TableCell colSpan={6} className="text-center py-6 text-slate-500">No transactions recorded.</TableCell>
                                                    </TableRow>
                                                )}
                                                {stmtData.statement.map((tx, idx) => (
                                                    <TableRow key={idx}>
                                                        <TableCell>{formatDate(tx.date)}</TableCell>
                                                        <TableCell className="font-mono text-xs text-sky-600">{tx.referenceNo}</TableCell>
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
                                    <p>Go to Chart of Accounts and click &ldquo;Stmt&rdquo; on any ledger to view its transactions here.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ─── Income & Expenditure ─── */}
                <TabsContent value="income">
                    <Card>
                        <CardHeader>
                            <CardTitle>Income & Expenditure</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="font-bold text-lg text-rose-700 bg-rose-50 px-4 py-2 rounded-md">Expenditure</h3>
                                    <div className="border rounded-md">
                                        <Table>
                                            <TableBody>
                                                {expenseRows.map(r => (
                                                    <TableRow key={r.ledgerId}>
                                                        <TableCell>{r.ledgerName}</TableCell>
                                                        <TableCell className="text-right font-medium">{formatCurrency(r.debit)}</TableCell>
                                                    </TableRow>
                                                ))}
                                                {surplusDeficit > 0 && (
                                                    <TableRow className="bg-emerald-50 text-emerald-700 font-bold">
                                                        <TableCell>Surplus (Income over Expenditure)</TableCell>
                                                        <TableCell className="text-right">{formatCurrency(surplusDeficit)}</TableCell>
                                                    </TableRow>
                                                )}
                                                <TableRow className="bg-slate-100 font-black">
                                                    <TableCell>Total</TableCell>
                                                    <TableCell className="text-right">
                                                        {formatCurrency(totalExpense + (surplusDeficit > 0 ? surplusDeficit : 0))}
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
                                                {incomeRows.map(r => (
                                                    <TableRow key={r.ledgerId}>
                                                        <TableCell>{r.ledgerName}</TableCell>
                                                        <TableCell className="text-right font-medium">{formatCurrency(r.credit)}</TableCell>
                                                    </TableRow>
                                                ))}
                                                {surplusDeficit < 0 && (
                                                    <TableRow className="bg-red-50 text-red-700 font-bold">
                                                        <TableCell>Deficit (Expenditure over Income)</TableCell>
                                                        <TableCell className="text-right">{formatCurrency(Math.abs(surplusDeficit))}</TableCell>
                                                    </TableRow>
                                                )}
                                                <TableRow className="bg-slate-100 font-black">
                                                    <TableCell>Total</TableCell>
                                                    <TableCell className="text-right">
                                                        {formatCurrency(totalIncome + (surplusDeficit < 0 ? Math.abs(surplusDeficit) : 0))}
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ─── Balance Sheet ─── */}
                <TabsContent value="balance-sheet">
                    <Card>
                        <CardHeader>
                            <CardTitle>Balance Sheet</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="font-bold text-lg text-orange-700 bg-orange-50 px-4 py-2 rounded-md">Liabilities & Equity</h3>
                                    <div className="border rounded-md">
                                        <Table>
                                            <TableBody>
                                                {equityRows.map(r => (
                                                    <TableRow key={r.ledgerId}>
                                                        <TableCell>{r.ledgerName}</TableCell>
                                                        <TableCell className="text-right font-medium">{formatCurrency(r.credit - r.debit)}</TableCell>
                                                    </TableRow>
                                                ))}
                                                {liabilityRows.map(r => (
                                                    <TableRow key={r.ledgerId}>
                                                        <TableCell>{r.ledgerName}</TableCell>
                                                        <TableCell className="text-right font-medium">{formatCurrency(r.credit - r.debit)}</TableCell>
                                                    </TableRow>
                                                ))}
                                                <TableRow className="bg-slate-50 text-slate-700 font-bold border-t-2">
                                                    <TableCell>Surplus / (Deficit)</TableCell>
                                                    <TableCell className="text-right">{formatCurrency(surplusDeficit)}</TableCell>
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
                                                {assetRows.map(r => (
                                                    <TableRow key={r.ledgerId}>
                                                        <TableCell>{r.ledgerName}</TableCell>
                                                        <TableCell className="text-right font-medium">{formatCurrency(r.debit - r.credit)}</TableCell>
                                                    </TableRow>
                                                ))}
                                                <TableRow className="bg-slate-100 font-black text-lg h-[92px]">
                                                    <TableCell className="align-bottom">Total</TableCell>
                                                    <TableCell className="text-right align-bottom">{formatCurrency(bsTotalA)}</TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
