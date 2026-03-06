"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { journalSchema, JournalInput } from "@/types"
import { toast } from "sonner"
import { submitJournal } from "@/app/actions/accounting"
import { formatCurrency } from "@/lib/utils"
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
import { Loader2, Plus, Trash2 } from "lucide-react"

export function JournalForm({ ledgers }: { ledgers: any[] }) {
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<JournalInput>({
        resolver: zodResolver(journalSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            narration: "",
            lines: [
                { ledgerId: "", debit: 0, credit: 0 },
                { ledgerId: "", debit: 0, credit: 0 },
            ],
        },
    })

    const { fields, append, remove } = useFieldArray({
        name: "lines",
        control: form.control,
    })

    const lines = form.watch("lines")
    const totalDebit = lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0)
    const totalCredit = lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0)
    const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0

    async function onSubmit(data: JournalInput) {
        if (!isBalanced) {
            toast.error("Journal entry must be balanced (Total Dr = Total Cr)")
            return
        }

        setIsLoading(true)
        try {
            const result = await submitJournal(data)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Journal entry recorded")
                form.reset({
                    date: new Date().toISOString().split('T')[0],
                    narration: "",
                    lines: [
                        { ledgerId: "", debit: 0, credit: 0 },
                        { ledgerId: "", debit: 0, credit: 0 },
                    ]
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
                <CardTitle>Manual Journal Entry</CardTitle>
                <CardDescription>Create complex, multi-line journal adjustments safely matching debits and credits.</CardDescription>
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
                                name="narration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Master Narration</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Adjustment entry for..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="border rounded-md overflow-hidden">
                            <div className="bg-slate-100 p-3 grid grid-cols-10 gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hidden md:grid">
                                <div className="col-span-5">Ledger Account</div>
                                <div className="col-span-2 text-right">Debit (Dr)</div>
                                <div className="col-span-2 text-right">Credit (Cr)</div>
                                <div className="col-span-1 text-center">Action</div>
                            </div>

                            <div className="p-3 bg-white space-y-3">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-10 gap-3 items-start border-b md:border-b-0 pb-4 md:pb-0">
                                        <div className="md:col-span-5">
                                            <FormField
                                                control={form.control}
                                                name={`lines.${index}.ledgerId`}
                                                render={({ field }) => (
                                                    <FormItem className="space-y-0">
                                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-9">
                                                                    <SelectValue placeholder="Select Ledger" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {ledgers.map(l => (
                                                                    <SelectItem key={l.id} value={l.id}>
                                                                        {l.name} {l.code && !l.name.includes(l.code) ? `(${l.code})` : ""}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 md:col-span-4 md:grid-cols-2">
                                            <FormField
                                                control={form.control}
                                                name={`lines.${index}.debit`}
                                                render={({ field }) => (
                                                    <FormItem className="space-y-0">
                                                        <FormControl>
                                                            <Input type="number" step="0.01" min="0" className="h-9 text-right bg-emerald-50/30" placeholder="0.00"
                                                                value={field.value === 0 ? '' : field.value}
                                                                onChange={e => {
                                                                    field.onChange(parseFloat(e.target.value) || 0)
                                                                    if (e.target.value !== "0" && e.target.value !== "") {
                                                                        form.setValue(`lines.${index}.credit`, 0)
                                                                    }
                                                                }} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`lines.${index}.credit`}
                                                render={({ field }) => (
                                                    <FormItem className="space-y-0">
                                                        <FormControl>
                                                            <Input type="number" step="0.01" min="0" className="h-9 text-right bg-red-50/30" placeholder="0.00"
                                                                value={field.value === 0 ? '' : field.value}
                                                                onChange={e => {
                                                                    field.onChange(parseFloat(e.target.value) || 0)
                                                                    if (e.target.value !== "0" && e.target.value !== "") {
                                                                        form.setValue(`lines.${index}.debit`, 0)
                                                                    }
                                                                }} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="md:col-span-1 text-right md:text-center mt-2 md:mt-0">
                                            <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => remove(index)} disabled={fields.length <= 2}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}

                                <div className="pt-2">
                                    <Button type="button" variant="outline" size="sm" onClick={() => append({ ledgerId: "", debit: 0, credit: 0 })} className="text-sky-600 border-sky-200 hover:bg-sky-50">
                                        <Plus className="mr-1 h-3 w-3" /> Add Row
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-slate-100 p-4 border-t grid grid-cols-1 md:grid-cols-10 gap-3 items-center">
                                <div className="md:col-span-5 font-bold text-slate-700 text-right uppercase tracking-wider text-sm">Totals</div>
                                <div className="grid grid-cols-2 gap-2 md:col-span-4 md:grid-cols-2">
                                    <div className={`text-right font-bold px-3 py-1.5 rounded ${isBalanced ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                        {formatCurrency(totalDebit)}
                                    </div>
                                    <div className={`text-right font-bold px-3 py-1.5 rounded ${isBalanced ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                        {formatCurrency(totalCredit)}
                                    </div>
                                </div>
                                {!isBalanced && totalDebit > 0 && (
                                    <div className="md:col-span-10 text-xs text-red-600 font-bold text-right pt-2">
                                        Difference: {formatCurrency(Math.abs(totalDebit - totalCredit))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button type="submit" className="bg-sky-600 hover:bg-sky-700 w-full md:w-auto" disabled={isLoading || !isBalanced}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Post Journal
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
