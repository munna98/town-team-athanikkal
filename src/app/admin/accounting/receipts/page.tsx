import { ReceiptForm } from "@/components/accounting/ReceiptForm"
import { TransactionsList } from "@/components/accounting/TransactionsList"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import prisma from "@/lib/prisma"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function ReceiptsPage() {
    const [rawLedgers, rawExecutives] = await Promise.all([
        prisma.ledger.findMany({
            include: { group: true },
            orderBy: { name: "asc" }
        }),
        prisma.member.findMany({
            where: { isExecutive: true },
            orderBy: { name: "asc" }
        }),
    ])

    const ledgers = JSON.parse(JSON.stringify(rawLedgers))
    const executives = JSON.parse(JSON.stringify(rawExecutives))

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Receipts</h1>
                <p className="text-slate-500">Record and manage incoming payments.</p>
            </div>

            <Tabs defaultValue="new">
                <TabsList className="mb-4">
                    <TabsTrigger value="new">New Receipt</TabsTrigger>
                    <TabsTrigger value="all">All Receipts</TabsTrigger>
                </TabsList>

                <TabsContent value="new">
                    <Suspense fallback={
                        <div className="flex items-center justify-center p-12 bg-white border rounded-lg shadow-sm">
                            <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                        </div>
                    }>
                        <ReceiptForm ledgers={ledgers} executives={executives} />
                    </Suspense>
                </TabsContent>

                <TabsContent value="all">
                    <TransactionsList
                        type="RECEIPT"
                        editBasePath="/admin/accounting/receipts"
                        showPdf={true}
                        executives={executives}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
