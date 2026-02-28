import Link from "next/link"
import { Button } from "@/components/ui/button"
import prisma from "@/lib/prisma"

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
        <div className="flex flex-col min-h-screen bg-slate-50">
            <header className="px-6 py-4 flex items-center justify-between bg-white border-b sticky top-0 z-50">
                <Link href="/" className="font-bold text-sky-600 text-xl flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold">TT</div>
                    Town Team Athanikkal
                </Link>
                <nav className="hidden md:flex gap-6 items-center text-sm font-medium">
                    <Link href="#about" className="text-slate-600 hover:text-sky-600 transition">About Us</Link>
                    <Link href="/membership" className="text-slate-600 hover:text-sky-600 transition">Membership Options</Link>
                    <Link href="/login" className="text-slate-600 hover:text-sky-600 transition">Portal Login</Link>
                </nav>
                <div className="md:hidden">
                    <Link href="/login">
                        <Button variant="outline" size="sm">Login</Button>
                    </Link>
                </div>
            </header>

            <main className="flex-1 flex flex-col">
                {/* Hero Section */}
                <section className="w-full py-24 px-6 bg-gradient-to-br from-sky-500 to-sky-800 text-white flex flex-col items-center text-center">
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight drop-shadow-sm">Welcome to Town Team</h1>
                    <p className="text-lg md:text-xl text-sky-50 max-w-2xl mx-auto mb-10 opacity-90">
                        The premier football club of Athanikkal. Uniting passion on the pitch with excellence in community.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link href="/membership">
                            <Button size="lg" className="bg-white text-sky-700 hover:bg-sky-50 font-bold shadow-lg">Become a Member</Button>
                        </Link>
                        <Link href="#about">
                            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">Learn More</Button>
                        </Link>
                    </div>
                </section>

                {/* Executive Committee */}
                <section id="about" className="w-full py-20 px-6 max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-800">Executive Committee</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto text-lg">Meet the dedicated leaders behind Town Team Athanikkal who are working tirelessly to take our club to new heights.</p>
                    </div>

                    {executives.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {executives.map((exec) => (
                                <div key={exec.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center hover:shadow-md transition">
                                    {exec.photoUrl ? (
                                        <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-sky-50">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={exec.photoUrl} alt={exec.name} className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="w-24 h-24 bg-sky-100 text-sky-600 text-3xl font-bold flex items-center justify-center rounded-full mx-auto mb-4 border-4 border-sky-50">
                                            {exec.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <h3 className="font-semibold text-lg text-slate-800">{exec.name}</h3>
                                    <p className="text-sm font-medium text-sky-600 mt-1">Executive Member</p>
                                    <p className="text-xs text-slate-400 mt-2">Blood Group: {exec.bloodGroup.replace("_", "")}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-50 border rounded-xl p-12 text-center text-slate-500">
                            <div className="font-medium text-lg mb-2">Committee details coming soon</div>
                            <p className="text-sm">The executive committee list is currently being updated.</p>
                        </div>
                    )}
                </section>
            </main>

            <footer className="w-full border-t py-10 px-6 text-center text-slate-500 bg-white">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="font-bold text-sky-600 text-lg flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs">TT</div>
                        Town Team
                    </div>
                    <p className="text-sm">&copy; {new Date().getFullYear()} Town Team Athanikkal. All rights reserved.</p>
                    <div className="flex gap-4">
                        <Link href="/login" className="text-sm hover:text-sky-600">Admin Login</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
