"use client"

import { useState, useEffect, useRef } from "react"
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
import { LedgerCombobox } from "./LedgerCombobox"
import { Loader2, CheckCircle2 } from "lucide-react"
import { DownloadPaymentButton, SharePaymentButton } from "@/components/pdf/DownloadButtons"

export function PaymentForm({ 
    ledgers,
    embedded = false,
    autoFocusAmount = false
}: { 
    ledgers: any[] 
    embedded?: boolean
    autoFocusAmount?: boolean
}) {
    const [isLoading, setIsLoading] = useState(false)
    const [successData, setSuccessData] = useState<{ transactionId: string, referenceNo: string, mobile?: string } | null>(null)
    const amountInputRef = useRef<HTMLInputElement | null>(null)

    const form = useForm<PaymentInput>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            date: "",
            amount: undefined as any,
            cashOrBank: "CASH",
            expenseLedgerId: "",
            narration: "",
        },
    })

    useEffect(() => {
        form.setValue("date", new Date().toISOString().split('T')[0])
    }, [form])

    useEffect(() => {
        if (autoFocusAmount && amountInputRef.current) {
            amountInputRef.current.focus()
        }
    }, [autoFocusAmount, successData])

    // Expense and Liability ledgers
    const pureExpense = ledgers.filter(l => l.group.nature === "EXPENSE")
    const liabilities = ledgers.filter(l => l.group.nature === "LIABILITY" && !l.isSystem)

    async function onSubmit(data: PaymentInput) {
        setIsLoading(true)
        try {
            const result = await submitPayment(data)
            if (result.error) {
                toast.error(result.error)
            } else if (result.transactionId && result.referenceNo) {
                toast.success("Payment recorded successfully")
                setSuccessData({
                    transactionId: result.transactionId,
                    referenceNo: result.referenceNo,
                })
                form.reset({
                    ...form.getValues(),
                    amount: undefined as any,
                    narration: "",
                })
            }
        } catch (error) {
            toast.error("Internal error")
        } finally {
            setIsLoading(false)
        }
    }

    if (successData) {
        const successContent = (
            <div className="flex flex-col items-center justify-center space-y-6 text-center py-12">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle2 className="h-8 w-8 text-rose-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Payment Voucher Generated</h2>
                    <p className="text-slate-500 mt-1">Reference No: <span className="font-semibold text-slate-700">{successData.referenceNo}</span></p>
                </div>

                <div className="flex gap-4 mt-6">
                    <DownloadPaymentButton transactionId={successData.transactionId} referenceNo={successData.referenceNo} size="default" className="border-rose-200 text-rose-700 hover:bg-rose-50" />
                    <SharePaymentButton transactionId={successData.transactionId} referenceNo={successData.referenceNo} size="default" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50" mobile="9999999999" />
                </div>

                <div className="pt-4 w-full max-w-xs mx-auto border-t mt-4">
                    <Button 
                        variant="default" 
                        className="w-full bg-slate-800 hover:bg-slate-900" 
                        onClick={() => setSuccessData(null)}
                    >
                        Create Another Payment
                    </Button>
                </div>
            </div>
        )

        if (embedded) return <div className="p-1">{successContent}</div>

        return (
            <Card>
                <CardContent className="pt-6">
                    {successContent}
                </CardContent>
            </Card>
        )
    }

    const formContent = (
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
                            <FormItem className="min-w-0">
                                <FormLabel>Debit Account (Expense/Liability) *</FormLabel>
                                    <LedgerCombobox
                                        ledgers={[...pureExpense, ...liabilities]}
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        placeholder="Choose expense/liability account..."
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
                            <FormItem className="min-w-0">
                                <FormLabel>Amount (₹) *</FormLabel>
                                <FormControl>
                                    <Input 
                                        type="number" 
                                        step="0.01" 
                                        min="1" 
                                        {...field} 
                                        value={field.value ?? ""}
                                        onChange={e => field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))}
                                        ref={(e) => {
                                            field.ref(e)
                                            amountInputRef.current = e
                                        }}
                                    />
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
                                        <Input placeholder="e.g., Ground booking fee, Refreshments..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" className="bg-sky-600 hover:bg-sky-700 w-full md:w-auto" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Payment Voucher
                    </Button>
                </div>
            </form>
        </Form>
    )

    if (embedded) return <div className="p-1">{formContent}</div>

    return (
        <Card>
            <CardHeader>
                <CardTitle>Record Payment</CardTitle>
                <CardDescription>Record money paid out from Cash or Bank accounts.</CardDescription>
            </CardHeader>
            <CardContent>
                {formContent}
            </CardContent>
        </Card>
    )
}
