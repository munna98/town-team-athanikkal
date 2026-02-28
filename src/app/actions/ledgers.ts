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
