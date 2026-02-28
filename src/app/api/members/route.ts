import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createMemberSchema } from "@/types"
import { createMemberWithLedger } from "@/lib/membership"
import { auth } from "@/lib/auth"

export async function GET(req: Request) {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q")
    const status = searchParams.get("status")
    const isExecutive = searchParams.get("isExecutive")

    const where: any = {}

    if (query) {
        where.OR = [
            { name: { contains: query, mode: "insensitive" } },
            { membershipCode: { contains: query, mode: "insensitive" } },
            { mobile: { contains: query } }
        ]
    }

    if (status && status !== "ALL") {
        where.membershipStatus = status
    }

    if (isExecutive === "true") {
        where.isExecutive = true
    }

    try {
        const members = await prisma.member.findMany({
            where,
            orderBy: { membershipCode: "desc" },
        })
        return NextResponse.json(members)
    } catch (error) {
        console.error("GET members error: ", error)
        return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    try {
        const body = await req.json()
        const parsed = createMemberSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.format() }, { status: 400 })
        }

        const newMember = await createMemberWithLedger(parsed.data)
        return NextResponse.json(newMember, { status: 201 })
    } catch (error: any) {
        console.error("POST members error: ", error)
        // Handle uniqueness constraints
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "A member with this Aadhaar or Mobile already exists." }, { status: 400 })
        }
        return NextResponse.json({ error: error.message || "Failed to create member" }, { status: 500 })
    }
}
