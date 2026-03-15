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
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export function UserManagementClient({ executives, currentUserRole }: { executives: any[], currentUserRole: string }) {
    const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({})
    const isSuperAdmin = currentUserRole === "SUPER_ADMIN"

    const wrapAction = async (
        id: string,
        actionFn: () => Promise<{ error?: string; success?: boolean; message?: string }>,
        successMsg?: string
    ) => {
        setLoadingIds(prev => ({ ...prev, [id]: true }))
        try {
            const res = await actionFn()
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success(res.message || successMsg || "Done")
            }
        } catch {
            toast.error("An unexpected error occurred")
        } finally {
            setLoadingIds(prev => ({ ...prev, [id]: false }))
        }
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Member Email</TableHead>
                    <TableHead>Login Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {executives.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-slate-500">
                            No executive members found.
                        </TableCell>
                    </TableRow>
                ) : (
                    executives.map((member) => {
                        const isLoading = loadingIds[member.id]
                        const memberEmail = member.email?.trim().toLowerCase()
                        const userEmail = member.user?.email?.trim().toLowerCase()
                        const isOutOfSync = member.user && memberEmail && memberEmail !== userEmail

                        return (
                            <TableRow key={member.id} className={isOutOfSync ? "bg-amber-50" : ""}>
                                <TableCell className="font-medium">{member.membershipCode}</TableCell>
                                <TableCell>{member.name}</TableCell>

                                <TableCell className="text-slate-500 text-sm">
                                    {member.email || <span className="italic text-slate-400">No email</span>}
                                </TableCell>

                                <TableCell className="text-sm">
                                    {member.user ? (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className={isOutOfSync ? "text-amber-600 font-medium underline decoration-dashed cursor-help" : "text-slate-500"}>
                                                    {member.user.email}
                                                </span>
                                            </TooltipTrigger>
                                            {isOutOfSync && (
                                                <TooltipContent>
                                                    Email changed after access was granted. Edit &amp; save the member profile to auto-sync.
                                                </TooltipContent>
                                            )}
                                        </Tooltip>
                                    ) : (
                                        <span className="italic text-slate-400">—</span>
                                    )}
                                </TableCell>

                                <TableCell>
                                    {member.user ? (
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                                Has Access
                                            </Badge>
                                            {isOutOfSync && (
                                                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">
                                                    Email mismatch
                                                </Badge>
                                            )}
                                        </div>
                                    ) : (
                                        <Badge variant="outline" className="text-slate-500 border-slate-200">
                                            No Access
                                        </Badge>
                                    )}
                                </TableCell>

                                <TableCell className="text-right">
                                    {member.user ? (
                                        <div className="flex justify-end gap-2">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={isLoading}
                                                        onClick={() => wrapAction(
                                                            member.id,
                                                            () => resetUserPassword(member.user.id)
                                                        )}
                                                    >
                                                        {isLoading
                                                            ? <Loader2 className="h-4 w-4 animate-spin" />
                                                            : <Key className="h-4 w-4 text-sky-600" />
                                                        }
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Reset Password</TooltipContent>
                                            </Tooltip>

                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                                        disabled={isLoading || !isSuperAdmin}
                                                        onClick={() => wrapAction(
                                                            member.id,
                                                            () => revokeUserAccess(member.user.id),
                                                            "Access revoked"
                                                        )}
                                                    >
                                                        {isLoading
                                                            ? <Loader2 className="h-4 w-4 animate-spin" />
                                                            : <ShieldOff className="h-4 w-4" />
                                                        }
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    {isSuperAdmin ? "Revoke Access" : "Only super admins can revoke"}
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={isLoading || !member.email}
                                            onClick={() => wrapAction(
                                                member.id,
                                                () => grantUserAccess(member.id)
                                            )}
                                            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                                        >
                                            {isLoading
                                                ? <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                                : <Shield className="h-4 w-4 mr-1" />
                                            }
                                            Grant Access
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        )
                    })
                )}
            </TableBody>
        </Table>
    )
}