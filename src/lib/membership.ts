import prisma from "@/lib/prisma"
import { DrCr, MembershipStatus } from "@prisma/client"
import { CreateMemberInput } from "@/types"

/**
 * Auto-generate next membership code: TTA-001, TTA-002, ...
 */
export async function generateMembershipCode(): Promise<string> {
    const last = await prisma.member.findFirst({
        orderBy: { createdAt: "desc" },
        select: { membershipCode: true },
    })
    if (!last) return "TTA-001"
    const lastNumber = parseInt(last.membershipCode.split("-")[1])
    const next = String(lastNumber + 1).padStart(3, "0")
    return `TTA-${next}`
}

/**
 * Create member + auto-create income ledger under "Membership Income" group.
 * Never create a member directly — always use this function.
 */
export async function createMemberWithLedger(data: CreateMemberInput) {
    const membershipCode = await generateMembershipCode()

    const group = await prisma.ledgerGroup.findUnique({
        where: { name: "Membership Income" },
    })
    if (!group) throw new Error("Membership Income ledger group not found. Run seed first.")

    return await prisma.$transaction(async (tx) => {
        // 1. Create the member
        const member = await tx.member.create({
            data: {
                membershipCode,
                name: data.name,
                address1: data.address1,
                address2: data.address2 || null,
                address3: data.address3 || null,
                aadhaarNo: data.aadhaarNo,
                mobile: data.mobile,
                email: data.email || null,
                dob: new Date(data.dob),
                bloodGroup: data.bloodGroup,
                isExecutive: data.isExecutive,
                photoUrl: data.photoUrl || null,
            },
        })

        // 2. Auto-create income ledger under "Membership Income" linked to member
        await tx.ledger.create({
            data: {
                code: membershipCode,
                name: `${data.name} (${membershipCode})`,
                groupId: group.id,
                partyType: "MEMBER",
                memberId: member.id,
                isSystem: false,
                openingType: DrCr.CR,
                description: `Membership income ledger for ${membershipCode}`,
            },
        })

        return member
    })
}

/**
 * Recalculate totalPaid and membershipStatus for a member
 * based on credits to their personal membership income ledger.
 *
 * Call after every receipt that credits the member's ledger.
 */
export async function recalculateMemberStatus(memberId: string) {
    // Find the member's own income ledger
    const memberLedger = await prisma.ledger.findUnique({
        where: { memberId },
    })
    if (!memberLedger) return

    // Sum all credits to the member's income ledger
    const result = await prisma.transactionLine.aggregate({
        where: {
            ledgerId: memberLedger.id,
        },
        _sum: { credit: true },
    })

    const totalPaid = Number(result._sum.credit || 0)

    let membershipStatus: MembershipStatus = "PENDING"
    if (totalPaid >= 100000) {
        membershipStatus = "GOLD"
    } else if (totalPaid >= 10000) {
        membershipStatus = "BASIC"
    }

    await prisma.member.update({
        where: { id: memberId },
        data: { totalPaid, membershipStatus },
    })
}

