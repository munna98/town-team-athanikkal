import { NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { MembershipCardPDF } from "@/components/pdf/MembershipCardPDF"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import React from "react"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const resolvedParams = await params
    const { id } = resolvedParams

    try {
        const member = await prisma.member.findUnique({
            where: { id },
            include: { tier: true }
        })

        if (!member) {
            return NextResponse.json({ error: "Member not found" }, { status: 404 })
        }

        if (member.tier?.name === "PENDING") {
            return NextResponse.json({ error: "Member must be BASIC or above to generate a card" }, { status: 400 })
        }

        const pdfElement = React.createElement(MembershipCardPDF, {
            name: member.name,
            membershipCode: member.membershipCode,
            bloodGroup: member.bloodGroup,
            mobile: member.mobile,
            photoUrl: member.photoUrl,
            membershipStatus: member.tier?.name || "BASIC",
            joinDate: member.createdAt.toISOString(),
        })

        const buffer = await renderToBuffer(pdfElement as any)

        return new NextResponse(buffer as any, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="membership-card-${member.membershipCode}.pdf"`,
            },
        })
    } catch (error: any) {
        console.error("PDF generation error:", error)
        return NextResponse.json({ error: error.message || "Failed to generate PDF" }, { status: 500 })
    }
}
