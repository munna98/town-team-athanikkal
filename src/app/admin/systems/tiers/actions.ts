"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"

export async function updateTier(id: string, data: {
    name: string
    threshold: number
    backgroundColor: string
    textColor: string
    description?: string
}) {
    const session = await auth()
    if (!session || session.user?.role !== "SUPER_ADMIN") {
        return { success: false, error: "Unauthorized access" }
    }

    try {
        await prisma.tier.update({
            where: { id },
            data: {
                name: data.name,
                threshold: data.threshold,
                backgroundColor: data.backgroundColor,
                textColor: data.textColor,
                description: data.description,
            }
        })

        revalidatePath("/admin/systems/tiers")
        revalidatePath("/admin/members")
        revalidatePath("/admin")
        
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
