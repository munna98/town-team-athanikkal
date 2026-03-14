"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { receiptSchema, ReceiptInput } from "@/types"
import { toast } from "sonner"
import { updateReceipt } from "@/app/actions/accounting"
import { useState } from "react"
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
import { LedgerCombobox } from "./LedgerCombobox"
import { Loader2, ArrowLeft, Info } from "lucide-react"
import Link from "next/link"

export function EditReceiptForm({
    transactionId,
    defaultValues,
    ledgers,
    executives,
}: {
    transactionId: string
    defaultValues: ReceiptInput
    ledgers: any[]
    executives: any[]
}) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<ReceiptInput>({
        resolver: zodResolver(receiptSchema),
        defaultValues,
    })

    const incomeLedgers = ledgers.filter(l => l.group.nature === "INCOME")

    async function onSubmit(data: ReceiptInput) {
        setIsLoading(true)
        try {
            const result = await updateReceipt(transactionId, data)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Receipt updated successfully")
                router.push("/admin/accounting/receipts?tab=all")
                router.refresh()
            }
        } catch {
            toast.error("Internal error")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Link href="/admin/accounting/receipts">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <CardTitle>Edit Receipt</CardTitle>
                        <CardDescription>Update receipt voucher details.</CardDescription>
                    </div>
                </div>
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
                                        <FormLabel>Credit Account (Income) *</FormLabel>
                                            <LedgerCombobox
                                                ledgers={incomeLedgers}
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                placeholder="Select income/party ledger"
                                                showMemberCodesOnly={true}
                                            />
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

                            <div className="md:col-span-2">
                                <FormField
                                    control={form.control}
                                    name="narration"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Narration / Description</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Monthly fee for July..." {...field} />
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
                                                {executives.map(e => (
                                                    <SelectItem key={e.id} value={e.id}>
                                                        {e.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Link href="/admin/accounting/receipts">
                                <Button type="button" variant="outline">Cancel</Button>
                            </Link>
                            <Button type="submit" className="bg-sky-600 hover:bg-sky-700" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
