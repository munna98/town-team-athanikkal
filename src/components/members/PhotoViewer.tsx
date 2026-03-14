"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Search, Download, X } from "lucide-react"

interface PhotoViewerProps {
    src: string
    alt: string
}

export function PhotoViewer({ src, alt }: PhotoViewerProps) {
    const [open, setOpen] = useState(false)

    const handleDownload = async (e: React.MouseEvent) => {
        e.preventDefault()
        try {
            const response = await fetch(src)
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            // Use name for filename
            const filename = `${alt.replace(/\s+/g, '-').toLowerCase()}-photo.jpg`
            link.setAttribute("download", filename)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error("Failed to download image:", error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="relative group cursor-pointer h-16 w-16 rounded-full overflow-hidden shrink-0 ring-2 ring-sky-100 ring-offset-2 transition-transform hover:scale-105">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={alt} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Search className="h-5 w-5 text-white" />
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl p-0 overflow-hidden border-none bg-transparent shadow-none flex flex-col items-center">
                <DialogHeader className="sr-only">
                    <DialogTitle>{alt}</DialogTitle>
                    <DialogDescription>Full size photo of {alt}</DialogDescription>
                </DialogHeader>
                
                <div className="relative w-full aspect-square max-h-[80vh] flex items-center justify-center group/viewer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                        src={src} 
                        alt={alt} 
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
                    />
                    
                    {/* Floating controls */}
                    <div className="absolute top-4 right-4 flex gap-2">
                        <Button 
                            variant="secondary" 
                            size="icon" 
                            className="rounded-full bg-black/50 hover:bg-black/70 text-white border-none backdrop-blur-md"
                            onClick={handleDownload}
                            title="Download Photo"
                        >
                            <Download className="h-5 w-5" />
                        </Button>
                        <Button 
                            variant="secondary" 
                            size="icon" 
                            className="rounded-full bg-black/50 hover:bg-black/70 text-white border-none backdrop-blur-md"
                            onClick={() => setOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
                
                <div className="mt-4 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-sm font-medium">
                    {alt}
                </div>
            </DialogContent>
        </Dialog>
    )
}
