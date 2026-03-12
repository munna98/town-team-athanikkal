"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { createLedgerSchema } from "@/types"

export async function submitLedger(data: z.infer<typeof createLedgerSchema>) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    try {
        const parsed = createLedgerSchema.parse(data)

        const existingCode = await prisma.ledger.findUnique({ where: { code: parsed.code } })
        if (existingCode) throw new Error("A ledger with this code already exists")

        const existingName = await prisma.ledger.findUnique({ where: { name: parsed.name } })
        if (existingName) throw new Error("A ledger with this name already exists")

        await prisma.ledger.create({
            data: {
                code: parsed.code,
                name: parsed.name,
                groupId: parsed.groupId,
                description: parsed.description,
                openingBalance: parsed.openingBalance,
                openingType: parsed.openingType,
                isSystem: false,
            }
        })

        revalidatePath("/admin/accounting/ledgers")
        revalidatePath("/admin/accounting/reports")
        return { success: true }
    } catch (error: any) {
        return { error: error.message || "Failed to create custom ledger" }
    }
}

export async function getNextLedgerCode(groupId: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    try {
        const group = await prisma.ledgerGroup.findUnique({
            where: { id: groupId },
            select: { nature: true }
        })

        if (!group) throw new Error("Group not found")

        // Map Nature to starting digit
        const natureToDigit: Record<string, string> = {
            ASSET: "1",
            LIABILITY: "2",
            EQUITY: "3",
            INCOME: "4",
            EXPENSE: "5"
        }

        const startDigit = natureToDigit[group.nature]
        if (!startDigit) throw new Error("Invalid nature")

        // Find the highest numeric code that starts with the corresponding digit
        const lastLedger = await prisma.ledger.findFirst({
            where: {
                code: {
                    startsWith: startDigit
                },
                // Ensure code is numeric-ish
                AND: [
                    { code: { gte: `${startDigit}000` } },
                    { code: { lte: `${startDigit}9999` } } // Assuming 4 digit codes are the standard
                ]
            },
            orderBy: {
                code: "desc"
            }
        })

        if (!lastLedger) {
            return { code: `${startDigit}001` }
        }

        const currentMax = parseInt(lastLedger.code)
        if (isNaN(currentMax)) {
            return { code: `${startDigit}001` }
        }

        return { code: (currentMax + 1).toString() }
    } catch (error: any) {
        return { error: error.message || "Failed to get next code" }
    }
}
