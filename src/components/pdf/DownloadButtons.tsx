"use client"

import { Button } from "@/components/ui/button"
import { Download, Loader2, Share2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export function DownloadCardButton({ memberId, status }: { memberId: string; status: string }) {
    const [loading, setLoading] = useState(false)

    async function handleDownload() {
        setLoading(true)
        try {
            const res = await fetch(`/api/pdf/membership-card/${memberId}`)
            if (!res.ok) {
                const data = await res.json()
                toast.error(data.error || "Failed to generate card")
                return
            }
            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `membership-card.pdf`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            toast.success("Membership card downloaded!")
        } catch {
            toast.error("Failed to download card")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="outline"
            className="border-sky-200 text-sky-700 hover:bg-sky-50"
            onClick={handleDownload}
            disabled={loading}
        >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            {status.charAt(0) + status.slice(1).toLowerCase()} ID Card
        </Button>
    )
}

export interface ReceiptButtonProps {
    transactionId: string
    referenceNo: string
    mobile?: string | null
    variant?: "ghost" | "outline" | "default" | "secondary" | "destructive" | "link"
    size?: "default" | "sm" | "lg" | "icon"
    className?: string
}

export function DownloadReceiptButton({ transactionId, referenceNo }: { transactionId: string; referenceNo: string }) {
    const [loading, setLoading] = useState(false)

    async function handleDownload() {
        setLoading(true)
        try {
            const res = await fetch(`/api/pdf/receipt/${transactionId}`)
            if (!res.ok) {
                const data = await res.json()
                toast.error(data.error || "Failed to generate receipt")
                return
            }
            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `receipt-${referenceNo}.pdf`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
            toast.success("Receipt downloaded!")
        } catch {
            toast.error("Failed to download receipt")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-sky-600"
            onClick={handleDownload}
            disabled={loading}
            title="Download PDF"
        >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
        </Button>
    )
}

export function ShareReceiptButton({ transactionId, referenceNo, mobile }: { transactionId: string; referenceNo: string; mobile?: string | null }) {
    const [loading, setLoading] = useState(false)

    async function handleShare() {
        setLoading(true)
        try {
            const res = await fetch(`/api/pdf/receipt/${transactionId}`)
            if (!res.ok) {
                const data = await res.json()
                toast.error(data.error || "Failed to generate receipt for sharing")
                return
            }
            const blob = await res.blob()
            const file = new File([blob], `receipt-${referenceNo}.pdf`, { type: "application/pdf" })

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: `Receipt ${referenceNo}`,
                    text: `Here is your receipt ${referenceNo}`,
                    files: [file]
                })
                toast.success("Receipt shared!")
            } else {
                // Fallback to WhatsApp text link without file
                const text = encodeURIComponent(`Here is your receipt reference number: ${referenceNo}. Please contact us if you need the PDF copy.`)
                let waUrl = `https://wa.me/?text=${text}`
                
                if (mobile) {
                    const cleanMobile = mobile.replace(/\D/g, '')
                    // Assuming India by default if 10 digits
                    const finalMobile = cleanMobile.length === 10 ? `91${cleanMobile}` : cleanMobile
                    waUrl = `https://wa.me/${finalMobile}?text=${text}`
                }
                
                window.open(waUrl, '_blank')
                toast.success("Opened WhatsApp (file sharing not supported)")
            }
        } catch (error: any) {
            // share API sometimes throws AbortError when user intentionally cancels
            if (error.name !== 'AbortError') {
                toast.error("Failed to share receipt")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
            onClick={handleShare}
            disabled={loading}
            title="Share on WhatsApp"
        >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Share2 className="h-3 w-3" />}
        </Button>
    )
}

export function DownloadPaymentButton({ transactionId, referenceNo, variant = "ghost", size = "sm", className }: ReceiptButtonProps) {
    const [isGenerating, setIsGenerating] = useState(false)

    const handleDownload = async () => {
        setIsGenerating(true)
        try {
            const response = await fetch(`/api/pdf/payment/${transactionId}`)
            if (!response.ok) throw new Error("Failed to generate PDF")
            
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `payment-${referenceNo}.pdf`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            console.error("Download error:", error)
            toast.error("Could not download payment voucher")
        } finally {
            setIsGenerating(false)
        }
    }

    const isIconButton = size === "sm" && !className?.includes("w-auto")

    return (
        <Button 
            variant={variant} 
            size={size} 
            className={className || (isIconButton ? "h-7 w-7 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50" : "border-rose-200 text-rose-700 hover:bg-rose-50")}
            onClick={(e) => {
                e.stopPropagation()
                handleDownload()
            }}
            disabled={isGenerating}
            title="Download Payment Voucher"
        >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {!isIconButton && <span className="ml-2">Download Voucher</span>}
        </Button>
    )
}

export function SharePaymentButton({ transactionId, referenceNo, mobile, variant = "ghost", size = "sm", className }: ReceiptButtonProps) {
    const [isSharing, setIsSharing] = useState(false)

    const handleShare = async () => {
        setIsSharing(true)
        try {
            const response = await fetch(`/api/pdf/payment/${transactionId}`)
            if (!response.ok) throw new Error("Failed to generate PDF")
            
            const blob = await response.blob()
            const file = new File([blob], `payment-${referenceNo}.pdf`, { type: "application/pdf" })

            if (navigator.share) {
                await navigator.share({
                    files: [file],
                    title: "Payment Voucher",
                    text: `Payment Voucher for ${referenceNo} from Town Team Sports Club`,
                })
            } else {
                toast.error("Web Share API not supported on this browser")
            }
        } catch (error) {
            console.error("Share error:", error)
            if (error instanceof Error && error.name !== 'AbortError') {
                toast.error("Could not share payment voucher")
            }
        } finally {
            setIsSharing(false)
        }
    }

    const isIconButton = size === "sm" && !className?.includes("w-auto")

    return (
        <Button 
            variant={variant} 
            size={size} 
            className={className || (isIconButton ? "h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" : "border-emerald-200 text-emerald-700 hover:bg-emerald-50")} 
            onClick={(e) => {
                e.stopPropagation()
                handleShare()
            }}
            disabled={isSharing}
            title="Share on WhatsApp"
        >
            {isSharing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
            {!isIconButton && <span className="ml-2">Share WhatsApp</span>}
        </Button>
    )
}
