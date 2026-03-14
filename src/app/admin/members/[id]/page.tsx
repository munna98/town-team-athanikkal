import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate, bloodGroupLabels } from "@/lib/utils"
import { ArrowLeft, Edit, FileText, Phone, Mail, MapPin, Calendar, Activity, CreditCard, Plus } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { DownloadCardButton, DownloadReceiptButton, ShareReceiptButton } from "@/components/pdf/DownloadButtons"
import { MemberReceiptDialog } from "@/components/members/MemberReceiptDialog"

export const dynamic = 'force-dynamic'

export default async function MemberDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const resolvedParams = await params
    const { id } = resolvedParams

    const [member, rawLedgers, rawExecutives, rawTiers] = await Promise.all([
        prisma.member.findUnique({
            where: { id },
            include: {
                ledger: true,
                tier: true
            }
        }),
        prisma.ledger.findMany({
            include: { group: true },
            orderBy: { name: "asc" }
        }),
        prisma.member.findMany({
            where: { isExecutive: true },
            orderBy: { name: "asc" }
        }),
        prisma.tier.findMany({
            orderBy: { threshold: 'asc' }
        })
    ])

    if (!member) {
        notFound()
    }

    const ledgersData = JSON.parse(JSON.stringify(rawLedgers))
    const executivesData = JSON.parse(JSON.stringify(rawExecutives))
    const tiers = JSON.parse(JSON.stringify(rawTiers))

    // Fetch recent transactions via the member's ledger (TransactionLine → Transaction)
    let recentTransactions: any[] = []
    if (member.ledger) {
        const txnLines = await prisma.transactionLine.findMany({
            where: { ledgerId: member.ledger.id },
            include: {
                transaction: {
                    include: {
                        lines: {
                            include: { ledger: true }
                        }
                    }
                }
            },
            orderBy: { transaction: { date: "desc" } },
            take: 5,
        })
        // Deduplicate transactions (a transaction may have multiple lines on same ledger)
        const seen = new Set<string>()
        recentTransactions = txnLines
            .map(tl => tl.transaction)
            .filter(txn => {
                if (seen.has(txn.id)) return false
                seen.add(txn.id)
                return true
            })
    }

    const sortedTiers = (tiers as any[]).filter(t => t.name !== "PENDING") // For progress, we don't care about pending
    const currentTierIndex = sortedTiers.findIndex(t => t.id === member.tierId)
    const nextTier = currentTierIndex >= 0 && currentTierIndex < sortedTiers.length - 1 ? sortedTiers[currentTierIndex + 1] : sortedTiers[0];

    let nextThreshold = nextTier ? Number(nextTier.threshold) : Number(member.tier?.threshold || 0);
    let nextTierName = nextTier ? nextTier.name : "Max Tier Reached";
    let nextTierColor = nextTier?.backgroundColor || "bg-slate-800";
    let progressPct = 100;

    const totalPaidNum = Number(member.totalPaid || 0);

    if (nextTier && currentTierIndex < sortedTiers.length - 1) {
        const currentThreshold = Number(member.tier?.threshold || 0);
        const range = nextThreshold - currentThreshold;
        const paidInRange = totalPaidNum - currentThreshold;
        progressPct = Math.max(0, Math.min((paidInRange / range) * 100, 100));
    } else if (member.tier?.name === "PENDING" && nextTier) {
        progressPct = Math.min((totalPaidNum / nextThreshold) * 100, 100);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/members">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                            {member.name}
                            {member.isExecutive && (
                                <Badge variant="outline" className="border-sky-500 text-sky-600 uppercase text-[10px] tracking-wider font-bold">
                                    Executive {member.position ? `- ${member.position}` : ''}
                                </Badge>
                            )}
                        </h1>
                        <p className="text-slate-500 font-medium">#{member.membershipCode}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {member.tier?.name !== "PENDING" && (
                        <DownloadCardButton memberId={member.id} status={member.tier?.name || "BASIC"} />
                    )}

                    {member.ledger?.id && (
                        <MemberReceiptDialog 
                            memberId={member.id}
                            memberName={member.name}
                            ledgerId={member.ledger.id}
                            ledgers={ledgersData}
                            executives={executivesData}
                        />
                    )}

                    <Link href={`/admin/members/${member.id}/edit`}>
                        <Button variant="outline">
                            <Edit className="mr-2 h-4 w-4" /> Edit Profile
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Col: Profile & Progress */}
                <div className="space-y-6 md:col-span-1">
                    <Card>
                        <CardHeader className="pb-4 border-b">
                            <CardTitle className="text-lg">Membership Status</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <div className="text-sm text-slate-500 mb-1">Current Tier</div>
                                    <Badge className="border-none text-base px-3 py-1 shadow-sm" style={{ backgroundColor: member.tier?.backgroundColor || "#e2e8f0", color: member.tier?.textColor || "#1e293b" }}>
                                        {member.tier?.name || "Unknown"}
                                    </Badge>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-slate-500 mb-1">Total Paid</div>
                                    <div className="text-2xl font-bold text-slate-800">{formatCurrency(Number(member.totalPaid))}</div>
                                </div>
                            </div>

                            {member.tier?.name !== "PLATINUM" && (
                                <div className="space-y-2 mt-6 p-4 bg-slate-50 rounded-lg border">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-slate-700">Progress to {nextTierName}</span>
                                        <span className="text-slate-500">{formatCurrency(totalPaidNum)} / {formatCurrency(nextThreshold)}</span>
                                    </div>
                                    <Progress value={progressPct} className="h-2" style={{ "--progress-background": nextTierColor } as React.CSSProperties} />
                                    <p className="text-xs text-slate-500 text-center mt-2">
                                        {formatCurrency(Math.max(0, nextThreshold - totalPaidNum))} more needed for upgrade
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-4 border-b">
                            <CardTitle className="text-lg">Profile Details</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex items-start gap-3">
                                <Phone className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-sm font-medium text-slate-900">{member.mobile}</div>
                                    <div className="text-xs text-slate-500">Mobile</div>
                                </div>
                            </div>
                            {member.email && (
                                <div className="flex items-start gap-3">
                                    <Mail className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                                    <div>
                                        <div className="text-sm font-medium text-slate-900">{member.email}</div>
                                        <div className="text-xs text-slate-500">Email</div>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-start gap-3">
                                <CreditCard className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-sm font-medium text-slate-900">{member.aadhaarNo}</div>
                                    <div className="text-xs text-slate-500">Aadhaar</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Activity className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-sm font-medium text-slate-900">{bloodGroupLabels[member.bloodGroup]}</div>
                                    <div className="text-xs text-slate-500">Blood Group</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-sm font-medium text-slate-900">{formatDate(member.dob)}</div>
                                    <div className="text-xs text-slate-500">Date of Birth</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-sm font-medium text-slate-900">
                                        {member.address1}
                                        {member.address2 && <>, {member.address2}</>}
                                        {member.address3 && <>, {member.address3}</>}
                                    </div>
                                    <div className="text-xs text-slate-500">Address</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Col: Ledger & History */}
                <div className="space-y-6 md:col-span-2">
                    <Card className="h-full">
                        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                            <div>
                                <CardTitle className="text-lg">Recent Transactions</CardTitle>
                                <p className="text-sm text-slate-500">Recent receipts associated with this member.</p>
                            </div>
                            <Link href={`/admin/accounting/reports?type=ledger-statement&ledger=${member.ledger?.id}`}>
                                <Button variant="outline" size="sm">
                                    <FileText className="h-4 w-4 mr-2" /> Ledger Statement
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {recentTransactions.length === 0 ? (
                                <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                                    <p>No transactions recorded yet.</p>
                                    {member.ledger?.id && (
                                        <MemberReceiptDialog 
                                            memberId={member.id}
                                            memberName={member.name}
                                            ledgerId={member.ledger.id}
                                            ledgers={ledgersData}
                                            executives={executivesData}
                                            triggerVariant="link"
                                        />
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentTransactions.map((txn: any) => (
                                        <div key={txn.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-slate-50 transition">
                                            <div>
                                                <div className="font-semibold text-slate-800">{txn.referenceNo}</div>
                                                <div className="text-sm text-slate-500">{formatDate(txn.date)} &middot; {txn.narration}</div>
                                                {txn.lines.some((l: any) => Number(l.credit) > 0) && (
                                                    <div className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded inline-block mt-1">Fee Recorded</div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="font-bold text-sky-600">{formatCurrency(Number(txn.totalAmount))}</div>
                                                <div className="flex items-center">
                                                    <DownloadReceiptButton transactionId={txn.id} referenceNo={txn.referenceNo} />
                                                    <ShareReceiptButton transactionId={txn.id} referenceNo={txn.referenceNo} mobile={member.mobile} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
