"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { createJournalEntry } from "@/lib/accounting"
import { recalculateMemberStatus } from "@/lib/membership"
import {
    receiptSchema,
    paymentSchema,
    contraSchema,
    journalSchema
} from "@/types"

export async function submitReceipt(data: z.infer<typeof receiptSchema>) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    try {
        const parsed = receiptSchema.parse(data)

        // Find cash/bank ledger
        const debitLedgerCode = parsed.cashOrBank === "CASH" ? "1001" : "1002"
        const debitLedger = await prisma.ledger.findUnique({ where: { code: debitLedgerCode } })
        if (!debitLedger) throw new Error(`${parsed.cashOrBank} ledger not found`)

        // Create journal entry
        // DR: Cash/Bank
        // CR: incomeLedgerId (which could be a member income ledger or a generic income ledger)
        const transaction = await createJournalEntry({
            type: "RECEIPT",
            date: new Date(parsed.date),
            narration: parsed.narration,
            createdById: session.user.id,
            collectedById: parsed.collectedById,
            lines: [
                { ledgerId: debitLedger.id, debit: parsed.amount, credit: 0 },
                { ledgerId: parsed.incomeLedgerId, debit: 0, credit: parsed.amount },
            ]
        })

        // Auto-detect if credited ledger is a member ledger and recalculate status
        const creditedLedger = await prisma.ledger.findUnique({
            where: { id: parsed.incomeLedgerId },
            select: { memberId: true },
        })
        if (creditedLedger?.memberId) {
            await recalculateMemberStatus(creditedLedger.memberId)
        }

        revalidatePath("/admin/accounting/receipts")
        revalidatePath("/admin/accounting/reports")
        return { success: true, transactionId: transaction.id }
    } catch (error: any) {
        return { error: error.message || "Failed to submit receipt" }
    }
}

export async function submitPayment(data: z.infer<typeof paymentSchema>) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    try {
        const parsed = paymentSchema.parse(data)

        // Find cash/bank ledger
        const creditLedgerCode = parsed.cashOrBank === "CASH" ? "1001" : "1002"
        const creditLedger = await prisma.ledger.findUnique({ where: { code: creditLedgerCode } })
        if (!creditLedger) throw new Error(`${parsed.cashOrBank} ledger not found`)

        // DR: Expense ledger
        // CR: Cash/Bank
        const transaction = await createJournalEntry({
            type: "PAYMENT",
            date: new Date(parsed.date),
            narration: parsed.narration,
            createdById: session.user.id,
            lines: [
                { ledgerId: parsed.expenseLedgerId, debit: parsed.amount, credit: 0 },
                { ledgerId: creditLedger.id, debit: 0, credit: parsed.amount },
            ]
        })

        revalidatePath("/admin/accounting/payments")
        revalidatePath("/admin/accounting/reports")
        return { success: true, transactionId: transaction.id }
    } catch (error: any) {
        return { error: error.message || "Failed to submit payment" }
    }
}

export async function submitContra(data: z.infer<typeof contraSchema>) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    try {
        const parsed = contraSchema.parse(data)

        // DR: Dest account (toLedgerId)
        // CR: Source account (fromLedgerId)
        const transaction = await createJournalEntry({
            type: "CONTRA",
            date: new Date(parsed.date),
            narration: parsed.narration,
            createdById: session.user.id,
            lines: [
                { ledgerId: parsed.toLedgerId, debit: parsed.amount, credit: 0 },
                { ledgerId: parsed.fromLedgerId, debit: 0, credit: parsed.amount },
            ]
        })

        revalidatePath("/admin/accounting/contra")
        revalidatePath("/admin/accounting/reports")
        return { success: true, transactionId: transaction.id }
    } catch (error: any) {
        return { error: error.message || "Failed to submit contra" }
    }
}

export async function submitJournal(data: z.infer<typeof journalSchema>) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    try {
        const parsed = journalSchema.parse(data)

        // Validate balance before even calling createJournalEntry
        const totalDebit = parsed.lines.reduce((acc, line) => acc + line.debit, 0)
        const totalCredit = parsed.lines.reduce((acc, line) => acc + line.credit, 0)
        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            throw new Error("Debits and Credits must be equal")
        }

        const transaction = await createJournalEntry({
            type: "JOURNAL",
            date: new Date(parsed.date),
            narration: parsed.narration,
            createdById: session.user.id,
            lines: parsed.lines
        })

        revalidatePath("/admin/accounting/journal")
        revalidatePath("/admin/accounting/reports")
        return { success: true, transactionId: transaction.id }
    } catch (error: any) {
        return { error: error.message || "Failed to submit journal" }
    }
}
