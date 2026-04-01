import { NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { PaymentPDF } from "@/components/pdf/PaymentPDF"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import React from "react"

    const resolvedParams = await params
    const { id } = resolvedParams

    try {
        const transaction = await prisma.transaction.findUnique({
            where: { id },
            include: {
                lines: {
                    include: { ledger: true },
                },
                createdBy: true,
                collectedBy: true,
            },
        })

        if (!transaction) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
        }

        if (transaction.type !== "PAYMENT") {
            return NextResponse.json({ error: "Only payment transactions can generate payment PDFs" }, { status: 400 })
        }

        // Find the debit line (expense/liability side)
        const debitLine = transaction.lines.find(l => Number(l.debit) > 0)
        const ledgerName = debitLine?.ledger.name || "N/A"

        const requestUrl = new URL(req.url)
        const logoUrl = `${requestUrl.protocol}//${requestUrl.host}/logo.png`

        const pdfElement = React.createElement(PaymentPDF, {
            logoUrl: logoUrl,
            referenceNo: transaction.referenceNo,
            date: transaction.date.toISOString(),
            ledgerName: ledgerName,
            narration: transaction.narration,
            amount: Number(transaction.totalAmount),
        })

        const buffer = await renderToBuffer(pdfElement as any)

        return new NextResponse(buffer as any, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="payment-${transaction.referenceNo}.pdf"`,
            },
        })
    } catch (error) {
        console.error("Payment PDF error:", error)
        const message = error instanceof Error ? error.message : "Failed to generate PDF"
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
