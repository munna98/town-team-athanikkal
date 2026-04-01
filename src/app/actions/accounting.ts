"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { createJournalEntry } from "@/lib/accounting"
import { recalculateMemberStatus } from "@/lib/membership"
import { Decimal } from "@prisma/client/runtime/library"
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
            narration: parsed.narration ?? "",
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
            include: { member: { select: { mobile: true } } },
        })
        if (creditedLedger?.memberId) {
            await recalculateMemberStatus(creditedLedger.memberId)
        }

        revalidatePath("/admin/accounting/receipts")
        revalidatePath("/admin/accounting/reports")
        revalidatePath("/admin/members")
        return { 
            success: true, 
            transactionId: transaction.id,
            referenceNo: transaction.referenceNo,
            mobile: creditedLedger?.member?.mobile || undefined
        }
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
            narration: parsed.narration ?? "",
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
            narration: parsed.narration ?? "",
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
            narration: parsed.narration ?? "",
            createdById: session.user.id,
            lines: parsed.lines
        })

        // Recalculate status for all involved members
        const ledgers = await prisma.ledger.findMany({
            where: { id: { in: parsed.lines.map(l => l.ledgerId) } }
        })
        const memberIds = ledgers.map(l => l.memberId).filter(Boolean) as string[]
        for (const mid of memberIds) {
            await recalculateMemberStatus(mid)
        }

        revalidatePath("/admin/accounting/journal")
        revalidatePath("/admin/accounting/reports")
        revalidatePath("/admin/members")
        return { success: true, transactionId: transaction.id }
    } catch (error: any) {
        return { error: error.message || "Failed to submit journal" }
    }
}

// ─── List Transactions (paginated) ───────────────────────────────────────────

export async function getTransactions({
    type,
    page = 1,
    search = "",
    pageSize = 15,
    fromDate,
    toDate,
    collectedBy,
}: {
    type: "RECEIPT" | "PAYMENT" | "CONTRA" | "JOURNAL"
    page?: number
    search?: string
    pageSize?: number
    fromDate?: string
    toDate?: string
    collectedBy?: string
}) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const skip = (page - 1) * pageSize
    const where: any = {
        type,
        ...(search ? {
            OR: [
                { referenceNo: { contains: search, mode: "insensitive" } },
                { narration: { contains: search, mode: "insensitive" } },
            ]
        } : {}),
        ...(fromDate && toDate ? {
            date: {
                gte: new Date(fromDate),
                lte: new Date(toDate),
            }
        } : fromDate ? {
            date: { gte: new Date(fromDate) }
        } : toDate ? {
            date: { lte: new Date(toDate) }
        } : {}),
        ...(collectedBy ? { collectedById: collectedBy } : {})
    }

    const [transactions, total] = await Promise.all([
        prisma.transaction.findMany({
            where,
            include: {
                lines: {
                    include: { ledger: { select: { id: true, name: true, code: true } } }
                },
                collectedBy: { select: { id: true, name: true } },
                createdBy: { select: { id: true, email: true } },
                updatedBy: { select: { id: true, email: true } },
            },
            orderBy: { date: "desc" },
            skip,
            take: pageSize,
        }),
        prisma.transaction.count({ where }),
    ])

    return {
        transactions: JSON.parse(JSON.stringify(transactions)),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
    }
}

// ─── Get Single Transaction ───────────────────────────────────────────────────

export async function getTransactionById(id: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const transaction = await prisma.transaction.findUnique({
        where: { id },
        include: {
            lines: {
                include: { ledger: { select: { id: true, name: true, code: true } } }
            },
            collectedBy: { select: { id: true, name: true } },
            createdBy: { select: { id: true, email: true } },
            updatedBy: { select: { id: true, email: true } },
        },
    })
    if (!transaction) throw new Error("Transaction not found")
    return JSON.parse(JSON.stringify(transaction))
}

// ─── Update Receipt ───────────────────────────────────────────────────────────

