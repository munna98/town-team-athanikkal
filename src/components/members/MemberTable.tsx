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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { formatCurrency, bloodGroupLabels, membershipStatusConfig } from "@/lib/utils"
import { Search, Plus, Loader2, Eye, FileEdit } from "lucide-react"
import { BulkImportDialog } from "./BulkImportDialog"

export function MemberTable() {
    const [members, setMembers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [status, setStatus] = useState("ALL")
    const [isExec, setIsExec] = useState("ALL")
    const [bloodGroup, setBloodGroup] = useState("ALL")

    const fetchMembers = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (search) params.append("q", search)
            if (status !== "ALL") params.append("status", status)
            if (isExec !== "ALL") params.append("isExecutive", isExec)
            if (bloodGroup !== "ALL") params.append("bloodGroup", bloodGroup)

            const res = await fetch(`/api/members?${params.toString()}`)
            const data = await res.json()
            setMembers(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchMembers()
        }, 300)

        return () => clearTimeout(delayDebounceFn)
    }, [search, status, isExec, bloodGroup])

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search code, name, mobile..."
                            className="pl-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="w-[140px]">
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
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Exec/Member" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Roles</SelectItem>
                            <SelectItem value="true">Executive</SelectItem>
                            <SelectItem value="false">Standard</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={bloodGroup} onValueChange={setBloodGroup}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Blood Group" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Blood Groups</SelectItem>
                            {Object.entries(bloodGroupLabels).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <BulkImportDialog />
                    <Link href="/admin/members/new" className="flex-1 md:flex-none">
                        <Button className="bg-sky-600 hover:bg-sky-700 w-full md:w-auto">
                            <Plus className="mr-2 h-4 w-4" /> Add Member
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="border rounded-md bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Mobile</TableHead>
                            <TableHead>Blood Group</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Total Paid</TableHead>
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
                                <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                                    No members found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            members.map((member) => {
                                const statusConf = membershipStatusConfig[member.membershipStatus]
                                return (
                                    <TableRow key={member.id}>
                                        <TableCell className="font-medium">{member.membershipCode}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{member.name}</span>
                                                {member.isExecutive && (
                                                    <span className="text-[10px] uppercase font-bold text-sky-600 tracking-wider">Executive</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{member.mobile}</TableCell>
                                        <TableCell>{bloodGroupLabels[member.bloodGroup]}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`${statusConf?.color} text-white border-none`}>
                                                {statusConf?.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(member.totalPaid)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
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
