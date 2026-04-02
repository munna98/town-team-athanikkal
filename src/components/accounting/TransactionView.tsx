import { getTransactionById } from "@/app/actions/accounting"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface Props {
    id: string
    type: "RECEIPT" | "PAYMENT" | "CONTRA" | "JOURNAL"
    editBasePath: string
    basePath: string
}

export async function TransactionView({ id, type, editBasePath, basePath }: Props) {
    const txn = await getTransactionById(id).catch(() => null)
    if (!txn || txn.type !== type) notFound()

    function formatDate(d: string, withTime = false) {
        return new Date(d).toLocaleDateString("en-IN", {
            day: "2-digit", 
            month: "short", 
            year: "numeric",
            ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {})
        })
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={basePath}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <p className="text-xs text-slate-400 font-mono">{txn.referenceNo}</p>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            {type.charAt(0) + type.slice(1).toLowerCase()} Details
                        </h1>
                    </div>
                </div>
                <Link href={`${editBasePath}/${id}/edit`}>
                    <Button variant="outline" className="gap-2">
                        <Pencil className="h-4 w-4" />
                        Edit {type.charAt(0) + type.slice(1).toLowerCase()}
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-500">Transaction Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-xs text-slate-400 mb-1">Date</p>
                            <p className="text-sm font-medium">{formatDate(txn.date)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 mb-1">Total Amount</p>
                            <p className="text-lg font-bold text-slate-900">{formatCurrency(Number(txn.totalAmount))}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 mb-1">Narration</p>
                            <p className="text-sm text-slate-700">{txn.narration || <span className="italic text-slate-400">None</span>}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-500">Audit Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {type === "RECEIPT" && (
                            <div>
                                <p className="text-xs text-slate-400 mb-1">Collected By</p>
                                <p className="text-sm font-medium">{txn.collectedBy?.name || <span className="italic text-slate-400">None</span>}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-xs text-slate-400 mb-1">Created By</p>
                            <p className="text-sm font-medium">{txn.createdBy?.email}</p>
                            <p className="text-xs text-slate-400">{formatDate(txn.createdAt, true)}</p>
                        </div>
                        {txn.updatedBy && (
                            <div>
                                <p className="text-xs text-slate-400 mb-1">Last Updated By</p>
                                <p className="text-sm font-medium">{txn.updatedBy.email}</p>
                                <p className="text-xs text-slate-400">{formatDate(txn.updatedAt, true)}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Ledger Entries</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Ledger</th>
                                    <th className="px-4 py-3 font-medium text-right">Debit</th>
                                    <th className="px-4 py-3 font-medium text-right">Credit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {txn.lines.map((line: any) => (
                                    <tr key={line.id}>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-900">{line.ledger.name}</div>
                                            <div className="text-xs text-slate-500 font-mono mt-0.5">{line.ledger.code}</div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {Number(line.debit) > 0 ? (
                                                <span className="font-medium">{formatCurrency(Number(line.debit))}</span>
                                            ) : (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {Number(line.credit) > 0 ? (
                                                <span className="font-medium">{formatCurrency(Number(line.credit))}</span>
                                            ) : (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-slate-50 font-semibold text-slate-900 border-t">
                                <tr>
                                    <td className="px-4 py-3 text-right text-xs uppercase text-slate-500">Total</td>
                                    <td className="px-4 py-3 text-right font-bold w-32">
                                        {formatCurrency(txn.lines.reduce((acc: number, l: any) => acc + Number(l.debit), 0))}
                                    </td>
                                    <td className="px-4 py-3 text-right font-bold w-32">
                                        {formatCurrency(txn.lines.reduce((acc: number, l: any) => acc + Number(l.credit), 0))}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
