import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { updateMemberSchema } from "@/types"
import { auth } from "@/lib/auth"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params

    try {
        const member = await prisma.member.findUnique({
            where: { id },
            include: { ledger: true }
        })

        if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 })
        return NextResponse.json(member)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch member" }, { status: 500 })
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { id } = await params

    try {
        const body = await req.json()
        const parsed = updateMemberSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.format() }, { status: 400 })
        }

        const updateData: any = { ...parsed.data }
        if (updateData.dob) {
            updateData.dob = new Date(updateData.dob)
        }

        // Normalize email
        if (updateData.email) {
            updateData.email = updateData.email.trim().toLowerCase()
        }

        const updatedMember = await prisma.member.update({
            where: { id },
            data: updateData,
            include: { user: true }
        })

        // Sync linked User email automatically when member email changes
        if (updateData.email && updatedMember.user) {
            if (updatedMember.user.email !== updateData.email) {
                const conflict = await prisma.user.findUnique({
                    where: { email: updateData.email }
                })

                if (conflict && conflict.id !== updatedMember.user.id) {
                    return NextResponse.json(
                        { error: `Cannot update email — ${updateData.email} is already used by another account` },
                        { status: 409 }
                    )
                }

                await prisma.user.update({
                    where: { id: updatedMember.user.id },
                    data: { email: updateData.email }
                })
            }
        }

        // Sync ledger name if member name changed
        if (updateData.name) {
            await prisma.ledger.update({
                where: { code: updatedMember.membershipCode },
                data: { name: `${updateData.name} (${updatedMember.membershipCode})` }
            })
        }

        return NextResponse.json(updatedMember)
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to update member" }, { status: 500 })
    }
}