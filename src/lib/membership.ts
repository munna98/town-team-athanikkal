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
 * Create member + auto-create party ledger in a single transaction.
 * Never create a member directly — always use this function.
 */
export async function createMemberWithLedger(data: CreateMemberInput) {
    const membershipCode = await generateMembershipCode()

    const group = await prisma.ledgerGroup.findUnique({
        where: { name: "Members" },
    })
    if (!group) throw new Error("Members ledger group not found. Run seed first.")

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

        // 2. Auto-create party ledger linked to member
        await tx.ledger.create({
            data: {
                code: membershipCode,
                name: data.name,
                groupId: group.id,
                partyType: "MEMBER",
                memberId: member.id,
                isSystem: false,
                openingType: DrCr.DR,
                description: `Party ledger for member ${membershipCode}`,
            },
        })

        return member
    })
}

/**
 * Recalculate totalPaid and membershipStatus for a member
 * based on their membership fee transaction lines.
 *
 * Call after every receipt that credits the "Membership Fee" ledger
 * for this member.
 */
export async function recalculateMemberStatus(memberId: string) {
    // Find the "Membership Fee" ledger
    const membershipFeeLedger = await prisma.ledger.findUnique({
        where: { code: "4001" }, // Membership Fee
    })
    if (!membershipFeeLedger) return

    // Sum all credits to Membership Fee where transaction.memberId = memberId
    const result = await prisma.transactionLine.aggregate({
        where: {
            ledgerId: membershipFeeLedger.id,
            transaction: { memberId },
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
