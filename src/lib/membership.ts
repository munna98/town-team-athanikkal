import prisma from "@/lib/prisma"
import { DrCr } from "@prisma/client"
import { CreateMemberInput } from "@/types"

/**
 * Auto-generate next membership code(s).
 */
export async function generateMembershipCodes(count: number = 1): Promise<string[]> {
    const last = await prisma.member.findFirst({
        orderBy: { createdAt: "desc" },
        select: { membershipCode: true },
    })
    
    let lastNumber = 0
    if (last) {
        lastNumber = parseInt(last.membershipCode.split("-")[1])
    }

    const codes = []
    for (let i = 1; i <= count; i++) {
        const next = String(lastNumber + i).padStart(3, "0")
        codes.push(`TTA-${next}`)
    }
    return codes
}

export async function generateMembershipCode(): Promise<string> {
    const codes = await generateMembershipCodes(1)
    return codes[0]
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

    const defaultTier = await prisma.tier.findUnique({
        where: { name: "PENDING" }
    })

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
                position: data.position || null,
                photoUrl: data.photoUrl || null,
                tierId: defaultTier?.id || null,
                isActive: data.isActive ?? true,
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
 * Bulk create members with their respective ledgers.
 */
export async function bulkCreateMembers(dataArray: CreateMemberInput[]) {
    const group = await prisma.ledgerGroup.findUnique({
        where: { name: "Membership Income" },
    })
    if (!group) throw new Error("Membership Income ledger group not found. Run seed first.")

    const defaultTier = await prisma.tier.findUnique({
        where: { name: "PENDING" }
    })

    const codes = await generateMembershipCodes(dataArray.length)

    return await prisma.$transaction(async (tx) => {
        const results = []

        for (let i = 0; i < dataArray.length; i++) {
            const data = dataArray[i]
            const membershipCode = codes[i]

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
                    position: data.position || null,
                    photoUrl: data.photoUrl || null,
                    tierId: defaultTier?.id || null,
                    isActive: data.isActive ?? true,
                },
            })

            // 2. Auto-create income ledger
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

            results.push(member)
        }

        return results
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

    const tiers = await prisma.tier.findMany({
        orderBy: { threshold: "desc" },
    })

    const calculatedTier = tiers.find((t) => totalPaid >= Number(t.threshold))
    let finalTierId = calculatedTier?.id || tiers[tiers.length - 1]?.id || null

    const member = await prisma.member.findUnique({
        where: { id: memberId },
        include: { tier: true },
    })

    if (!member) return

    await prisma.member.update({
        where: { id: memberId },
        data: { totalPaid, tierId: finalTierId },
    })
}

