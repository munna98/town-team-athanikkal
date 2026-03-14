"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { paymentSchema, PaymentInput } from "@/types"
import { toast } from "sonner"
import { updatePayment } from "@/app/actions/accounting"
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
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel
} from "@/components/ui/select"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export function EditPaymentForm({
    transactionId,
    defaultValues,
    ledgers,
}: {
    transactionId: string
    defaultValues: PaymentInput
    ledgers: any[]
}) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<PaymentInput>({
        resolver: zodResolver(paymentSchema),
        defaultValues,
    })

    // Expense and Liability ledgers
    const pureExpense = ledgers.filter(l => l.group.nature === "EXPENSE")
    const liabilities = ledgers.filter(l => l.group.nature === "LIABILITY" && !l.isSystem)

    async function onSubmit(data: PaymentInput) {
        setIsLoading(true)
        try {
            const result = await updatePayment(transactionId, data)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Payment updated successfully")
                router.push("/admin/accounting/payments?tab=all")
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
                    <Link href="/admin/accounting/payments">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <CardTitle>Edit Payment</CardTitle>
                        <CardDescription>Update payment voucher details.</CardDescription>
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
                                        <FormLabel>Pay From *</FormLabel>
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
                                name="expenseLedgerId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Debit Account (Expense/Liability) *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select ledger to debit" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Expense Ledgers</SelectLabel>
                                                    {pureExpense.map(l => (
                                                        <SelectItem key={l.id} value={l.id}>
                                                            {l.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                                {liabilities.length > 0 && (
                                                    <SelectGroup>
                                                        <SelectLabel>Liabilities</SelectLabel>
                                                        {liabilities.map(l => (
                                                            <SelectItem key={l.id} value={l.id}>
                                                                {l.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectGroup>
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

                            <div className="md:col-span-2">
                                <FormField
                                    control={form.control}
                                    name="narration"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Narration / Description</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Ground booking fee..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Link href="/admin/accounting/payments">
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