export async function updateReceipt(id: string, data: z.infer<typeof receiptSchema>) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    try {
        const parsed = receiptSchema.parse(data)

        const debitLedgerCode = parsed.cashOrBank === "CASH" ? "1001" : "1002"
        const debitLedger = await prisma.ledger.findUnique({ where: { code: debitLedgerCode } })
        if (!debitLedger) throw new Error(`${parsed.cashOrBank} ledger not found`)


        // 1. Find existing transaction to see if member changed
        const oldTransaction = await prisma.transaction.findUnique({
            where: { id },
            include: { lines: { include: { ledger: true } } }
        })
        const oldMemberId = oldTransaction?.lines.find(l => Number(l.credit) > 0)?.ledger?.memberId

        await prisma.$transaction(async (tx) => {
            await tx.transactionLine.deleteMany({ where: { transactionId: id } })
            await tx.transaction.update({
                where: { id },
                data: {
                    date: new Date(parsed.date),
                    narration: parsed.narration ?? "",
                    totalAmount: new Decimal(parsed.amount),
                    collectedById: parsed.collectedById || null,
                    updatedById: session.user.id,
                    lines: {
                        create: [
                            { ledgerId: debitLedger.id, debit: new Decimal(parsed.amount), credit: new Decimal(0) },
                            { ledgerId: parsed.incomeLedgerId, debit: new Decimal(0), credit: new Decimal(parsed.amount) },
                        ]
                    }
                }
            })
        })

        // 2. Recalculate status for the old member (if any)
        if (oldMemberId) {
            await recalculateMemberStatus(oldMemberId)
        }

        // 3. Recalculate status for the new member (if different and exists)
        const creditedLedger = await prisma.ledger.findUnique({ where: { id: parsed.incomeLedgerId } })
        if (creditedLedger?.memberId && creditedLedger.memberId !== oldMemberId) {
            await recalculateMemberStatus(creditedLedger.memberId)
        }

        revalidatePath("/admin/accounting/receipts")
        revalidatePath("/admin/accounting/reports")
        revalidatePath("/admin/members")
        return { success: true }
    } catch (error: any) {
        return { error: error.message || "Failed to update receipt" }
    }
}

// ─── Update Payment ───────────────────────────────────────────────────────────

export async function updatePayment(id: string, data: z.infer<typeof paymentSchema>) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    try {
        const parsed = paymentSchema.parse(data)

        const creditLedgerCode = parsed.cashOrBank === "CASH" ? "1001" : "1002"
        const creditLedger = await prisma.ledger.findUnique({ where: { code: creditLedgerCode } })
        if (!creditLedger) throw new Error(`${parsed.cashOrBank} ledger not found`)


        await prisma.$transaction(async (tx) => {
            await tx.transactionLine.deleteMany({ where: { transactionId: id } })
            await tx.transaction.update({
                where: { id },
                data: {
                    date: new Date(parsed.date),
                    narration: parsed.narration ?? "",
                    totalAmount: new Decimal(parsed.amount),
                    updatedById: session.user.id,
                    lines: {
                        create: [
                            { ledgerId: parsed.expenseLedgerId, debit: new Decimal(parsed.amount), credit: new Decimal(0) },
                            { ledgerId: creditLedger.id, debit: new Decimal(0), credit: new Decimal(parsed.amount) },
                        ]
                    }
                }
            })
        })

        revalidatePath("/admin/accounting/payments")
        revalidatePath("/admin/accounting/reports")
        return { success: true }
    } catch (error: any) {
        return { error: error.message || "Failed to update payment" }
    }
}

// ─── Update Contra ────────────────────────────────────────────────────────────

