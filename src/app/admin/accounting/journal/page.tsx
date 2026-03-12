import { JournalForm } from "@/components/accounting/JournalForm"
import { TransactionsList } from "@/components/accounting/TransactionsList"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export default async function JournalPage() {
    const rawLedgers = await prisma.ledger.findMany({
        include: { group: true },
        orderBy: { name: "asc" }
    })

    const ledgers = JSON.parse(JSON.stringify(rawLedgers))

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Journal Entry</h1>
                <p className="text-slate-500">Record and review adjustments across accounts.</p>
            </div>

            <Tabs defaultValue="new">
                <TabsList className="mb-4">
                    <TabsTrigger value="new">New Journal</TabsTrigger>
                    <TabsTrigger value="all">All Journal Entries</TabsTrigger>
                </TabsList>

                <TabsContent value="new">
                    <JournalForm ledgers={ledgers} />
                </TabsContent>

                <TabsContent value="all">
                    <TransactionsList
                        type="JOURNAL"
                        editBasePath="/admin/accounting/journal"
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
