import { z } from "zod"

// ─── Member Schemas ──────────────────────────────────────
export const createMemberSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    address1: z.string().min(1, "Address is required"),
    address2: z.string().optional().default(""),
    address3: z.string().optional().default(""),
    aadhaarNo: z.string().length(12, "Aadhaar must be 12 digits").regex(/^\d{12}$/, "Aadhaar must contain only digits"),
    mobile: z.string().min(10, "Mobile must be at least 10 digits").regex(/^\d{10,}$/, "Invalid mobile number"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    dob: z.string().min(1, "Date of birth is required"),
    bloodGroup: z.enum(["A_POS", "A_NEG", "B_POS", "B_NEG", "O_POS", "O_NEG", "AB_POS", "AB_NEG"]),
    isExecutive: z.boolean().default(false),
    position: z.string().optional(),
    photoUrl: z.string().optional().default(""),
})

export type CreateMemberInput = z.infer<typeof createMemberSchema>

export const updateMemberSchema = createMemberSchema.partial()
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>

// ─── Transaction Schemas ──────────────────────────────────
export const receiptSchema = z.object({
    date: z.string().min(1, "Date is required"),
    amount: z.number().positive("Amount must be positive"),
    cashOrBank: z.enum(["CASH", "BANK"]),
    incomeLedgerId: z.string().min(1, "Income ledger is required"),
    narration: z.string().optional(),
    collectedById: z.string().min(1, "Collected by is required"),
})

export type ReceiptInput = z.infer<typeof receiptSchema>

export const paymentSchema = z.object({
    date: z.string().min(1, "Date is required"),
    amount: z.number().positive("Amount must be positive"),
    cashOrBank: z.enum(["CASH", "BANK"]),
    expenseLedgerId: z.string().min(1, "Expense ledger is required"),
    narration: z.string().optional(),
})

export type PaymentInput = z.infer<typeof paymentSchema>

export const contraSchema = z.object({
    date: z.string().min(1, "Date is required"),
    fromLedgerId: z.string().min(1, "Source account is required"),
    toLedgerId: z.string().min(1, "Destination account is required"),
    amount: z.number().positive("Amount must be positive"),
    narration: z.string().optional(),
})

export type ContraInput = z.infer<typeof contraSchema>

export const journalLineSchema = z.object({
    ledgerId: z.string().min(1, "Ledger is required"),
    debit: z.number().min(0),
    credit: z.number().min(0),
    description: z.string().optional(),
})

export const journalSchema = z.object({
    date: z.string().min(1, "Date is required"),
    narration: z.string().optional(),
    lines: z.array(journalLineSchema).min(2, "At least 2 lines required"),
})

export type JournalInput = z.infer<typeof journalSchema>

// ─── Ledger Schemas ──────────────────────────────────────
export const createLedgerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    code: z.string().min(1, "Code is required"),
    groupId: z.string().min(1, "Group is required"),
    description: z.string().optional(),
    openingBalance: z.number().default(0),
    openingType: z.enum(["DR", "CR"]).default("DR"),
})

export type CreateLedgerInput = z.infer<typeof createLedgerSchema>

// ─── User Schemas ────────────────────────────────────────
export const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(1, "Password is required"),
})

export type LoginInput = z.infer<typeof loginSchema>

export const createUserSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.enum(["ADMIN", "SUPER_ADMIN"]).default("ADMIN"),
    memberId: z.string().min(1, "Member is required"),
})

export type CreateUserInput = z.infer<typeof createUserSchema>

// ─── Report Filter Types ─────────────────────────────────
export interface DateRange {
    from?: Date
    to?: Date
}

export interface LedgerStatementLine {
    date: Date
    referenceNo: string
    narration: string
    debit: number
    credit: number
    balance: number
}

export interface TrialBalanceRow {
    ledgerId: string
    ledgerName: string
    ledgerCode: string
    groupName: string
    nature: string
    debit: number
    credit: number
}

export interface DashboardStats {
    totalMembers: number
    basicMembers: number
    goldMembers: number
    cashBalance: number
    bankBalance: number
    monthIncome: number
    monthExpense: number
}
