"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Loader2, Edit2, Info } from "lucide-react"
import { updateTier } from "./actions"

interface Tier {
    id: string
    name: string
    threshold: number | any
    backgroundColor: string | null
    textColor: string | null
    description: string | null
}

export function TierClient({ tiers }: { tiers: Tier[] }) {
    const router = useRouter()
    const [editTier, setEditTier] = useState<Tier | null>(null)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        threshold: 0,
        backgroundColor: "",
        textColor: "",
        description: ""
    })

    const openEdit = (tier: Tier) => {
        setEditTier(tier)
        setFormData({
            name: tier.name,
            threshold: Number(tier.threshold),
            backgroundColor: tier.backgroundColor || "",
            textColor: tier.textColor || "",
            description: tier.description || ""
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editTier) return
        
        setLoading(true)
        const res = await updateTier(editTier.id, formData)
        setLoading(false)

        if (res.success) {
            setEditTier(null)
            router.refresh()
        } else {
            alert(res.error || "Failed to update tier")
        }
    }

    return (
        <div className="space-y-4">

            
            <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead>Tier Name</TableHead>
                            <TableHead>Preview</TableHead>
                            <TableHead className="text-right">Minimum Paid (₹)</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tiers.map(tier => (
                            <TableRow key={tier.id}>
                                <TableCell className="font-semibold text-slate-800">{tier.name}</TableCell>
                                <TableCell>
                                    <Badge style={{ backgroundColor: tier.backgroundColor || "#e2e8f0", color: tier.textColor || "#1e293b" }} className="border-none px-3 py-1">
                                        {tier.name}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {formatCurrency(Number(tier.threshold))}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" onClick={() => openEdit(tier)}>
                                        <Edit2 className="h-4 w-4 mr-2" /> Edit
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={!!editTier} onOpenChange={(open) => !open && setEditTier(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Tier: {editTier?.name}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Display Name</Label>
                            <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="threshold">Payment Threshold (₹)</Label>
                            <Input id="threshold" type="number" min="0" step="1" value={formData.threshold} onChange={(e) => setFormData({ ...formData, threshold: Number(e.target.value) })} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Background Color (Hex)</Label>
                                <div className="flex gap-2">
                                    <Input value={formData.backgroundColor} onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })} placeholder="#ffffff" required />
                                    <input type="color" value={formData.backgroundColor} onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })} className="h-10 w-10 p-1 rounded border cursor-pointer" />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Text Color (Hex)</Label>
                                <div className="flex gap-2">
                                    <Input value={formData.textColor} onChange={(e) => setFormData({ ...formData, textColor: e.target.value })} placeholder="#000000" required />
                                    <input type="color" value={formData.textColor} onChange={(e) => setFormData({ ...formData, textColor: e.target.value })} className="h-10 w-10 p-1 rounded border cursor-pointer" />
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="mt-4">
                            <Button type="button" variant="outline" onClick={() => setEditTier(null)}>Cancel</Button>
                            <Button type="submit" disabled={loading} className="bg-sky-600 hover:bg-sky-700">
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
