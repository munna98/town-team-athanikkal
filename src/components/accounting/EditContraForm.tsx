"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { contraSchema, ContraInput } from "@/types"
import { toast } from "sonner"
import { updateContra } from "@/app/actions/accounting"
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
import { Loader2, ArrowLeft, ArrowRightLeft } from "lucide-react"
import Link from "next/link"

export function EditContraForm({
    transactionId,
    defaultValues,
    ledgers,
}: {
    transactionId: string
    defaultValues: ContraInput
    ledgers: any[]
}) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<ContraInput>({
        resolver: zodResolver(contraSchema),
        defaultValues,
    })

    const liquidLedgers = ledgers.filter(l =>
        l.code === "1001" ||
        l.name.toLowerCase().includes("bank") ||
        l.name.toLowerCase().includes("cash")
    )

    async function onSubmit(data: ContraInput) {
        if (data.fromLedgerId === data.toLedgerId) {
            form.setError("toLedgerId", { message: "Cannot transfer to the same account" })
            return
        }
        setIsLoading(true)
        try {
            const result = await updateContra(transactionId, data)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Contra entry updated")
                router.push("/admin/accounting/contra?tab=all")
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
                    <Link href="/admin/accounting/contra">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <CardTitle>Edit Contra Entry</CardTitle>
                        <CardDescription>Update fund transfer between Cash and Bank accounts.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-6">
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
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
                                name="amount"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Amount (₹) *</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" min="1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center bg-slate-50 p-6 rounded-lg border">
                            <div className="md:col-span-2">
                                <FormField
                                    control={form.control}
                                    name="fromLedgerId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-red-600 font-bold">From Account (CR) *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-white border-red-200">
                                                        <SelectValue placeholder="Source" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {liquidLedgers.map(l => (
                                                        <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex justify-center md:col-span-1 pt-6 text-slate-400">
                                <ArrowRightLeft className="w-8 h-8" />
                            </div>
                            <div className="md:col-span-2">
                                <FormField
                                    control={form.control}
                                    name="toLedgerId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-emerald-600 font-bold">To Account (DR) *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-white border-emerald-200">
                                                        <SelectValue placeholder="Destination" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {liquidLedgers.map(l => (
                                                        <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="narration"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Narration / Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Cash deposited into Bank..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-4">
                            <Link href="/admin/accounting/contra">
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
