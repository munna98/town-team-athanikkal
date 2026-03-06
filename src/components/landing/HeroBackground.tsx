"use client"

export function HeroBackground() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1a] via-[#0d1f35] to-[#0a1628]" />

            {/* Animated diagonal stripes */}
            <div className="landing-stripes" />

            {/* Floating football shapes */}
            <div className="landing-float-1 absolute w-64 h-64 rounded-full border border-cyan-500/10 top-[10%] left-[5%]" />
            <div className="landing-float-2 absolute w-96 h-96 rounded-full border border-cyan-400/8 top-[20%] right-[-5%]" />
            <div className="landing-float-3 absolute w-48 h-48 rounded-full border border-emerald-500/10 bottom-[10%] left-[30%]" />

            {/* Hexagonal pattern accent */}
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='%2300bcd4' stroke-width='1'/%3E%3C/svg%3E")`,
                    backgroundSize: '60px 60px'
                }}
            />

            {/* Radial glow behind content */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-3xl" />
        </div>
    )
}
