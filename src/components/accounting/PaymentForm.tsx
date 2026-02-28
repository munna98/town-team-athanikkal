"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { paymentSchema, PaymentInput } from "@/types"
import { toast } from "sonner"
import { submitPayment } from "@/app/actions/accounting"
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

export function PaymentForm({ ledgers }: { ledgers: any[] }) {
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<PaymentInput>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            amount: 0,
            cashOrBank: "CASH",
            expenseLedgerId: "",
            narration: "",
            paidTo: "",
        },
    })

    // Expense ledgers and Party ledgers
    const expenseLedgers = ledgers.filter(l => l.group.nature === "EXPENSE" || l.group.nature === "ASSET" || l.group.nature === "LIABILITY")
    // For payment, we can pay expenses, or settle liabilities, or give advances (to members)

    const pureExpense = ledgers.filter(l => l.group.nature === "EXPENSE")
    const partyLedgers = ledgers.filter(l => l.partyType === "MEMBER")
    const liabilities = ledgers.filter(l => l.group.nature === "LIABILITY" && !l.isSystem)

    async function onSubmit(data: PaymentInput) {
        setIsLoading(true)
        try {
            const result = await submitPayment(data)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Payment recorded successfully")
                form.reset({
                    ...form.getValues(),
                    amount: 0,
                    narration: "",
                    paidTo: ""
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
                <CardTitle>Record Payment</CardTitle>
                <CardDescription>Record money paid out from Cash or Bank accounts.</CardDescription>
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
                                        <FormLabel>Debit Account (Expense/Party/Liability) *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select ledger to debit" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <optgroup label="Expense Ledgers">
                                                    {pureExpense.map(l => (
                                                        <SelectItem key={l.id} value={l.id}>{l.name} ({l.code})</SelectItem>
                                                    ))}
                                                </optgroup>
                                                {partyLedgers.length > 0 && (
                                                    <optgroup label="Party Ledgers (Advances/Settlements)">
                                                        {partyLedgers.map(l => (
                                                            <SelectItem key={l.id} value={l.id}>{l.code} - {l.name}</SelectItem>
                                                        ))}
                                                    </optgroup>
                                                )}
                                                {liabilities.length > 0 && (
                                                    <optgroup label="Liabilities (Loan Repayments)">
                                                        {liabilities.map(l => (
                                                            <SelectItem key={l.id} value={l.id}>{l.name} ({l.code})</SelectItem>
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

                            <FormField
                                control={form.control}
                                name="paidTo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Paid To (Vendor/Person) *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Vendor name, staff name..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="narration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Narration / Description *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Ground booking fee, Refreshments..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" className="bg-sky-600 hover:bg-sky-700 w-full md:w-auto" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Payment Voucher
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
