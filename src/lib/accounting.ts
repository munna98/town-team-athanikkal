import prisma from "@/lib/prisma"
import { TransactionType, DrCr, Nature } from "@prisma/client"
import { Decimal } from "@prisma/client/runtime/library"

// ─── Reference Number Generation ─────────────────────────

const prefixMap: Record<TransactionType, string> = {
    RECEIPT: "REC",
    PAYMENT: "PAY",
    CONTRA: "CTR",
    JOURNAL: "JNL",
}

export async function generateReferenceNo(type: TransactionType): Promise<string> {
    const prefix = prefixMap[type]
    const last = await prisma.transaction.findFirst({
        where: { type },
        orderBy: { createdAt: "desc" },
        select: { referenceNo: true },
    })

    if (!last) return `${prefix}-001`
    const lastNum = parseInt(last.referenceNo.split("-")[1])
    const next = String(lastNum + 1).padStart(3, "0")
    return `${prefix}-${next}`
}

// ─── Ledger Balance ──────────────────────────────────────

export async function getLedgerBalance(ledgerId: string): Promise<number> {
    const ledger = await prisma.ledger.findUnique({
        where: { id: ledgerId },
        include: { group: true },
    })
    if (!ledger) throw new Error("Ledger not found")

    const result = await prisma.transactionLine.aggregate({
        where: { ledgerId },
        _sum: { debit: true, credit: true },
    })

    const totalDebit = Number(result._sum.debit || 0)
    const totalCredit = Number(result._sum.credit || 0)
    const openingBal = Number(ledger.openingBalance)
    const openingSign = ledger.openingType === "DR" ? 1 : -1

    // For ASSET/EXPENSE: balance = opening(DR+) + debits - credits
    // For LIABILITY/INCOME/EQUITY: balance = opening(CR+) + credits - debits
    const isDebitNature = ["ASSET", "EXPENSE"].includes(ledger.group.nature)

    if (isDebitNature) {
        return openingBal * openingSign + totalDebit - totalCredit
    } else {
        return openingBal * (openingSign === -1 ? 1 : -1) + totalCredit - totalDebit
    }
}

// ─── Create Journal Entry ────────────────────────────────

interface JournalEntryData {
    type: TransactionType
    date: Date
    narration: string
    collectedById?: string
    createdById: string
    lines: { ledgerId: string; debit: number; credit: number; description?: string }[]
}

export async function createJournalEntry(data: JournalEntryData) {
    // Validate balanced
    const totalDebit = data.lines.reduce((sum, l) => sum + l.debit, 0)
    const totalCredit = data.lines.reduce((sum, l) => sum + l.credit, 0)

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new Error(`Debits (${totalDebit}) must equal Credits (${totalCredit})`)
    }

    const referenceNo = await generateReferenceNo(data.type)

    return await prisma.$transaction(async (tx) => {
        const transaction = await tx.transaction.create({
            data: {
                referenceNo,
                type: data.type,
                date: data.date,
                narration: data.narration,
                totalAmount: new Decimal(totalDebit),
                createdById: data.createdById,
                collectedById: data.collectedById || null,
                lines: {
                    create: data.lines.map((line) => ({
                        ledgerId: line.ledgerId,
                        debit: new Decimal(line.debit),
                        credit: new Decimal(line.credit),
                        description: line.description || null,
                    })),
                },
            },
            include: { lines: true },
        })

        return transaction
    })
}

// ─── Trial Balance ───────────────────────────────────────

export async function getTrialBalance(from?: Date, to?: Date) {
    const dateFilter = from && to ? { date: { gte: from, lte: to } } : {}

    const ledgers = await prisma.ledger.findMany({
        include: { group: true },
        orderBy: { code: "asc" },
    })

    const rows = []
    for (const ledger of ledgers) {
        const result = await prisma.transactionLine.aggregate({
            where: {
                ledgerId: ledger.id,
                transaction: dateFilter,
            },
            _sum: { debit: true, credit: true },
        })

        const debit = Number(result._sum.debit || 0)
        const credit = Number(result._sum.credit || 0)

        // Include opening balance
        const opening = Number(ledger.openingBalance)
        const openingDebit = ledger.openingType === "DR" ? opening : 0
        const openingCredit = ledger.openingType === "CR" ? opening : 0

        const totalDebit = debit + openingDebit
        const totalCredit = credit + openingCredit

        if (totalDebit !== 0 || totalCredit !== 0) {
            rows.push({
                ledgerId: ledger.id,
                ledgerName: ledger.name,
                ledgerCode: ledger.code,
                groupName: ledger.group.name,
                nature: ledger.group.nature,
                debit: totalDebit,
                credit: totalCredit,
            })
        }
    }

    return rows
}

