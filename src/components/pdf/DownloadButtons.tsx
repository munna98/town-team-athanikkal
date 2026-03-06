"use client"

import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
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
            {status === "GOLD" ? "Gold ID Card" : "Basic ID Card"}
        </Button>
    )
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
            className="h-7 text-sky-600"
            onClick={handleDownload}
            disabled={loading}
        >
            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3 mr-1" />}
            PDF
        </Button>
    )
}
