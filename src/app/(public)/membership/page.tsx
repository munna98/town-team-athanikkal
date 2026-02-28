import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { membershipStatusConfig } from "@/lib/utils"

export default function MembershipPage() {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50">
            <header className="px-6 py-4 flex items-center justify-between bg-white border-b sticky top-0 z-50">
                <Link href="/" className="font-bold text-sky-600 text-xl flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold">TT</div>
                    Town Team Athanikkal
                </Link>
                <Link href="/">
                    <Button variant="ghost" size="sm">Back to Home</Button>
                </Link>
            </header>

            <main className="flex-1 flex flex-col items-center py-16 px-6 max-w-6xl mx-auto w-full">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-slate-800 tracking-tight">Membership Tiers</h1>
                    <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">
                        Join the Town Team Athanikkal family. We offer progressive membership levels depending on your lifetime contribution to the club.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
                    {/* PENDING / GUEST */}
                    <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col relative opacity-80">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Pending / Registration</h3>
                            <p className="text-slate-500 text-sm">Initial application status</p>
                        </div>
                        <div className="mb-8 flex items-baseline gap-2">
                            <span className="text-3xl font-bold">₹0 - ₹9,999</span>
                        </div>
                        <ul className="flex flex-col gap-4 flex-1 mb-8 text-sm">
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-sky-500 shrink-0" />
                                <span>Registered in club directory</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-sky-500 shrink-0" />
                                <span>Invites to general club events</span>
                            </li>
                            <li className="flex items-start gap-3 opacity-40">
                                <Check className="w-5 h-5 text-slate-300 shrink-0" />
                                <span>Basic Membership Card PDF</span>
                            </li>
                            <li className="flex items-start gap-3 opacity-40">
                                <Check className="w-5 h-5 text-slate-300 shrink-0" />
                                <span>Voting rights in general body</span>
                            </li>
                        </ul>
                        <Button variant="outline" className="w-full font-medium" disabled>Contact Exec to Join</Button>
                    </div>

                    {/* BASIC TIER */}
                    <div className="bg-white rounded-2xl p-8 border-2 border-sky-500 shadow-md flex flex-col relative transform md:-translate-y-4">
                        <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-sky-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            Standard
                        </div>
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-sky-600 mb-2">Basic Membership</h3>
                            <p className="text-slate-500 text-sm">Full participating member</p>
                        </div>
                        <div className="mb-8 flex items-baseline gap-2">
                            <span className="text-4xl font-extrabold text-slate-800">₹10,000+</span>
                        </div>
                        <ul className="flex flex-col gap-4 flex-1 mb-8 text-sm text-slate-700">
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-sky-500 shrink-0" />
                                <span className="font-medium">All Pending Tier benefits</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-sky-500 shrink-0" />
                                <span className="font-medium">Basic Membership Card PDF</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-sky-500 shrink-0" />
                                <span className="font-medium">Full Voting Rights</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-sky-500 shrink-0" />
                                <span className="font-medium">Access to team facilities</span>
                            </li>
                        </ul>
                    </div>

                    {/* GOLD TIER */}
                    <div className="bg-white rounded-2xl p-8 border-2 border-amber-300 shadow-lg shadow-amber-100 flex flex-col relative bg-gradient-to-br from-white to-amber-50">
                        <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-white opacity-80 blur-[1px] animate-pulse"></span>
                            Premium
                        </div>
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-amber-600 mb-2">Gold Membership</h3>
                            <p className="text-amber-700/70 text-sm font-medium">Patrons & major contributors</p>
                        </div>
                        <div className="mb-8 flex items-baseline gap-2">
                            <span className="text-4xl font-extrabold text-slate-800 text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-400">₹1,00,000+</span>
                        </div>
                        <ul className="flex flex-col gap-4 flex-1 mb-8 text-sm">
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-amber-500 shrink-0" />
                                <span className="font-medium text-slate-700">All Basic Tier benefits</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-amber-500 shrink-0" />
                                <span className="font-medium text-slate-700">Premium Gold Membership Card PDF</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-amber-500 shrink-0" />
                                <span className="font-medium text-slate-700">Special mention at annual events</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-amber-500 shrink-0" />
                                <span className="font-medium text-slate-700">VIP seating in club tournaments</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    )
}
