"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { formatCurrency, bloodGroupLabels } from "@/lib/utils"
import { Search, Plus, Loader2, Eye, FileEdit, MoreVertical } from "lucide-react"
import { BulkImportDialog } from "./BulkImportDialog"
import { MemberReceiptDialog } from "./MemberReceiptDialog"

export function MemberTable() {
    const [members, setMembers] = useState<any[]>([])
    const [tiers, setTiers] = useState<any[]>([])
    const [ledgers, setLedgers] = useState<any[]>([])
    const [executives, setExecutives] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [status, setStatus] = useState("ALL")
    const [isExec, setIsExec] = useState("ALL")
    const [bloodGroup, setBloodGroup] = useState("ALL")
    const [isActive, setIsActive] = useState("ALL")
    const [mounted, setMounted] = useState(false)

    const fetchMembers = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (search) params.append("q", search)
            if (status !== "ALL") params.append("status", status)
            if (isExec !== "ALL") params.append("isExecutive", isExec)
            if (bloodGroup !== "ALL") params.append("bloodGroup", bloodGroup)
            if (isActive !== "ALL") params.append("isActive", isActive)

            const res = await fetch(`/api/members?${params.toString()}`)
            const data = await res.json()
            if (data.members) {
                setMembers(data.members)
                setTiers(data.tiers || [])
                setLedgers(data.incomeLedgers || [])
                setExecutives(data.executives || [])
            } else {
                setMembers(data) // Fallback for old API format
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!mounted) return
        const delayDebounceFn = setTimeout(() => {
            fetchMembers()
        }, 300)

        return () => clearTimeout(delayDebounceFn)
    }, [search, status, isExec, bloodGroup, isActive, mounted])

    if (!mounted) {
        return <div className="h-96 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        </div>
    }

    return (
        <div className="max-w-full space-y-4 overflow-x-hidden">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="grid w-full gap-2 sm:grid-cols-2 xl:flex xl:w-auto xl:flex-row xl:items-center">
                    <div className="relative w-full sm:col-span-2 xl:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search..."
                            className="pl-9 h-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-full h-9 xl:w-[110px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Status</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="BASIC">Basic</SelectItem>
                            <SelectItem value="SILVER">Silver</SelectItem>
                            <SelectItem value="GOLD">Gold</SelectItem>
                            <SelectItem value="PLATINUM">Platinum</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={isExec} onValueChange={setIsExec}>
                        <SelectTrigger className="w-full h-9 xl:w-[110px]">
                            <SelectValue placeholder="Roles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Roles</SelectItem>
                            <SelectItem value="true">Executive</SelectItem>
                            <SelectItem value="false">Standard</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={bloodGroup} onValueChange={setBloodGroup}>
                        <SelectTrigger className="w-full h-9 xl:w-[110px]">
                            <SelectValue placeholder="Blood" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Blood</SelectItem>
                            {Object.entries(bloodGroupLabels).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={isActive} onValueChange={setIsActive}>
                        <SelectTrigger className="w-full h-9 xl:w-[110px]">
                            <SelectValue placeholder="Active" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All States</SelectItem>
                            <SelectItem value="true">Active</SelectItem>
                            <SelectItem value="false">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex gap-2 w-full md:w-auto shrink-0">
                    <BulkImportDialog iconOnly />
                    <Link href="/admin/members/new" className="flex-1 md:flex-none">
                        <Button className="bg-sky-600 hover:bg-sky-700 w-full md:w-auto h-9">
                            <Plus className="mr-1 h-4 w-4" /> Add Member
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid max-w-full gap-3 md:hidden">
                {loading ? (
                    <div className="flex h-40 items-center justify-center rounded-md border bg-white">
                        <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
                    </div>
                ) : members.length === 0 ? (
                    <div className="rounded-md border bg-white px-4 py-10 text-center text-slate-500">
                        No members found.
                    </div>
                ) : (
                    members.map((member) => {
                        const tierName = member.tier?.name || "Unknown"
                        const tierBg = member.tier?.backgroundColor || "#e2e8f0"
                        const tierColor = member.tier?.textColor || "#1e293b"
                        const sortedTiers = tiers
                            .filter((t: any) => t.name !== "PENDING")
                            .sort((a: any, b: any) => Number(a.threshold) - Number(b.threshold))
                        const currentTierIndex = sortedTiers.findIndex((t: any) => t.id === member.tierId)
                        const nextTier = currentTierIndex >= 0 && currentTierIndex < sortedTiers.length - 1
                            ? sortedTiers[currentTierIndex + 1]
                            : sortedTiers[0]

                        let balanceToNext = 0
                        let isMaxTier = false

                        if (member.tier?.name === "PLATINUM") {
                            isMaxTier = true
                        } else if (nextTier) {
                            balanceToNext = Math.max(0, Number(nextTier.threshold) - Number(member.totalPaid))
                        }

                        return (
                            <div
                                key={member.id}
                                className={`w-full max-w-full overflow-hidden rounded-xl border bg-white p-4 shadow-sm ${!member.isActive ? "bg-slate-50/60" : ""}`}
                            >
                                <div className="relative max-w-full pr-10">
                                    <div className="flex min-w-0 max-w-full items-center gap-3">
                                        <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center">
                                            {member.photoUrl ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={member.photoUrl} alt={member.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-sm font-bold text-slate-400">
                                                    {member.name.charAt(0).toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <div className={`h-2 w-2 rounded-full ${member.isActive ? "bg-emerald-500" : "bg-slate-300"}`} />
                                                <p className="truncate font-semibold text-slate-900">{member.name}</p>
                                            </div>
                                            <p className="text-sm text-slate-500">{member.membershipCode}</p>
                                            <div className="mt-1 flex flex-wrap items-center gap-2">
                                                <Badge variant="outline" className="border-none" style={{ backgroundColor: tierBg, color: tierColor }}>
                                                    {tierName}
                                                </Badge>
                                                {member.isExecutive && (
                                                    <span className="text-[10px] uppercase font-bold tracking-wider text-sky-600">Executive</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="absolute right-0 top-0">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-sky-600">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-44">
                                                {member.ledger?.id && (
                                                    <MemberReceiptDialog
                                                        memberId={member.id}
                                                        memberName={member.name}
                                                        ledgerId={member.ledger.id}
                                                        ledgers={ledgers}
                                                        executives={executives}
                                                        triggerVariant="menu"
                                                    />
                                                )}
                                                {member.ledger?.id && <DropdownMenuSeparator />}
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/members/${member.id}`}>
                                                        <Eye className="h-4 w-4" />
                                                        View Member
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/members/${member.id}/edit`}>
                                                        <FileEdit className="h-4 w-4" />
                                                        Edit Member
                                                    </Link>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                <div className="mt-4 grid max-w-full grid-cols-2 gap-3 text-sm">
                                    <div className="min-w-0 rounded-lg bg-slate-50 px-3 py-2">
                                        <p className="text-xs uppercase tracking-wide text-slate-500">Mobile</p>
                                        <p className="mt-1 truncate font-medium text-slate-800">{member.mobile}</p>
                                    </div>
                                    <div className="min-w-0 rounded-lg bg-slate-50 px-3 py-2">
                                        <p className="text-xs uppercase tracking-wide text-slate-500">Blood Group</p>
                                        <p className="mt-1 font-medium text-slate-800">{bloodGroupLabels[member.bloodGroup]}</p>
                                    </div>
                                    <div className="min-w-0 rounded-lg bg-slate-50 px-3 py-2">
                                        <p className="text-xs uppercase tracking-wide text-slate-500">Total Paid</p>
                                        <p className="mt-1 truncate font-semibold text-slate-900">{formatCurrency(member.totalPaid)}</p>
                                    </div>
                                    <div className="min-w-0 rounded-lg bg-slate-50 px-3 py-2">
                                        <p className="text-xs uppercase tracking-wide text-slate-500">Balance</p>
                                        <p className={`mt-1 truncate font-semibold ${isMaxTier ? "text-slate-500" : "text-orange-500"}`}>
                                            {isMaxTier ? "Nil" : formatCurrency(balanceToNext)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            <div className="hidden rounded-md border bg-white md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Mobile</TableHead>
                            <TableHead>Blood Group</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Total Paid</TableHead>
                            <TableHead className="text-right">Balance</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    <div className="flex items-center justify-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-sky-500" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : members.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center text-slate-500">
                                    No members found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            members.map((member) => {
                                const tierName = member.tier?.name || "Unknown"
                                const tierBg = member.tier?.backgroundColor || "#e2e8f0"
                                const tierColor = member.tier?.textColor || "#1e293b"
                                
                                // Calculate balance to next tier
                                const sortedTiers = tiers.filter((t: any) => t.name !== "PENDING").sort((a: any, b: any) => Number(a.threshold) - Number(b.threshold))
                                const currentTierIndex = sortedTiers.findIndex((t: any) => t.id === member.tierId)
                                const nextTier = currentTierIndex >= 0 && currentTierIndex < sortedTiers.length - 1 ? sortedTiers[currentTierIndex + 1] : sortedTiers[0]
                                
                                let balanceToNext = 0;
                                let isMaxTier = false;
                                
                                if (member.tier?.name === "PLATINUM") {
                                    isMaxTier = true;
                                } else if (nextTier) {
                                    balanceToNext = Math.max(0, Number(nextTier.threshold) - Number(member.totalPaid));
                                }

                                return (
                                    <TableRow key={member.id} className={!member.isActive ? "bg-slate-50/50" : ""}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <div className={`h-2 w-2 rounded-full ${member.isActive ? "bg-emerald-500" : "bg-slate-300"}`} />
                                                {member.membershipCode}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full overflow-hidden bg-slate-100 shrink-0 flex items-center justify-center">
                                                    {member.photoUrl ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img src={member.photoUrl} alt={member.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <span className="text-xs font-bold text-slate-400">
                                                            {member.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span>{member.name}</span>
                                                    {member.isExecutive && (
                                                        <span className="text-[10px] uppercase font-bold text-sky-600 tracking-wider">Executive</span>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{member.mobile}</TableCell>
                                        <TableCell>{bloodGroupLabels[member.bloodGroup]}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="border-none" style={{ backgroundColor: tierBg, color: tierColor }}>
                                                {tierName}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(member.totalPaid)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {isMaxTier ? (
                                                <span className="text-xs text-slate-400 font-medium">Nil</span>
                                            ) : (
                                                <span className="text-orange-500 font-medium">{formatCurrency(balanceToNext)}</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                {member.ledger?.id && (
                                                    <MemberReceiptDialog 
                                                        memberId={member.id}
                                                        memberName={member.name}
                                                        ledgerId={member.ledger.id}
                                                        ledgers={ledgers}
                                                        executives={executives}
                                                        triggerVariant="icon"
                                                    />
                                                )}
                                                <Link href={`/admin/members/${member.id}`}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-sky-600">
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/admin/members/${member.id}/edit`}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-sky-600">
                                                        <FileEdit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
