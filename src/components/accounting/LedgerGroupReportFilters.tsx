"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar as CalendarIcon, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LedgerGroupCombobox } from "./LedgerGroupCombobox"

interface LedgerGroup {
    id: string
    name: string
    nature: string
}

interface LedgerGroupReportFiltersProps {
    groups: LedgerGroup[]
    currentGroupId?: string
    currentFrom?: string
    currentTo?: string
}

export function LedgerGroupReportFilters({
    groups,
    currentGroupId = "",
    currentFrom = "",
    currentTo = "",
}: LedgerGroupReportFiltersProps) {
    const router = useRouter()
    const [groupId, setGroupId] = useState(currentGroupId)
    const [from, setFrom] = useState(currentFrom)
    const [to, setTo] = useState(currentTo)

    const handleApply = () => {
        if (!groupId) return

        const params = new URLSearchParams()
        if (from) params.set("from", from)
        if (to) params.set("to", to)

        const query = params.toString()
        router.push(
            query
                ? `/admin/accounting/ledger-groups/${groupId}?${query}`
                : `/admin/accounting/ledger-groups/${groupId}`
        )
    }

    return (
        <Card className="border-slate-200 bg-white/50 backdrop-blur-sm">
            <CardContent className="p-4">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="min-w-[260px] flex-1 space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Ledger Group
                        </Label>
                        <LedgerGroupCombobox
                            groups={groups}
                            value={groupId}
                            onValueChange={setGroupId}
                            placeholder="Choose a ledger group..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="group-from" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            From Date
                        </Label>
                        <div className="relative">
                            <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                id="group-from"
                                type="date"
                                value={from}
                                onChange={(event) => setFrom(event.target.value)}
                                className="w-40 pl-9"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="group-to" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            To Date
                        </Label>
                        <div className="relative">
                            <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                id="group-to"
                                type="date"
                                value={to}
                                onChange={(event) => setTo(event.target.value)}
                                className="w-40 pl-9"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={handleApply}
                        className="bg-sky-600 text-white hover:bg-sky-700"
                        disabled={!groupId}
                    >
                        <Filter className="mr-2 h-4 w-4" />
                        Apply Filters
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
