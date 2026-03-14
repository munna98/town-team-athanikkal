"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Calendar as CalendarIcon, Filter, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { LedgerCombobox } from "./LedgerCombobox"

interface Ledger {
    id: string
    name: string
    code: string
}

interface ReportFiltersProps {
    ledgers: Ledger[]
}

export function ReportFilters({ ledgers }: ReportFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const currentType = searchParams.get("type") || "trial-balance"
    const currentFrom = searchParams.get("from") || ""
    const currentTo = searchParams.get("to") || ""
    const currentLedger = searchParams.get("ledger") || ""

    const [from, setFrom] = useState(currentFrom)
    const [to, setTo] = useState(currentTo)
    const [ledgerId, setLedgerId] = useState(currentLedger)

    const handleApply = () => {
        const params = new URLSearchParams(searchParams.toString())
        if (from) params.set("from", from)
        else params.delete("from")
        
        if (to) params.set("to", to)
        else params.delete("to")
        
        if (currentType === "ledger-statement" && ledgerId) {
            params.set("ledger", ledgerId)
        } else {
            params.delete("ledger")
        }

        router.push(`/admin/accounting/reports?${params.toString()}`)
    }

    return (
        <Card className="bg-white/50 backdrop-blur-sm border-slate-200">
            <CardContent className="p-4">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="from" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">From Date</Label>
                        <div className="relative">
                            <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                id="from"
                                type="date"
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                                className="pl-9 w-40"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="to" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">To Date</Label>
                        <div className="relative">
                            <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                id="to"
                                type="date"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                className="pl-9 w-40"
                            />
                        </div>
                    </div>

                    {currentType === "ledger-statement" && (
                        <div className="space-y-2 flex-1 min-w-[240px]">
                            <Label htmlFor="ledger" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Select Ledger</Label>
                            <LedgerCombobox
                                ledgers={ledgers}
                                value={ledgerId}
                                onValueChange={setLedgerId}
                                placeholder="Choose a ledger..."
                                showMemberCodesOnly={true}
                            />
                        </div>
                    )}

                    <Button onClick={handleApply} className="bg-sky-600 hover:bg-sky-700 text-white">
                        <Filter className="w-4 h-4 mr-2" />
                        Apply Filters
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
