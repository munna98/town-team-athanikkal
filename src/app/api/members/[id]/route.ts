import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { updateMemberSchema } from "@/types"
import { auth } from "@/lib/auth"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const resolvedParams = await params
    const { id } = resolvedParams

    try {
        const member = await prisma.member.findUnique({
            where: { id },
            include: {
                ledger: true,
            }
        })

        if (!member) {
            return NextResponse.json({ error: "Member not found" }, { status: 404 })
        }

        return NextResponse.json(member)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch member" }, { status: 500 })
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const resolvedParams = await params
    const { id } = resolvedParams

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

        const updatedMember = await prisma.member.update({
            where: { id },
            data: updateData,
        })

        // Update party ledger name if member name changed
        if (updateData.name) {
            await prisma.ledger.update({
                where: { code: updatedMember.membershipCode },
                data: { name: updateData.name }
            })
        }

        return NextResponse.json(updatedMember)
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to update member" }, { status: 500 })
    }
}
