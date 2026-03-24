"use server"

import { auth } from "@/lib/auth"
import { bulkCreateMembers as bulkCreateMembersLib } from "@/lib/membership"
import prisma from "@/lib/prisma"
import { createMemberSchema, CreateMemberInput } from "@/types"
import { revalidatePath } from "next/cache"
import { Prisma } from "@prisma/client"

type BulkMemberImportRow = Partial<CreateMemberInput> & {
    aadhaarNo?: string
    __rowNumber?: number
}

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : "Failed to bulk create members"
}

export async function bulkCreateMembersAction(data: BulkMemberImportRow[]) {
    const session = await auth()
    if (!session) {
        throw new Error("Unauthorized")
    }

    if (!Array.isArray(data)) {
        throw new Error("Invalid data format")
    }

    const duplicateAadhaarRows = new Map<string, number[]>()
    data.forEach((item) => {
        const aadhaarNo = typeof item?.aadhaarNo === "string" ? item.aadhaarNo.trim() : ""
        const rowNumber = typeof item?.__rowNumber === "number" ? item.__rowNumber : null

        if (!aadhaarNo || rowNumber === null) return

        const rows = duplicateAadhaarRows.get(aadhaarNo) ?? []
        rows.push(rowNumber)
        duplicateAadhaarRows.set(aadhaarNo, rows)
    })

    const duplicateEntries = [...duplicateAadhaarRows.entries()].filter(([, rows]) => rows.length > 1)
    if (duplicateEntries.length > 0) {
        const [aadhaarNo, rows] = duplicateEntries[0]
        throw new Error(`Duplicate Aadhaar ${aadhaarNo} found in Excel rows ${rows.join(", ")}`)
    }

    // Validate each record
    const validatedData = data.map((item, index) => {
        const result = createMemberSchema.safeParse(item)
        if (!result.success) {
            const rowNumber = typeof item?.__rowNumber === "number" ? item.__rowNumber : index + 2
            throw new Error(`Validation failed for Excel row ${rowNumber}: ${result.error.issues.map((issue) => issue.message).join(", ")}`)
        }
        return result.data
    })

    try {
        const aadhaarNumbers = validatedData.map((item) => item.aadhaarNo)
        const existingMembers = await prisma.member.findMany({
            where: {
                aadhaarNo: {
                    in: aadhaarNumbers,
                },
            },
            select: {
                aadhaarNo: true,
            },
        })

        if (existingMembers.length > 0) {
            const existingAadhaar = existingMembers[0].aadhaarNo
            const matchingRow = data.find((item) => item?.aadhaarNo === existingAadhaar)
            const rowNumber = typeof matchingRow?.__rowNumber === "number" ? matchingRow.__rowNumber : "unknown"
            throw new Error(`Excel row ${rowNumber}: Aadhaar ${existingAadhaar} already exists in members`)
        }

        const results = await bulkCreateMembersLib(validatedData)
        revalidatePath("/admin/members")
        return { success: true, count: results.length }
    } catch (error: unknown) {
        console.error("Bulk create error:", error)

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                const target = Array.isArray(error.meta?.target)
                    ? error.meta.target.join(", ")
                    : String(error.meta?.target ?? "unknown field")
                throw new Error(`Duplicate value detected for ${target}. ${error.message}`)
            }
        }

        throw new Error(getErrorMessage(error))
    }
}
