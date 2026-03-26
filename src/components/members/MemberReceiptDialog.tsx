"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { ReceiptText, Plus } from "lucide-react"
import { ReceiptForm } from "../accounting/ReceiptForm"

interface MemberReceiptDialogProps {
    memberId: string
    memberName: string
    ledgerId: string
    ledgers: any[]
    executives: any[]
    triggerVariant?: "button" | "icon" | "link" | "menu"
}

export function MemberReceiptDialog({
    memberId,
    memberName,
    ledgerId,
    ledgers,
    executives,
    triggerVariant = "button"
}: MemberReceiptDialogProps) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {triggerVariant === "icon" ? (
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-emerald-600" title="Direct Receipt">
                        <ReceiptText className="h-4 w-4" />
                    </Button>
                ) : triggerVariant === "menu" ? (
                    <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                        <ReceiptText className="h-4 w-4" />
                        Record Receipt
                    </DropdownMenuItem>
                ) : triggerVariant === "link" ? (
                    <Button variant="link" className="text-sky-600">
                        Record a Receipt
                    </Button>
                ) : (
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="mr-2 h-4 w-4" /> Receive Cash
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Record Receipt: {memberName}</DialogTitle>
                    <DialogDescription>
                        Directly record a payment received from this member.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="mt-4">
                    {/* We pass a specialized prop or handle preselection via searchParams if we logic it out, 
                        but here we can just ensure the form picks up the ledgerId.
                        Wait, ReceiptForm uses searchParams for preselection. 
                        In a dialog, searchParams might not be what we want.
                        Let's modify ReceiptForm to also accept a direct initialLedgerId prop.
                    */}
                    <ReceiptForm 
                        ledgers={ledgers} 
                        executives={executives} 
                        embedded={true}
                        initialLedgerId={ledgerId}
                        autoFocusAmount={true}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}
