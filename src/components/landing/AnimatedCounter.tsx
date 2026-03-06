"use client"

import { useEffect, useRef, useState } from "react"

interface AnimatedCounterProps {
    target: number
    suffix?: string
    duration?: number
    label: string
}

export function AnimatedCounter({ target, suffix = "", duration = 2000, label }: AnimatedCounterProps) {
    const [count, setCount] = useState(0)
    const [hasStarted, setHasStarted] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasStarted) {
                    setHasStarted(true)
                }
            },
            { threshold: 0.3 }
        )

        if (ref.current) observer.observe(ref.current)
        return () => observer.disconnect()
    }, [hasStarted])

    useEffect(() => {
        if (!hasStarted) return

        const startTime = performance.now()
        let animationFrame: number

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)

            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * target))

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate)
            }
        }

        animationFrame = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(animationFrame)
    }, [hasStarted, target, duration])

    return (
        <div ref={ref} className="text-center">
            <div className="text-4xl md:text-5xl font-extrabold text-white tabular-nums">
                {count}{suffix}
            </div>
            <div className="text-sm md:text-base text-cyan-200 mt-2 font-medium uppercase tracking-widest">
                {label}
            </div>
        </div>
    )
}
