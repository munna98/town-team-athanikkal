import { ContraForm } from "@/components/accounting/ContraForm"
import { TransactionsList } from "@/components/accounting/TransactionsList"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export default async function ContraPage() {
    const rawLedgers = await prisma.ledger.findMany({
        include: { group: true },
        orderBy: { name: "asc" }
    })

    const ledgers = JSON.parse(JSON.stringify(rawLedgers))

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Contra Entry</h1>
                <p className="text-slate-500">Transfer and manage funds between Cash and Bank accounts.</p>
            </div>

            <Tabs defaultValue="new">
                <TabsList className="mb-4">
                    <TabsTrigger value="new">New Contra</TabsTrigger>
                    <TabsTrigger value="all">All Contra Entries</TabsTrigger>
                </TabsList>

                <TabsContent value="new">
                    <ContraForm ledgers={ledgers} />
                </TabsContent>

                <TabsContent value="all">
                    <TransactionsList
                        type="CONTRA"
                        editBasePath="/admin/accounting/contra"
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
