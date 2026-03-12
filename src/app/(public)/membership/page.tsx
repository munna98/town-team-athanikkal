import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Check, ArrowLeft, Crown } from "lucide-react"

export default function MembershipPage() {
    return (
        <div className="flex flex-col min-h-screen bg-[#0a0f1a]">
            {/* ─── Navbar ─── */}
            <header className="fixed top-0 left-0 right-0 z-50 px-6 py-3 bg-[#0a0f1a]/80 backdrop-blur-xl border-b border-white/5">
                <nav className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <Image
                            src="/logo.png"
                            alt="Town Team Athanikkal"
                            width={44}
                            height={44}
                            className="rounded-full transition-transform group-hover:scale-105"
                        />
                        <div className="hidden sm:block">
                            <span className="text-white font-bold text-lg tracking-tight">Town Team</span>
                            <span className="text-cyan-400 font-bold text-lg ml-1">Athanikkal</span>
                        </div>
                    </Link>
                    <Link href="/">
                        <Button size="sm" className="bg-transparent border border-white/10 text-slate-400 hover:text-white hover:border-white/20 rounded-full px-4 gap-2">
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back to Home
                        </Button>
                    </Link>
                </nav>
            </header>

            <main className="flex-1 flex flex-col items-center pt-28 pb-20 px-6 max-w-6xl mx-auto w-full">
                {/* ─── Header ─── */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6">
                        <Crown className="w-3.5 h-3.5" />
                        Membership
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
                        <span className="text-white">Membership </span>
                        <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">Tiers</span>
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                        Join the Town Team Athanikkal family. We offer progressive membership levels depending on your lifetime contribution to the club.
                    </p>
                  {/* ─── Pricing Cards ─── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl">
                    {/* BASIC TIER */}
                    <div className="bg-white/[0.03] rounded-2xl p-8 border border-white/[0.06] flex flex-col relative hover:border-white/10 transition-all duration-300">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-cyan-400 mb-2">Basic</h3>
                            <p className="text-slate-500 text-sm">Full participating member</p>
                        </div>
                        <div className="mb-8 flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-slate-300">₹10,000</span>
                        </div>
                        <ul className="flex flex-col gap-4 flex-1 mb-8 text-sm text-slate-400">
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-cyan-500 shrink-0" />
                                <span>Basic Membership Card</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-cyan-500 shrink-0" />
                                <span>Voting Rights</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-cyan-500 shrink-0" />
                                <span>Access to team facilities</span>
                            </li>
                        </ul>
                    </div>

                    {/* SILVER TIER */}
                    <div className="bg-white/[0.03] rounded-2xl p-8 border border-white/[0.06] flex flex-col relative hover:border-white/10 transition-all duration-300">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-slate-300 mb-2">Silver</h3>
                            <p className="text-slate-500 text-sm">Active contributors</p>
                        </div>
                        <div className="mb-8 flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-slate-300">₹35,000</span>
                        </div>
                        <ul className="flex flex-col gap-4 flex-1 mb-8 text-sm text-slate-400">
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-slate-400 shrink-0" />
                                <span>Silver Membership Card</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-slate-400 shrink-0" />
                                <span>All Basic benefits</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-slate-400 shrink-0" />
                                <span>Club merchandise</span>
                            </li>
                        </ul>
                    </div>

                    {/* GOLD TIER */}
                    <div className="bg-white/[0.04] rounded-2xl p-8 border-2 border-amber-500/40 flex flex-col relative shadow-[0_0_40px_rgba(245,158,11,0.08)]">
                        <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-amber-500 text-[#0a0f1a] text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                            Popular
                        </div>
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-amber-400 mb-2">Gold</h3>
                            <p className="text-slate-500 text-sm">Patrons & major contributors</p>
                        </div>
                        <div className="mb-8 flex items-baseline gap-2">
                            <span className="text-4xl font-extrabold text-white">₹60,000</span>
                        </div>
                        <ul className="flex flex-col gap-4 flex-1 mb-8 text-sm text-slate-300">
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-amber-400 shrink-0" />
                                <span className="font-medium">Gold Membership Card</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-amber-400 shrink-0" />
                                <span className="font-medium">All Silver benefits</span>
                            </li>
                            <li className="flex items-start gap-3 text-left">
                                <Check className="w-5 h-5 text-amber-400 shrink-0" />
                                <span className="font-medium">VIP seating in club tournaments</span>
                            </li>
                        </ul>
                    </div>

                    {/* PLATINUM TIER */}
                    <div className="bg-slate-900 rounded-2xl p-8 border border-white/10 flex flex-col relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 group-hover:opacity-100 transition-opacity" />
                        <div className="relative">
                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-indigo-400 mb-2">Platinum</h3>
                                <p className="text-slate-500 text-sm">Executive sponsors</p>
                            </div>
                            <div className="mb-8 flex items-baseline gap-2">
                                <span className="text-4xl font-extrabold text-white">₹1,10,000</span>
                            </div>
                            <ul className="flex flex-col gap-4 flex-1 mb-8 text-sm text-slate-400">
                                <li className="flex items-start gap-3 text-left">
                                    <Check className="w-5 h-5 text-indigo-400 shrink-0" />
                                    <span>Platinum Membership Card</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-indigo-400 shrink-0" />
                                    <span>Lifetime Honor</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-indigo-400 shrink-0" />
                                    <span>All Gold benefits</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                </div>
            </main>

            {/* ─── Footer ─── */}
            <footer className="w-full border-t border-white/5 py-10 px-6 bg-[#060b14]">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <Image
                            src="/logo.png"
                            alt="Town Team Athanikkal"
                            width={32}
                            height={32}
                            className="rounded-full"
                        />
                        <span className="font-bold text-white">
                            Town Team <span className="text-cyan-400">Athanikkal</span>
                        </span>
                    </div>
                    <p className="text-sm text-slate-600">
                        &copy; {new Date().getFullYear()} Town Team Athanikkal. All rights reserved.
                    </p>
                    <Link href="/login" className="text-sm text-slate-500 hover:text-cyan-400 transition-colors">
                        Admin Login
                    </Link>
                </div>
            </footer>
        </div>
    )
}
