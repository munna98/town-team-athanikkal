"use client"

import React, { useState } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { 
    MoreVertical, Eye, Pencil, Trash2, Download, Share2, Loader2 
} from "lucide-react"
import Link from "next/link"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteTransaction } from "@/app/actions/accounting"
import { toast } from "sonner"

interface Props {
    txn: any
    type: "RECEIPT" | "PAYMENT" | "CONTRA" | "JOURNAL"
    editBasePath: string
    showPdf?: boolean
    onDelete?: () => void
}

export function TransactionActions({ txn, type, editBasePath, showPdf = false, onDelete }: Props) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
    const [isSharing, setIsSharing] = useState(false)

    function getMemberMobile(txn: any) {
        if (!txn.lines) return null
        if (txn.type === "RECEIPT") {
            const line = txn.lines.find((l: any) => Number(l.credit) > 0 && l.ledger?.member?.mobile)
            return line?.ledger?.member?.mobile || null
        }
        if (txn.type === "PAYMENT") {
            const line = txn.lines.find((l: any) => Number(l.debit) > 0 && l.ledger?.member?.mobile)
            return line?.ledger?.member?.mobile || null
        }
        return null
    }

    const handleDownload = async () => {
        setIsGeneratingPdf(true)
        try {
            const endpoint = type === "RECEIPT" ? `/api/pdf/receipt/${txn.id}` : `/api/pdf/payment/${txn.id}`
            const filename = `${type.toLowerCase()}-${txn.referenceNo}.pdf`
            
            const response = await fetch(endpoint)
            if (!response.ok) throw new Error("Failed to generate PDF")
            
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = filename
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            toast.success("Voucher downloaded successfully")
        } catch (error) {
            console.error("Download error:", error)
            toast.error("Could not download voucher")
        } finally {
            setIsGeneratingPdf(false)
        }
    }

    const handleShare = async () => {
        setIsSharing(true)
        try {
            const mobile = getMemberMobile(txn)
            const endpoint = type === "RECEIPT" ? `/api/pdf/receipt/${txn.id}` : `/api/pdf/payment/${txn.id}`
            
            if (mobile) {
                const cleanMobile = mobile.replace(/\D/g, '')
                const finalMobile = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile
                const downloadUrl = `${window.location.origin}${endpoint}`
                const text = encodeURIComponent(`Hello, here is your ${type.toLowerCase()} voucher ${txn.referenceNo} from Town Team Sports Club.\n\nDownload here: ${downloadUrl}`)
                const waUrl = `https://wa.me/${finalMobile}?text=${text}`
                window.open(waUrl, '_blank')
                toast.success("Opening WhatsApp chat...")
                setIsSharing(false)
                return
            }

            const response = await fetch(endpoint)
            if (!response.ok) throw new Error("Failed to generate PDF")
            
            const blob = await response.blob()
            const filename = `${type.toLowerCase()}-${txn.referenceNo}.pdf`
            const file = new File([blob], filename, { type: "application/pdf" })

            if (navigator.share) {
                await navigator.share({
                    files: [file],
                    title: `${type} Voucher`,
                    text: `${type} Voucher for ${txn.referenceNo} from Town Team Sports Club`,
                })
            } else {
                const downloadUrl = `${window.location.origin}${endpoint}`
                const text = encodeURIComponent(`Here is your ${type.toLowerCase()} voucher reference number: ${txn.referenceNo}.\n\nDownload PDF: ${downloadUrl}`)
                const waUrl = `https://wa.me/?text=${text}`
                window.open(waUrl, '_blank')
                toast.success("Opened WhatsApp (file sharing not supported)")
            }
        } catch (error) {
            console.error("Share error:", error)
            if (error instanceof Error && error.name !== 'AbortError') {
                toast.error("Could not share voucher")
            }
        } finally {
            setIsSharing(false)
        }
    }

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const res = await deleteTransaction(txn.id)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success("Transaction deleted successfully")
                onDelete?.()
            }
        } catch (err) {
            toast.error("An error occurred during deletion")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open actions</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                
                <DropdownMenuItem asChild>
                    <Link href={`${editBasePath}/${txn.id}`} className="flex items-center gap-2 cursor-pointer">
                        <Eye className="h-4 w-4 text-slate-500" />
                        <span>View Details</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                    <Link href={`${editBasePath}/${txn.id}/edit`} className="flex items-center gap-2 cursor-pointer">
                        <Pencil className="h-4 w-4 text-sky-500" />
                        <span>Edit Transaction</span>
                    </Link>
                </DropdownMenuItem>

                {showPdf && (type === "RECEIPT" || type === "PAYMENT") && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            onClick={handleDownload} 
                            disabled={isGeneratingPdf}
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            {isGeneratingPdf ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="h-4 w-4 text-emerald-500" />
                            )}
                            <span>Download PDF</span>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                            onClick={handleShare} 
                            disabled={isSharing}
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            {isSharing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Share2 className="h-4 w-4 text-emerald-500" />
                            )}
                            <span>Share on WhatsApp</span>
                        </DropdownMenuItem>
                    </>
                )}

                <DropdownMenuSeparator />
                
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <DropdownMenuItem 
                            onSelect={(e) => e.preventDefault()}
                            className="flex items-center gap-2 cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                        </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete transaction <strong>{txn.referenceNo}</strong>. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleDelete()
                                }}
                                disabled={isDeleting}
                                className="bg-rose-600 hover:bg-rose-700 text-white"
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
