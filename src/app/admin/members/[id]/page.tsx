import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate, bloodGroupLabels, membershipStatusConfig } from "@/lib/utils"
import { ArrowLeft, Edit, FileText, Phone, Mail, MapPin, Calendar, Activity, CreditCard } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { DownloadCardButton, DownloadReceiptButton, ShareReceiptButton } from "@/components/pdf/DownloadButtons"

export const dynamic = 'force-dynamic'

export default async function MemberDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const resolvedParams = await params
    const { id } = resolvedParams

    const member = await prisma.member.findUnique({
        where: { id },
        include: {
            ledger: true,
        }
    })

    if (!member) {
        notFound()
    }

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

    const statusConf = membershipStatusConfig[member.membershipStatus]

    // Progress calculations
    const totalPaidNum = Number(member.totalPaid)
    let nextThreshold = 10000 // Basic (already reached if BASIC)
    let progressPct = 0
    let nextTierName = "Basic"
    let nextTierColor = "bg-blue-500"

    if (member.membershipStatus === "PENDING") {
        nextThreshold = 10000
        nextTierName = "Basic"
        nextTierColor = "bg-blue-500"
        progressPct = Math.min((totalPaidNum / nextThreshold) * 100, 100)
    } else if (member.membershipStatus === "BASIC") {
        nextThreshold = 35000
        nextTierName = "Silver"
        nextTierColor = "bg-slate-400"
        progressPct = Math.min(((totalPaidNum - 10000) / (nextThreshold - 10000)) * 100, 100)
    } else if (member.membershipStatus === "SILVER") {
        nextThreshold = 60000
        nextTierName = "Gold"
        nextTierColor = "bg-amber-500"
        progressPct = Math.min(((totalPaidNum - 35000) / (nextThreshold - 35000)) * 100, 100)
    } else if (member.membershipStatus === "GOLD") {
        nextThreshold = 110000
        nextTierName = "Platinum"
        nextTierColor = "bg-slate-800"
        progressPct = Math.min(((totalPaidNum - 60000) / (nextThreshold - 60000)) * 100, 100)
    } else {
        // Platinum
        progressPct = 100
        nextTierName = "Max Tier Reached"
        nextThreshold = totalPaidNum
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
                    {member.membershipStatus !== "PENDING" && (
                        <DownloadCardButton memberId={member.id} status={member.membershipStatus} />
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
                                    <Badge className={`${statusConf.color} text-white border-none text-base px-3 py-1 shadow-sm`}>
                                        {statusConf.label}
                                    </Badge>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-slate-500 mb-1">Total Paid</div>
                                    <div className="text-2xl font-bold text-slate-800">{formatCurrency(Number(member.totalPaid))}</div>
                                </div>
                            </div>

                            {member.membershipStatus !== "PLATINUM" && (
                                <div className="space-y-2 mt-6 p-4 bg-slate-50 rounded-lg border">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-slate-700">Progress to {nextTierName}</span>
                                        <span className="text-slate-500">{formatCurrency(totalPaidNum)} / {formatCurrency(nextThreshold)}</span>
                                    </div>
                                    <Progress value={progressPct} className="h-2" indicatorClassName={nextTierColor} />
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
                            <Link href={`/admin/accounting/reports?ledger=${member.ledger?.id}`}>
                                <Button variant="outline" size="sm">
                                    <FileText className="h-4 w-4 mr-2" /> Ledger Statement
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {recentTransactions.length === 0 ? (
                                <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
                                    <p>No transactions recorded yet.</p>
                                    <Link href={`/admin/accounting/receipts`}>
                                        <Button variant="link" className="text-sky-600">Record a Receipt</Button>
                                    </Link>
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
