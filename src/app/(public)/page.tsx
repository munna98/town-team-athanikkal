import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import prisma from "@/lib/prisma"
import { HeroBackground } from "@/components/landing/HeroBackground"
import { Trophy, Users, Calendar, ChevronRight, Shield, Droplet } from "lucide-react"

export default async function LandingPage() {
    const executives = await prisma.member.findMany({
        where: { isExecutive: true },
        select: {
            id: true,
            name: true,
            photoUrl: true,
            bloodGroup: true
        }
    })

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

                    <div className="hidden md:flex items-center gap-8">
                        <Link href="#about" className="text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors">
                            About Us
                        </Link>
                        <Link href="#committee" className="text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors">
                            Committee
                        </Link>
                        <Link href="/membership" className="text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors">
                            Membership
                        </Link>
                        <Link href="/login">
                            <Button size="sm" className="bg-cyan-500 hover:bg-cyan-400 text-[#0a0f1a] font-bold rounded-full px-5 transition-all hover:shadow-[0_0_20px_rgba(0,188,212,0.3)]">
                                Portal Login
                            </Button>
                        </Link>
                    </div>

                    <div className="md:hidden">
                        <Link href="/login">
                            <Button size="sm" className="bg-cyan-500 hover:bg-cyan-400 text-[#0a0f1a] font-bold rounded-full px-5 transition-all hover:shadow-[0_0_20px_rgba(0,188,212,0.3)]">
                                Login
                            </Button>
                        </Link>
                    </div>
                </nav>
            </header>

            <main className="flex-1 flex flex-col">
                {/* ─── Hero Section ─── */}
                <section className="relative w-full min-h-[90vh] flex items-center justify-center px-6 pt-20">
                    <HeroBackground />

                    <div className="relative z-10 text-center max-w-5xl mx-auto">
                        {/* Logo badge */}
                        <div className="landing-fade-in mb-8 flex justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-2xl scale-150" />
                                <Image
                                    src="/logo.png"
                                    alt="Town Team Athanikkal"
                                    width={140}
                                    height={140}
                                    className="relative rounded-full border-2 border-cyan-400/30 shadow-2xl"
                                />
                            </div>
                        </div>

                        <h1 className="landing-fade-in landing-fade-in-delay-1 text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter mb-6">
                            <span className="text-white">TOWN TEAM</span>
                            <br />
                            <span className="bg-gradient-to-r from-cyan-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                                ATHANIKKAL
                            </span>
                        </h1>

                        <p className="landing-fade-in landing-fade-in-delay-2 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                            The premier football club of Athanikkal — uniting passion on the pitch
                            with excellence in community since day one.
                        </p>

                        <div className="landing-fade-in landing-fade-in-delay-3 flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/membership">
                                <Button size="lg" className="bg-cyan-500 hover:bg-cyan-400 text-[#0a0f1a] font-bold text-base rounded-full px-8 h-12 transition-all hover:shadow-[0_0_30px_rgba(0,188,212,0.4)] group">
                                    Become a Member
                                    <ChevronRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </Button>
                            </Link>
                            <Link href="#about">
                                <Button size="lg" className="bg-transparent border border-cyan-400/40 text-white hover:bg-cyan-500/10 hover:border-cyan-400/60 rounded-full px-8 h-12 font-semibold backdrop-blur-sm">
                                    Learn More
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Bottom gradient fade */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0f1a] to-transparent" />
                </section>


                {/* ─── About Section ─── */}
                <section id="about" className="w-full py-24 px-6">
                    <div className="max-w-5xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6">
                            <Shield className="w-3.5 h-3.5" />
                            About Our Club
                        </div>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
                            Built on Passion,{" "}
                            <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                                Driven by Unity
                            </span>
                        </h2>
                        <p className="text-slate-400 text-lg max-w-3xl mx-auto leading-relaxed mb-12">
                            Town Team Athanikkal is more than a football club — it&apos;s a brotherhood that thrives on
                            sportsmanship, discipline, and community. From local tournaments to regional glory,
                            we bring the spirit of Athanikkal to every match we play.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { icon: Trophy, title: "Competitive Spirit", desc: "We compete at the highest levels with determination and fair play." },
                                { icon: Users, title: "Community First", desc: "Building bonds that go beyond the pitch, strengthening our community." },
                                { icon: Calendar, title: "Year-Round Activity", desc: "From training camps to tournaments, we keep the passion alive all year." },
                            ].map((item, i) => (
                                <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 hover:bg-white/[0.05] hover:border-cyan-500/20 transition-all duration-300 group">
                                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-5 group-hover:bg-cyan-500/20 transition-colors">
                                        <item.icon className="w-6 h-6 text-cyan-400" />
                                    </div>
                                    <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ─── Executive Committee ─── */}
                <section id="committee" className="w-full py-24 px-6 bg-gradient-to-b from-transparent via-[#0d1a2e]/50 to-transparent">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6">
                                <Users className="w-3.5 h-3.5" />
                                Leadership
                            </div>
                            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                                Executive Committee
                            </h2>
                            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                                Meet the dedicated leaders working tirelessly to take our club to new heights.
                            </p>
                        </div>

                        {executives.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {executives.map((exec) => (
                                    <div
                                        key={exec.id}
                                        className="exec-card bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 text-center hover:border-cyan-500/30"
                                    >
                                        {exec.photoUrl ? (
                                            <div className="w-24 h-24 mx-auto mb-5 rounded-full overflow-hidden ring-2 ring-cyan-500/20 ring-offset-2 ring-offset-[#0a0f1a]">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={exec.photoUrl} alt={exec.name} className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 text-cyan-300 text-3xl font-bold flex items-center justify-center rounded-full mx-auto mb-5 ring-2 ring-cyan-500/20 ring-offset-2 ring-offset-[#0a0f1a]">
                                                {exec.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <h3 className="font-bold text-lg text-white">{exec.name}</h3>
                                        <p className="text-sm font-medium text-cyan-400 mt-1">Executive Member</p>
                                        <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] text-xs text-slate-500">
                                            <Droplet className="w-3.5 h-3.5 text-red-400/60 fill-red-400/60" />
                                            {exec.bloodGroup.replace("_POS", "+ve").replace("_NEG", "-ve")}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-16 text-center">
                                <div className="text-white font-semibold text-lg mb-2">Committee details coming soon</div>
                                <p className="text-slate-500 text-sm">The executive committee list is currently being updated.</p>
                            </div>
                        )}
                    </div>
                </section>
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
                    <div className="flex gap-6">
                        <Link href="/login" className="text-sm text-slate-500 hover:text-cyan-400 transition-colors">
                            Admin Login
                        </Link>
                        <Link href="/membership" className="text-sm text-slate-500 hover:text-cyan-400 transition-colors">
                            Membership
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
