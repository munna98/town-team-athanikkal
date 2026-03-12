"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"

export async function grantUserAccess(memberId: string) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthorized" }

    try {
        const member = await prisma.member.findUnique({
            where: { id: memberId },
            include: { user: true }
        })

        if (!member) return { error: "Member not found" }
        if (!member.isExecutive) return { error: "Only executive members can be granted access" }
        if (member.user) return { error: "Member already has access" }
        if (!member.email) return { error: "Member must have an email address to login" }

        // Use standard password from initial prompt or a generated one.
        const defaultPassword = "tta12345@2026"
        const hashedPassword = await bcrypt.hash(defaultPassword, 10)

        // Create the user and link to member
        await prisma.user.create({
            data: {
                email: member.email,
                password: hashedPassword,
                role: "ADMIN",
                memberId: member.id,
            }
        })

        revalidatePath("/admin/settings/users")
        return { success: true, message: `Access granted. Default password: ${defaultPassword}` }

    } catch (error: any) {
        console.error("Grant access error:", error)
        return { error: error.message || "Failed to grant access" }
    }
}

export async function revokeUserAccess(userId: string) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthorized" }

    // Only SUPER_ADMIN can revoke access
    if (session.user.role !== "SUPER_ADMIN") {
        return { error: "Only super users can revoke access" }
    }

    // Validate not removing self
    if (session.user.id === userId) {
        return { error: "You cannot revoke your own access" }
    }

    try {
        await prisma.user.delete({
            where: { id: userId }
        })

        revalidatePath("/admin/settings/users")
        return { success: true }
    } catch (error: any) {
        return { error: "Failed to revoke access" }
    }
}

export async function resetUserPassword(userId: string) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthorized" }

    try {
        const defaultPassword = "tta12345@2026"
        const hashedPassword = await bcrypt.hash(defaultPassword, 10)

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        })

        revalidatePath("/admin/settings/users")
        return { success: true, message: `Password reset to: ${defaultPassword}` }
    } catch (error: any) {
        return { error: "Failed to reset password" }
    }
}

export async function changeUserPassword(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthorized" }

    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (!currentPassword || !newPassword || !confirmPassword) {
        return { error: "All fields are required" }
    }

    if (newPassword !== confirmPassword) {
        return { error: "New passwords do not match" }
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        })

        if (!user) return { error: "User not found" }

        const passwordsMatch = await bcrypt.compare(currentPassword, user.password)
        if (!passwordsMatch) {
            return { error: "Incorrect current password" }
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await prisma.user.update({
            where: { id: session.user.id },
            data: { password: hashedPassword }
        })

        return { success: true, message: "Password updated successfully" }
    } catch (error: any) {
        return { error: "Failed to update password" }
    }
}
