"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Key, Shield, ShieldOff } from "lucide-react"
import { grantUserAccess, revokeUserAccess, resetUserPassword } from "@/app/actions/users"
import { toast } from "sonner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export function UserManagementClient({ executives }: { executives: any[] }) {
    const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({})

    const wrapAction = async (id: string, actionFn: () => Promise<{ error?: string, success?: boolean, message?: string }>, successMsg?: string) => {
        setLoadingIds(prev => ({ ...prev, [id]: true }))
        try {
            const res = await actionFn()
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success(res.message || successMsg || "Action completed")
            }
        } catch (e) {
            toast.error("An unexpected error occurred")
        } finally {
            setLoadingIds(prev => ({ ...prev, [id]: false }))
        }
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Member Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {executives.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-slate-500">
                            No executive members found.
                        </TableCell>
                    </TableRow>
                ) : (
                    executives.map((member) => (
                        <TableRow key={member.id}>
                            <TableCell className="font-medium">{member.membershipCode}</TableCell>
                            <TableCell>{member.name}</TableCell>
                            <TableCell className="text-slate-500">{member.email || "No Email"}</TableCell>
                            <TableCell>
                                {member.user ? (
                                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Has Access</Badge>
                                ) : (
                                    <Badge variant="outline" className="text-slate-500 border-slate-200">No Access</Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                {member.user ? (
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={loadingIds[member.id]}
                                            onClick={() => wrapAction(member.id, () => resetUserPassword(member.user.id))}
                                            title="Reset Password"
                                        >
                                            {loadingIds[member.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4 text-sky-600" />}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                            disabled={loadingIds[member.id]}
                                            onClick={() => wrapAction(member.id, () => revokeUserAccess(member.user.id), "Access revoked")}
                                            title="Revoke Access"
                                        >
                                            {loadingIds[member.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldOff className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={loadingIds[member.id] || !member.email}
                                        onClick={() => wrapAction(member.id, () => grantUserAccess(member.id))}
                                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                                    >
                                        {loadingIds[member.id] ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Shield className="h-4 w-4 mr-1" />}
                                        Grant Access
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    )
}