// ─── Ledger Statement ────────────────────────────────────

export async function getLedgerStatement(ledgerId: string, from?: Date, to?: Date) {
    const ledger = await prisma.ledger.findUnique({
        where: { id: ledgerId },
        include: { group: true },
    })
    if (!ledger) throw new Error("Ledger not found")

    const dateFilter = from && to ? { date: { gte: from, lte: to } } : {}

    // 1. Calculate balance up to 'from' date (if provided)
    let openingFromDate = 0
    if (from) {
        const preResult = await prisma.transactionLine.aggregate({
            where: {
                ledgerId,
                transaction: { date: { lt: from } }
            },
            _sum: { debit: true, credit: true }
        })
        const preDebit = Number(preResult._sum.debit || 0)
        const preCredit = Number(preResult._sum.credit || 0)
        openingFromDate = preDebit - preCredit
    }

    const lines = await prisma.transactionLine.findMany({
        where: {
            ledgerId,
            transaction: dateFilter,
        },
        include: {
            transaction: true,
        },
        orderBy: [
            { transaction: { date: "asc" } },
            { transaction: { createdAt: "asc" } } // Secondary sort for same-day priority
        ],
    })

    const openingVal = Number(ledger.openingBalance)
    const openingTypeSign = ledger.openingType === "DR" ? 1 : -1
    
    // Initial balance = Ledger Opening + Transactions before 'from'
    let runningBalance = (openingVal * openingTypeSign) + openingFromDate

    // The 'openingBalance' displayed in the report should be this runningBalance
    const initialBalanceForReport = runningBalance

    const statement = lines.map((line) => {
        const debit = Number(line.debit)
        const credit = Number(line.credit)
        runningBalance += debit - credit

        return {
            date: line.transaction.date,
            referenceNo: line.transaction.referenceNo,
            narration: line.transaction.narration,
            debit,
            credit,
            balance: runningBalance,
        }
    })

    return {
        ledger: {
            id: ledger.id,
            name: ledger.name,
            code: ledger.code,
            groupName: ledger.group.name,
            nature: ledger.group.nature,
        },
        openingBalance: Math.abs(initialBalanceForReport),
        openingType: initialBalanceForReport >= 0 ? "DR" : "CR",
        statement,
        closingBalance: runningBalance,
    }
}

// ─── Income & Expenditure ────────────────────────────────

export async function getIncomeExpenditure(from?: Date, to?: Date) {
    const trialBalance = await getTrialBalance(from, to)

    const income = trialBalance.filter((r) => r.nature === "INCOME")
    const expense = trialBalance.filter((r) => r.nature === "EXPENSE")

    const totalIncome = income.reduce((sum, r) => sum + r.credit - r.debit, 0)
    const totalExpense = expense.reduce((sum, r) => sum + r.debit - r.credit, 0)

    return {
        income,
        expense,
        totalIncome,
        totalExpense,
        surplus: totalIncome - totalExpense,
    }
}

// ─── Balance Sheet ───────────────────────────────────────

export async function getBalanceSheet(asOf?: Date) {
    const trialBalance = await getTrialBalance(undefined, asOf)

    const assets = trialBalance.filter((r) => r.nature === "ASSET")
    const liabilities = trialBalance.filter((r) => r.nature === "LIABILITY")
    const equity = trialBalance.filter((r) => r.nature === "EQUITY")

    const totalAssets = assets.reduce((sum, r) => sum + r.debit - r.credit, 0)
    const totalLiabilities = liabilities.reduce((sum, r) => sum + r.credit - r.debit, 0)
    const totalEquity = equity.reduce((sum, r) => sum + r.credit - r.debit, 0)

    return {
        assets,
        liabilities,
        equity,
        totalAssets,
        totalLiabilities,
        totalEquity,
    }
}

// ─── Cash / Bank Book ────────────────────────────────────

export async function getCashBook(from?: Date, to?: Date) {
    const cashLedger = await prisma.ledger.findUnique({ where: { code: "1001" } })
    if (!cashLedger) throw new Error("Cash in Hand ledger not found")
    return getLedgerStatement(cashLedger.id, from, to)
}

export async function getBankBook(from?: Date, to?: Date) {
    const bankLedger = await prisma.ledger.findUnique({ where: { code: "1002" } })
    if (!bankLedger) throw new Error("Bank - Default ledger not found")
    return getLedgerStatement(bankLedger.id, from, to)
}
