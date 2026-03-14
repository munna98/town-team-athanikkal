"use client"

import { useState, useRef, useCallback } from "react"
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from "react-image-crop"
import "react-image-crop/dist/ReactCrop.css"
import { useUploadThing } from "@/lib/uploadthing"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Camera, Loader2, X } from "lucide-react"
import { toast } from "sonner"

interface PhotoUploadProps {
    value?: string
    onChange: (url: string) => void
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
    return centerCrop(
        makeAspectCrop(
            { unit: "%", width: 80 },
            aspect,
            mediaWidth,
            mediaHeight
        ),
        mediaWidth,
        mediaHeight
    )
}

export function PhotoUpload({ value, onChange }: PhotoUploadProps) {
    const [imgSrc, setImgSrc] = useState("")
    const [crop, setCrop] = useState<Crop>()
    const [completedCrop, setCompletedCrop] = useState<Crop>()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [uploading, setUploading] = useState(false)
    const imgRef = useRef<HTMLImageElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const { startUpload } = useUploadThing("memberPhoto", {
        onClientUploadComplete: (res) => {
            if (res?.[0]) {
                onChange(res[0].ufsUrl)
                toast.success("Photo uploaded successfully")
            }
            setUploading(false)
            setDialogOpen(false)
            setImgSrc("")
        },
        onUploadError: (error) => {
            toast.error(`Upload failed: ${error.message}`)
            setUploading(false)
        },
    })

    const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader()
            reader.addEventListener("load", () => {
                setImgSrc(reader.result?.toString() || "")
                setDialogOpen(true)
            })
            reader.readAsDataURL(e.target.files[0])
        }
        // Reset the input so the same file can be selected again
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
    }

    const onImageLoaded = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        const { naturalWidth, naturalHeight } = e.currentTarget
        const crop = centerAspectCrop(naturalWidth, naturalHeight, 1)
        setCrop(crop)
        setCompletedCrop(crop)
    }, [])

    const getCroppedBlob = useCallback((): Promise<Blob | null> => {
        return new Promise((resolve) => {
            if (!imgRef.current || !completedCrop) {
                resolve(null)
                return
            }

            const image = imgRef.current
            const canvas = document.createElement("canvas")
            const scaleX = image.naturalWidth / image.width
            const scaleY = image.naturalHeight / image.height

            const pixelCrop = {
                x: (completedCrop.x / 100) * image.naturalWidth,
                y: (completedCrop.y / 100) * image.naturalHeight,
                width: (completedCrop.width / 100) * image.naturalWidth,
                height: (completedCrop.height / 100) * image.naturalHeight,
            }

            // If crop is in pixels, use directly
            if (completedCrop.unit === "px") {
                pixelCrop.x = completedCrop.x * scaleX
                pixelCrop.y = completedCrop.y * scaleY
                pixelCrop.width = completedCrop.width * scaleX
                pixelCrop.height = completedCrop.height * scaleY
            }

            // Output at 400x400 for uniform size
            const OUTPUT_SIZE = 400
            canvas.width = OUTPUT_SIZE
            canvas.height = OUTPUT_SIZE

            const ctx = canvas.getContext("2d")
            if (!ctx) {
                resolve(null)
                return
            }

            ctx.drawImage(
                image,
                pixelCrop.x,
                pixelCrop.y,
                pixelCrop.width,
                pixelCrop.height,
                0,
                0,
                OUTPUT_SIZE,
                OUTPUT_SIZE
            )

            canvas.toBlob(
                (blob) => resolve(blob),
                "image/jpeg",
                0.9
            )
        })
    }, [completedCrop])

    const handleCropAndUpload = async () => {
        setUploading(true)
        const blob = await getCroppedBlob()
        if (!blob) {
            toast.error("Failed to crop image")
            setUploading(false)
            return
        }

        const file = new File([blob], "member-photo.jpg", { type: "image/jpeg" })
        await startUpload([file])
    }

    const handleRemovePhoto = () => {
        onChange("")
    }

    return (
        <div className="flex flex-col items-center gap-3">
            {/* Avatar preview */}
            <div className="relative group">
                <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center cursor-pointer hover:border-sky-400 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {value ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={value} alt="Member photo" className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-center">
                            <Camera className="h-8 w-8 text-slate-400 mx-auto mb-1" />
                            <span className="text-xs text-slate-500">Upload Photo</span>
                        </div>
                    )}
                </div>
                {value && (
                    <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                        <X className="h-3 w-3" />
                    </button>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onSelectFile}
                className="hidden"
            />

            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs"
            >
                <Camera className="mr-1 h-3 w-3" />
                {value ? "Change Photo" : "Upload Photo"}
            </Button>

            {/* Crop Dialog */}
            <Dialog open={dialogOpen} onOpenChange={(open) => {
                if (!uploading) {
                    setDialogOpen(open)
                    if (!open) setImgSrc("")
                }
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Crop Photo</DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-center py-4">
                        {imgSrc && (
                            <ReactCrop
                                crop={crop}
                                onChange={(_, percentCrop) => setCrop(percentCrop)}
                                onComplete={(_, percentCrop) => setCompletedCrop(percentCrop)}
                                aspect={1}
                                circularCrop
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    ref={imgRef}
                                    alt="Crop"
                                    src={imgSrc}
                                    onLoad={onImageLoaded}
                                    style={{ maxHeight: "400px" }}
                                />
                            </ReactCrop>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setDialogOpen(false)
                                setImgSrc("")
                            }}
                            disabled={uploading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleCropAndUpload}
                            disabled={uploading}
                            className="bg-sky-600 hover:bg-sky-700"
                        >
                            {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {uploading ? "Uploading..." : "Crop & Upload"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
