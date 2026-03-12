"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createLedgerSchema, CreateLedgerInput } from "@/types"
import { toast } from "sonner"
import { submitLedger, getNextLedgerCode } from "@/app/actions/ledgers"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Loader2, Plus } from "lucide-react"

export function LedgerForm({ groups }: { groups: any[] }) {
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<CreateLedgerInput>({
        resolver: zodResolver(createLedgerSchema) as any,
        defaultValues: {
            name: "",
            code: "",
            groupId: "",
            description: "",
            openingBalance: 0,
            openingType: "DR",
        },
    })

    const selectedGroupId = form.watch("groupId")

    useEffect(() => {
        async function fetchNextCode() {
            if (!selectedGroupId) return
            
            try {
                const result = await getNextLedgerCode(selectedGroupId)
                if (result.code) {
                    form.setValue("code", result.code)
                }
            } catch (error) {
                console.error("Failed to fetch next code:", error)
            }
        }
        
        fetchNextCode()
    }, [selectedGroupId, form])

    async function onSubmit(data: CreateLedgerInput) {
        setIsLoading(true)
        try {
            const result = await submitLedger(data)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success("Ledger created successfully")
                form.reset()
                setOpen(false)
            }
        } catch (error) {
            toast.error("Internal error")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-sky-600 hover:bg-sky-700">
                    <Plus className="mr-2 h-4 w-4" /> Add Ledger
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Custom Ledger</DialogTitle>
                    <DialogDescription>
                        Add a new sub-account under an existing category.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ledger Name *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Electricity Bill" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="groupId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Group Category *</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select group" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {groups.filter(g => g.name !== "Members").map(g => (
                                                <SelectItem key={g.id} value={g.id}>{g.name} ({g.nature})</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Unique Code *</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. 5205" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="openingBalance"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Opening Bal (₹)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" min="0" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="openingType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>DR/CR</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="DR">Debit (Dr)</SelectItem>
                                                <SelectItem value="CR">Credit (Cr)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button type="submit" disabled={isLoading} className="bg-sky-600 hover:bg-sky-700 w-full text-white">
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Ledger
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