export async function updateContra(id: string, data: z.infer<typeof contraSchema>) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    try {
        const parsed = contraSchema.parse(data)

        await prisma.$transaction(async (tx) => {
            await tx.transactionLine.deleteMany({ where: { transactionId: id } })
            await tx.transaction.update({
                where: { id },
                data: {
                    date: new Date(parsed.date),
                    narration: parsed.narration ?? "",
                    totalAmount: new Decimal(parsed.amount),
                    updatedById: session.user.id,
                    lines: {
                        create: [
                            { ledgerId: parsed.toLedgerId, debit: new Decimal(parsed.amount), credit: new Decimal(0) },
                            { ledgerId: parsed.fromLedgerId, debit: new Decimal(0), credit: new Decimal(parsed.amount) },
                        ]
                    }
                }
            })
        })

        revalidatePath("/admin/accounting/contra")
        revalidatePath("/admin/accounting/reports")
        return { success: true }
    } catch (error: any) {
        return { error: error.message || "Failed to update contra" }
    }
}

// ─── Update Journal ───────────────────────────────────────────────────────────

export async function updateJournal(id: string, data: z.infer<typeof journalSchema>) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    try {
        const parsed = journalSchema.parse(data)

        const totalDebit = parsed.lines.reduce((acc, l) => acc + l.debit, 0)
        const totalCredit = parsed.lines.reduce((acc, l) => acc + l.credit, 0)
        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            throw new Error("Debits and Credits must be equal")
        }


        // 1. Identify all affected members (old and new)
        const oldTransaction = await prisma.transaction.findUnique({
            where: { id },
            include: { lines: { include: { ledger: true } } }
        })
        const oldMemberIds = oldTransaction?.lines.map(l => l.ledger?.memberId).filter(Boolean) as string[]
        
        await prisma.$transaction(async (tx) => {
            await tx.transactionLine.deleteMany({ where: { transactionId: id } })
            await tx.transaction.update({
                where: { id },
                data: {
                    date: new Date(parsed.date),
                    narration: parsed.narration ?? "",
                    totalAmount: new Decimal(totalDebit),
                    updatedById: session.user.id,
                    lines: {
                        create: parsed.lines.map(l => ({
                            ledgerId: l.ledgerId,
                            debit: new Decimal(l.debit),
                            credit: new Decimal(l.credit),
                            description: l.description || null,
                        }))
                    }
                }
            })
        })

        // 2. Recalculate status for all involved members
        const newLedgers = await prisma.ledger.findMany({
            where: { id: { in: parsed.lines.map(l => l.ledgerId) } }
        })
        const newMemberIds = newLedgers.map(l => l.memberId).filter(Boolean) as string[]
        
        const allMemberIds = Array.from(new Set([...oldMemberIds, ...newMemberIds]))
        for (const mid of allMemberIds) {
            await recalculateMemberStatus(mid)
        }

        revalidatePath("/admin/accounting/journal")
        revalidatePath("/admin/accounting/reports")
        revalidatePath("/admin/members")
        return { success: true }
    } catch (error: any) {
        return { error: error.message || "Failed to update journal" }
    }
}

// ─── Delete Transaction ───────────────────────────────────────────────────────

export async function deleteTransaction(id: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    try {
        // 1. Find existing transaction to see which members are involved
        const oldTransaction = await prisma.transaction.findUnique({
            where: { id },
            include: { lines: { include: { ledger: true } } }
        })
        if (!oldTransaction) throw new Error("Transaction not found")

        const oldMemberIds = oldTransaction.lines
            .map(l => l.ledger?.memberId)
            .filter(Boolean) as string[]
        const uniqueMemberIds = Array.from(new Set(oldMemberIds))

        // 2. Delete lines and transaction in a transaction to ensure integrity
        await prisma.$transaction([
            prisma.transactionLine.deleteMany({ where: { transactionId: id } }),
            prisma.transaction.delete({ where: { id } })
        ])

        // 3. Recalculate status for the old members
        for (const mid of uniqueMemberIds) {
            await recalculateMemberStatus(mid)
        }

        // Revalidate all accounting related paths
        revalidatePath("/admin/accounting/receipts")
        revalidatePath("/admin/accounting/payments")
        revalidatePath("/admin/accounting/contra")
        revalidatePath("/admin/accounting/journal")
        revalidatePath("/admin/accounting/reports")
        revalidatePath("/admin/members")
        
        return { success: true }
    } catch (error: any) {
        return { error: error.message || "Failed to delete transaction" }
    }
}
