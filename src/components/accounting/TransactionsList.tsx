"use client"

import React, { useState, useEffect, useCallback } from "react"
import { getTransactions, deleteTransaction, getAllTransactionsForExport } from "@/app/actions/accounting"
import { formatCurrency } from "@/lib/utils"
import { exportToExcel } from "@/lib/excel-export"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Search, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, User, Clock, History, LayoutPanelLeft, FilterX, Download } from "lucide-react"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import Link from "next/link"
import { toast } from "sonner"
import { TransactionActions } from "./TransactionActions"

type TxType = "RECEIPT" | "PAYMENT" | "CONTRA" | "JOURNAL"

interface Props {
    type: TxType
    editBasePath: string  // e.g. "/admin/accounting/receipts"
    showPdf?: boolean     // only receipts have PDF
    executives?: any[]    // for filtering receipts
}

const typeBadge: Record<TxType, { label: string; className: string }> = {
    RECEIPT: { label: "Receipt", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    PAYMENT: { label: "Payment", className: "bg-rose-100 text-rose-700 border-rose-200" },
    CONTRA: { label: "Contra", className: "bg-sky-100 text-sky-700 border-sky-200" },
    JOURNAL: { label: "Journal", className: "bg-amber-100 text-amber-700 border-amber-200" },
}

export function TransactionsList({ type, editBasePath, showPdf = false, executives }: Props) {
    const [data, setData] = useState<{
        transactions: any[]
        total: number
        totalPages: number
        page: number
    } | null>(null)
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const [expandedRows, setExpandedRows] = useState<string[]>([])
    
    // Filters
    const [fromDate, setFromDate] = useState<string>("")
    const [toDate, setToDate] = useState<string>("")
    const [collectedBy, setCollectedBy] = useState<string>("all")
    const [exporting, setExporting] = useState(false)

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 350)
        return () => clearTimeout(t)
    }, [search])

    // Reset page on new search or filter
    useEffect(() => { setPage(1) }, [debouncedSearch, fromDate, toDate, collectedBy])

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const result = await getTransactions({ 
                type, 
                page, 
                search: debouncedSearch,
                fromDate: fromDate || undefined,
                toDate: toDate || undefined,
                collectedBy: collectedBy === "all" ? undefined : collectedBy
            })
            setData(result)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }, [type, page, debouncedSearch, fromDate, toDate, collectedBy])

    useEffect(() => { load() }, [load])

    const badge = typeBadge[type]

    function formatDate(d: string, withTime = false) {
        return new Date(d).toLocaleDateString("en-IN", {
            day: "2-digit", 
            month: "short", 
            year: "numeric",
            ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {})
        })
    }

    function getDebitLedgers(txn: any) {
        if (!txn.lines) return "—"
        const names = txn.lines.filter((l: any) => Number(l.debit) > 0).map((l: any) => l.ledger?.name).filter(Boolean)
        if (names.length === 0) return "—"
        if (names.length <= 1) return names[0]
        return `${names[0]} + ${names.length - 1} more`
    }

    function getCreditLedgers(txn: any) {
        if (!txn.lines) return "—"
        const names = txn.lines.filter((l: any) => Number(l.credit) > 0).map((l: any) => l.ledger?.name).filter(Boolean)
        if (names.length === 0) return "—"
        if (names.length <= 1) return names[0]
        return `${names[0]} + ${names.length - 1} more`
    }

    function toggleRow(id: string) {
        setExpandedRows(prev => 
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        )
    }

    async function handleExportExcel() {
        setExporting(true)
        try {
            const allTxns = await getAllTransactionsForExport({
                type,
                search: debouncedSearch,
                fromDate: fromDate || undefined,
                toDate: toDate || undefined,
                collectedBy: collectedBy === "all" ? undefined : collectedBy,
            })

            const rows = allTxns.map((txn: any) => {
                const debitNames = txn.lines?.filter((l: any) => Number(l.debit) > 0).map((l: any) => l.ledger?.name).filter(Boolean).join(", ") || "—"
                const creditNames = txn.lines?.filter((l: any) => Number(l.credit) > 0).map((l: any) => l.ledger?.name).filter(Boolean).join(", ") || "—"
                return {
                    "Ref No": txn.referenceNo,
                    "Date": new Date(txn.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
                    "Narration": txn.narration || "",
                    "Debit Ledger": debitNames,
                    "Credit Ledger": creditNames,
                    "Amount": Number(txn.totalAmount),
                    ...(type === "RECEIPT" ? { "Collected By": txn.collectedBy?.name || "" } : {}),
                }
            })

            const typeLabel = type.charAt(0) + type.slice(1).toLowerCase()
            exportToExcel(rows, `${typeLabel}s_Report`, `${typeLabel}s`)
            toast.success("Excel downloaded successfully")
        } catch (e) {
            console.error(e)
            toast.error("Failed to export")
        } finally {
            setExporting(false)
        }
    }

    return (
        <div className="space-y-4">
            {/* Action Bar & Filters */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        className="pl-9 bg-white"
                        placeholder="Search by ref, narration, or ledger..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                        <Input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="w-[140px] text-xs h-9 bg-white"
                            title="From Date"
                        />
                        <span className="text-slate-400 text-xs">-</span>
                        <Input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            className="w-[140px] text-xs h-9 bg-white"
                            title="To Date"
                        />
                    </div>

                    {type === "RECEIPT" && executives && (
                        <div className="w-[160px]">
                            <Select value={collectedBy} onValueChange={setCollectedBy}>
                                <SelectTrigger className="h-9 text-xs bg-white">
                                    <SelectValue placeholder="Collected By" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Executives</SelectItem>
                                    {executives.map((e: any) => (
                                        <SelectItem key={e.id} value={e.id}>
                                            {e.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {(fromDate || toDate || collectedBy !== "all" || search) && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-slate-500 hover:text-slate-900"
                            onClick={() => {
                                setFromDate("")
                                setToDate("")
                                setCollectedBy("all")
                                setSearch("")
                            }}
                            title="Clear all filters"
                        >
                            <FilterX className="h-4 w-4" />
                        </Button>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportExcel}
                        disabled={exporting || !data || data.total === 0}
                        className="h-9 gap-1.5 text-xs bg-white"
                        title="Export to Excel"
                    >
                        {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        Excel
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                        </div>
                    ) : !data || data.transactions.length === 0 ? (
                        <div className="text-center py-16 text-slate-500">
                            <p className="text-sm">No {badge.label.toLowerCase()} entries found.</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50 text-[11px] uppercase tracking-wider">
                                            <TableHead className="w-10 text-center">#</TableHead>
                                            <TableHead className="w-24">Ref No</TableHead>
                                            <TableHead className="w-24 px-0">Date</TableHead>
                                            <TableHead>Narration</TableHead>
                                            <TableHead className="hidden lg:table-cell">Debit</TableHead>
                                            <TableHead className="hidden lg:table-cell">Credit</TableHead>
                                            <TableHead className="text-right w-24">Amount</TableHead>
                                            <TableHead className="text-center w-28">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.transactions.map((txn: any) => {
                                            const isExpanded = expandedRows.includes(txn.id)
                                            return (
                                                <React.Fragment key={txn.id}>
                                                    <TableRow className="hover:bg-slate-50/60 transition-colors cursor-pointer" onClick={() => toggleRow(txn.id)}>
                                                        <TableCell className="p-2 text-center text-slate-400">
                                                            <div className="flex justify-center">
                                                                {isExpanded ? <ChevronUp className="h-4 w-4 text-sky-600" /> : <ChevronDown className="h-4 w-4" />}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className={`text-[10px] font-mono font-bold ${badge.className}`}>
                                                                {txn.referenceNo}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-xs text-slate-600 whitespace-nowrap px-0">
                                                            {formatDate(txn.date)}
                                                        </TableCell>
                                                        <TableCell className="max-w-[200px]">
                                                            <div className="text-xs text-slate-700 truncate" title={txn.narration}>
                                                                {txn.narration || <span className="text-slate-400 italic">No narration</span>}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="hidden lg:table-cell max-w-[120px]">
                                                            <div className="text-xs text-slate-700 font-medium truncate" title={getDebitLedgers(txn)}>
                                                                {getDebitLedgers(txn)}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="hidden lg:table-cell max-w-[120px]">
                                                            <div className="text-xs text-slate-700 font-medium truncate" title={getCreditLedgers(txn)}>
                                                                {getCreditLedgers(txn)}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right font-bold text-slate-900 text-xs whitespace-nowrap">
                                                            {formatCurrency(Number(txn.totalAmount))}
                                                        </TableCell>
                                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                                            <div className="flex items-center justify-center">
                                                                <TransactionActions 
                                                                    txn={txn} 
                                                                    type={type} 
                                                                    editBasePath={editBasePath} 
                                                                    showPdf={showPdf} 
                                                                    onDelete={load} 
                                                                />
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                    {isExpanded && (
                                                        <TableRow className="bg-slate-50/50">
                                                            <TableCell colSpan={7} className="p-0 border-t-0">
                                                                <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-1 duration-200">
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                                            <User className="h-3 w-3" />
                                                                            {type === "RECEIPT" ? "Collected By" : null}
                                                                        </div>
                                                                        <div className="text-xs text-slate-700 font-semibold pl-3 border-l-2 border-slate-200">
                                                                            {txn.collectedBy?.name || <span className="text-slate-400">Generic</span>}
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                                            <Clock className="h-3 w-3" />
                                                                            Created By
                                                                        </div>
                                                                        <div className="text-[11px] text-slate-600 pl-3 border-l-2 border-slate-200">
                                                                            <p className="font-bold text-slate-700 uppercase tracking-tight">{txn.createdBy?.email.split('@')[0]}</p>
                                                                            <p className="text-slate-400 font-mono mt-0.5">{formatDate(txn.createdAt, true)}</p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                                            <History className="h-3 w-3" />
                                                                            Last Updated
                                                                        </div>
                                                                        <div className="text-[11px] text-slate-600 pl-3 border-l-2 border-slate-200">
                                                                            {txn.updatedBy ? (
                                                                                <>
                                                                                    <p className="font-bold text-slate-700 uppercase tracking-tight">{txn.updatedBy.email.split('@')[0]}</p>
                                                                                    <p className="text-slate-400 font-mono mt-0.5">{formatDate(txn.updatedAt, true)}</p>
                                                                                </>
                                                                            ) : (
                                                                                <p className="text-slate-400 italic">No edits recorded</p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </React.Fragment>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {data.totalPages > 1 && (
                                <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50/50">
                                    <p className="text-xs text-slate-500 font-medium">
                                        Showing {(data.page - 1) * 15 + 1}–{Math.min(data.page * 15, data.total)} of {data.total}
                                    </p>
                                    <div className="flex gap-1">
                                        <Button variant="outline" size="icon" className="h-8 w-8"
                                            disabled={data.page <= 1} onClick={() => setPage(p => p - 1)}>
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="icon" className="h-8 w-8"
                                            disabled={data.page >= data.totalPages} onClick={() => setPage(p => p + 1)}>
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
