"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { exportToExcel, exportMultiSheetExcel } from "@/lib/excel-export"

interface SingleSheetProps {
    data: Record<string, any>[]
    filename: string
    sheetName?: string
    sheets?: never
    label?: string
    variant?: "default" | "outline" | "ghost"
    size?: "default" | "sm" | "lg" | "icon"
    className?: string
}

interface MultiSheetProps {
    sheets: { name: string; data: Record<string, any>[] }[]
    filename: string
    data?: never
    sheetName?: never
    label?: string
    variant?: "default" | "outline" | "ghost"
    size?: "default" | "sm" | "lg" | "icon"
    className?: string
}

type ExportExcelButtonProps = SingleSheetProps | MultiSheetProps

export function ExportExcelButton({
    data,
    sheets,
    filename,
    sheetName,
    label = "Export Excel",
    variant = "outline",
    size = "sm",
    className = "",
}: ExportExcelButtonProps) {
    const hasData = data ? data.length > 0 : sheets ? sheets.some((s) => s.data.length > 0) : false

    const handleExport = () => {
        if (data) {
            exportToExcel(data, filename, sheetName)
        } else if (sheets) {
            exportMultiSheetExcel(sheets, filename)
        }
    }

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleExport}
            disabled={!hasData}
            className={`gap-1.5 ${className}`}
            title="Download as Excel"
        >
            <Download className="h-4 w-4" />
            {label}
        </Button>
    )
}
