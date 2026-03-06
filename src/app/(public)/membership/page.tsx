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
                </div>

                {/* ─── Pricing Cards ─── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
                    {/* PENDING / GUEST */}
                    <div className="bg-white/[0.03] rounded-2xl p-8 border border-white/[0.06] flex flex-col relative hover:border-white/10 transition-all duration-300">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-white mb-2">Registration</h3>
                            <p className="text-slate-500 text-sm">Initial application status</p>
                        </div>
                        <div className="mb-8 flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-slate-300">₹500 - ₹9,999</span>
                        </div>
                        <ul className="flex flex-col gap-4 flex-1 mb-8 text-sm text-slate-400">
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-cyan-500 shrink-0" />
                                <span>Registered in club directory</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-cyan-500 shrink-0" />
                                <span>Invites to general club events</span>
                            </li>
                            <li className="flex items-start gap-3 opacity-30">
                                <Check className="w-5 h-5 text-slate-600 shrink-0" />
                                <span>Basic Membership Card</span>
                            </li>
                            <li className="flex items-start gap-3 opacity-30">
                                <Check className="w-5 h-5 text-slate-600 shrink-0" />
                                <span>Voting rights in general body</span>
                            </li>
                        </ul>
                        <Button className="w-full font-medium bg-white/[0.04] border border-white/[0.08] text-slate-500 hover:bg-white/[0.06] rounded-xl" disabled>
                            Contact Exec to Join
                        </Button>
                    </div>

                    {/* BASIC TIER — Featured */}
                    <div className="bg-white/[0.04] rounded-2xl p-8 border-2 border-cyan-500/40 flex flex-col relative transform md:-translate-y-4 shadow-[0_0_40px_rgba(0,188,212,0.08)]">
                        <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-cyan-500 text-[#0a0f1a] text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">
                            Standard
                        </div>
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-cyan-400 mb-2">Basic Membership</h3>
                            <p className="text-slate-500 text-sm">Full participating member</p>
                        </div>
                        <div className="mb-8 flex items-baseline gap-2">
                            <span className="text-4xl font-extrabold text-white">₹10,000+</span>
                        </div>
                        <ul className="flex flex-col gap-4 flex-1 mb-8 text-sm text-slate-300">
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-cyan-400 shrink-0" />
                                <span className="font-medium">All Pending Tier benefits</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-cyan-400 shrink-0" />
                                <span className="font-medium">Basic Membership Card</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-cyan-400 shrink-0" />
                                <span className="font-medium">Full Voting Rights</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-cyan-400 shrink-0" />
                                <span className="font-medium">Access to team facilities</span>
                            </li>
                        </ul>
                    </div>

                    {/* GOLD TIER */}
                    <div className="rounded-2xl p-8 border-2 border-amber-500/30 flex flex-col relative bg-gradient-to-br from-amber-500/[0.06] to-amber-600/[0.02] hover:border-amber-500/50 transition-all duration-300">
                        <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-500 to-amber-400 text-[#0a0f1a] text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
                            Premium
                        </div>
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-amber-400 mb-2">Gold Membership</h3>
                            <p className="text-amber-300/50 text-sm font-medium">Patrons & major contributors</p>
                        </div>
                        <div className="mb-8 flex items-baseline gap-2">
                            <span className="text-4xl font-extrabold bg-gradient-to-r from-amber-400 to-amber-300 bg-clip-text text-transparent">₹1,00,000+</span>
                        </div>
                        <ul className="flex flex-col gap-4 flex-1 mb-8 text-sm">
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-amber-400 shrink-0" />
                                <span className="font-medium text-slate-300">All Basic Tier benefits</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-amber-400 shrink-0" />
                                <span className="font-medium text-slate-300">Premium Gold Membership Card</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-amber-400 shrink-0" />
                                <span className="font-medium text-slate-300">Special mention at annual events</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Check className="w-5 h-5 text-amber-400 shrink-0" />
                                <span className="font-medium text-slate-300">VIP seating in club tournaments</span>
                            </li>
                        </ul>
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
