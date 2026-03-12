"use server"

import { auth } from "@/lib/auth"
import { bulkCreateMembers as bulkCreateMembersLib } from "@/lib/membership"
import { createMemberSchema } from "@/types"
import { revalidatePath } from "next/cache"

export async function bulkCreateMembersAction(data: any[]) {
    const session = await auth()
    if (!session) {
        throw new Error("Unauthorized")
    }

    if (!Array.isArray(data)) {
        throw new Error("Invalid data format")
    }

    // Validate each record
    const validatedData = data.map((item, index) => {
        const result = createMemberSchema.safeParse(item)
        if (!result.success) {
            throw new Error(`Validation failed for record at index ${index}: ${result.error.issues.map((e: any) => e.message).join(", ")}`)
        }
        return result.data
    })

    try {
        const results = await bulkCreateMembersLib(validatedData)
        revalidatePath("/admin/members")
        return { success: true, count: results.length }
    } catch (error: any) {
        console.error("Bulk create error:", error)
        throw new Error(error.message || "Failed to bulk create members")
    }
}
