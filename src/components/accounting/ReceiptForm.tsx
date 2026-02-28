"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { receiptSchema, ReceiptInput } from "@/types"
import { toast } from "sonner"
import { submitReceipt } from "@/app/actions/accounting"
import {
    Card, CardHeader, CardTitle, CardDescription, CardContent
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"

export function ReceiptForm({
    ledgers,
    users,
    members
}: {
    ledgers: any[]
    users: any[]
    members: any[]
}) {
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<ReceiptInput>({
        resolver: zodResolver(receiptSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            amount: 0,
            cashOrBank: "CASH",
            incomeLedgerId: "",
            collectedById: "",
            narration: "",
            memberId: "",
            memberName: "",
        },
    })

    // Group ledgers for the dropdown
    const incomeLedgers = ledgers.filter(l => l.group.nature === "INCOME")
    const partyLedgers = ledgers.filter(l => l.partyType === "MEMBER")

    // Find Membership Fee ledger specifically for smart defaults
    const membershipFeeLedger = incomeLedgers.find(l => l.code === "4001")

    const watchIncomeLedger = form.watch("incomeLedgerId")

    async function onSubmit(data: ReceiptInput) {
        setIsLoading(true)
        try {
            const result = await submitReceipt(data)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Receipt created successfully")
                form.reset({
                    ...form.getValues(),
                    amount: 0,
                    narration: "",
                    memberId: "",
                    memberName: ""
                })
            }
        } catch (error) {
            toast.error("Internal error")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Record Receipt</CardTitle>
                <CardDescription>Receive money into Cash or Bank accounts.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date *</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="cashOrBank"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Receive Into *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select account" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="CASH">Cash in Hand</SelectItem>
                                                <SelectItem value="BANK">Bank - Default</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="incomeLedgerId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Credit Account (Income/Party) *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select ledger to credit" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <optgroup label="Income Ledgers">
                                                    {incomeLedgers.map(l => (
                                                        <SelectItem key={l.id} value={l.id}>{l.name} ({l.code})</SelectItem>
                                                    ))}
                                                </optgroup>
                                                {partyLedgers.length > 0 && (
                                                    <optgroup label="Member Party Ledgers">
                                                        {partyLedgers.map(l => (
                                                            <SelectItem key={l.id} value={l.id}>{l.code} - {l.name}</SelectItem>
                                                        ))}
                                                    </optgroup>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount (₹) *</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" min="1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Show member selection if Membership Fee is selected or as optional linked member */}
                            {(watchIncomeLedger === membershipFeeLedger?.id) && (
                                <div className="md:col-span-2 p-4 bg-sky-50 rounded-lg border border-sky-100">
                                    <FormField
                                        control={form.control}
                                        name="memberId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Link to Member (Required for Membership Fee) *</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-white">
                                                            <SelectValue placeholder="Select member" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {members.map(m => (
                                                            <SelectItem key={m.id} value={m.id}>{m.membershipCode} - {m.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <p className="text-xs text-sky-600 mt-2">
                                        Linking a member to "Membership Fee" will count towards their lifetime totalPaid and could upgrade their membership tier.
                                    </p>
                                </div>
                            )}

                            <div className="md:col-span-2">
                                <FormField
                                    control={form.control}
                                    name="narration"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Narration / Description *</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Monthly fee for July, Advance payment..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="collectedById"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Collected By *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select user" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {users.map(u => (
                                                    <SelectItem key={u.id} value={u.id}>{u.email} ({u.role})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" className="bg-sky-600 hover:bg-sky-700 w-full md:w-auto" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Receipt Voucher
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
