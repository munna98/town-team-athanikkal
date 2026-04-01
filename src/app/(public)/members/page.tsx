import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, UserRound, Crown } from "lucide-react"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export default async function MembersPage() {
    const requiredTiers = ["PLATINUM", "GOLD", "SILVER", "BASIC"]
    
    // Fetch tiers with their members
    const tiers = await prisma.tier.findMany({
        where: {
            name: {
                in: requiredTiers
            }
        },
        include: {
            members: {
                where: { isActive: true },
                select: { id: true, name: true, photoUrl: true },
                orderBy: { name: 'asc' }
            }
        },
        orderBy: { threshold: 'desc' }
    });

    // Helper to get tier styling
    const getTierStyle = (name: string) => {
        switch (name) {
            case "PLATINUM": return {
                text: "text-indigo-400",
                gradient: "from-indigo-400 to-purple-400",
                border: "border-indigo-500/30",
                line: "via-indigo-500/30"
            };
            case "GOLD": return {
                text: "text-amber-400",
                gradient: "from-amber-300 to-yellow-500",
                border: "border-amber-500/30",
                line: "via-amber-500/30"
            };
            case "SILVER": return {
                text: "text-slate-300",
                gradient: "from-slate-300 to-slate-400",
                border: "border-slate-400/30",
                line: "via-slate-400/30"
            };
            case "BASIC": return {
                text: "text-cyan-400",
                gradient: "from-cyan-400 to-emerald-400",
                border: "border-cyan-500/30",
                line: "via-cyan-500/30"
            };
            default: return {
                text: "text-white",
                gradient: "from-white to-slate-300",
                border: "border-white/20",
                line: "via-white/20"
            };
        }
    }

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

            <main className="flex-1 flex flex-col items-center pt-28 pb-20 px-6 max-w-7xl mx-auto w-full">
                {/* ─── Header ─── */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-6">
                        <Users className="w-3.5 h-3.5" />
                        Our Community
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
                        <span className="text-white">Our </span>
                        <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">Members</span>
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                        Meet the dedicated individuals who make up the Town Team Athanikkal family. 
                        They are the pillars of our community.
                    </p>
                </div>

                {/* ─── Members List ─── */}
                <div className="w-full space-y-24">
                    {tiers.map(tier => {
                        if (tier.members.length === 0) return null;
                        
                        const style = getTierStyle(tier.name);
                        
                        return (
                            <div key={tier.id} className="relative">
                                {/* Tier Header */}
                                <div className="flex items-center gap-4 mb-10">
                                    <div className={`h-[1px] flex-1 bg-gradient-to-r from-transparent ${style.line} to-transparent opacity-50`} />
                                    <div className="flex flex-col items-center px-4">
                                        <div className="flex items-center gap-2">
                                            {tier.name === "PLATINUM" && <Crown className={`w-5 h-5 ${style.text}`} />}
                                            <h2 className={`text-2xl md:text-3xl font-extrabold uppercase tracking-widest bg-gradient-to-r ${style.gradient} bg-clip-text text-transparent`}>
                                                {tier.name}
                                            </h2>
                                        </div>
                                        <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">
                                            {tier.members.length} {tier.members.length === 1 ? 'member' : 'members'}
                                        </div>
                                    </div>
                                    <div className={`h-[1px] flex-1 bg-gradient-to-r from-transparent ${style.line} to-transparent opacity-50`} />
                                </div>

                                {/* Members Grid */}
                                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-x-6 gap-y-10">
                                    {tier.members.map(member => (
                                        <div key={member.id} className="group flex flex-col items-center">
                                            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-3 border-[3px] ${style.border} bg-[#0a101d] transition-transform duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-white/5 relative flex items-center justify-center`}>
                                                {member.photoUrl ? (
                                                    <Image
                                                        src={member.photoUrl}
                                                        alt={member.name}
                                                        fill
                                                        unoptimized
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <UserRound className="w-10 h-10 text-slate-600 group-hover:text-slate-500 transition-colors" />
                                                )}
                                            </div>
                                            <p className={`text-white font-medium text-xs sm:text-sm text-center leading-tight line-clamp-2 px-1 group-hover:${style.text.replace('text-', '')} transition-colors`}>
                                                {member.name}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                    
                    {tiers.every(t => t.members.length === 0) && (
                        <div className="text-center py-20 text-slate-500">
                            No members found.
                        </div>
                    )}
                </div>
            </main>

            {/* ─── Footer ─── */}
            <footer className="w-full border-t border-white/5 py-10 px-6 bg-[#060b14] mt-auto">
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
                </div>
            </footer>
        </div>
    )
}
