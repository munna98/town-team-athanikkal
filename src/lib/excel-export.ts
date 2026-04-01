import * as XLSX from "xlsx"

/**
 * Export a flat array of objects as an Excel (.xlsx) file.
 */
export function exportToExcel(
    data: Record<string, any>[],
    filename: string,
    sheetName = "Sheet1"
) {
    if (data.length === 0) return

    const ws = XLSX.utils.json_to_sheet(data)
    autoFitColumns(ws, data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
    XLSX.writeFile(wb, `${filename}.xlsx`)
}

/**
 * Export multiple sheets into a single Excel file.
 * Useful for Income & Expenditure (two panels) and Balance Sheet.
 */
export function exportMultiSheetExcel(
    sheets: { name: string; data: Record<string, any>[] }[],
    filename: string
) {
    const wb = XLSX.utils.book_new()
    for (const sheet of sheets) {
        if (sheet.data.length === 0) continue
        const ws = XLSX.utils.json_to_sheet(sheet.data)
        autoFitColumns(ws, sheet.data)
        XLSX.utils.book_append_sheet(wb, ws, sheet.name)
    }
    XLSX.writeFile(wb, `${filename}.xlsx`)
}

/**
 * Auto-fit column widths based on content length.
 */
function autoFitColumns(ws: XLSX.WorkSheet, data: Record<string, any>[]) {
    if (data.length === 0) return
    const keys = Object.keys(data[0])
    const colWidths = keys.map((key) => {
        const maxLen = Math.max(
            key.length,
            ...data.map((row) => {
                const val = row[key]
                return val != null ? String(val).length : 0
            })
        )
        return { wch: Math.min(maxLen + 2, 50) }
    })
    ws["!cols"] = colWidths
}
