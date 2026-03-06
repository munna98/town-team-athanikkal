import { NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { ReceiptPDF } from "@/components/pdf/ReceiptPDF"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import React from "react"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const resolvedParams = await params
    const { id } = resolvedParams

    try {
        const transaction = await prisma.transaction.findUnique({
            where: { id },
            include: {
                lines: {
                    include: { ledger: { include: { group: true, member: true } } },
                },
                createdBy: true,
                collectedBy: true,
            },
        })

        if (!transaction) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
        }

        if (transaction.type !== "RECEIPT") {
            return NextResponse.json({ error: "Only receipt transactions can generate receipt PDFs" }, { status: 400 })
        }

        // Find the credit line (income/party side)
        const creditLine = transaction.lines.find(l => Number(l.credit) > 0)
        const creditAccountName = creditLine?.ledger.name || "Unknown"

        // Get member info from the credited ledger's linked member (if any)
        const linkedMember = creditLine?.ledger.member

        const requestUrl = new URL(req.url)
        const logoUrl = `${requestUrl.protocol}//${requestUrl.host}/logo.png`

        const pdfElement = React.createElement(ReceiptPDF, {
            logoUrl: logoUrl,
            referenceNo: transaction.referenceNo,
            date: transaction.date.toISOString(),
            memberName: linkedMember?.name,
            memberCode: linkedMember?.membershipCode,
            narration: transaction.narration,
            amount: Number(transaction.totalAmount),
            cashOrBank: transaction.lines.some(l => l.ledger.code === "1001" && Number(l.debit) > 0) ? "CASH" : "BANK",
            collectedBy: transaction.collectedBy?.name || "N/A",
            creditAccount: creditAccountName,
        })

        const buffer = await renderToBuffer(pdfElement as any)

        return new NextResponse(buffer as any, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="receipt-${transaction.referenceNo}.pdf"`,
            },
        })
    } catch (error: any) {
        console.error("Receipt PDF error:", error)
        return NextResponse.json({ error: error.message || "Failed to generate PDF" }, { status: 500 })
    }
}

