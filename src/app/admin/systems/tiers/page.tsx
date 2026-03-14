import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { TierClient } from "./TierClient"

export const dynamic = 'force-dynamic'

export default async function TiersPage() {
    const session = await auth()
    if (!session || session.user?.role !== "SUPER_ADMIN") {
        redirect("/admin")
    }

    const tiers = await prisma.tier.findMany({
        orderBy: { threshold: 'asc' }
    })

    const serializedTiers = tiers.map(tier => ({
        ...tier,
        threshold: Number(tier.threshold)
    }))

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Membership Tiers</h1>
                <p className="text-slate-500">Manage the club's membership tiers and contribution thresholds.</p>
            </div>
            
            <TierClient tiers={serializedTiers} />
        </div>
    )
}
