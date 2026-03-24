"use client"

import { useState } from "react"
import { read, utils } from "xlsx"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { FileUp, Loader2, Download, AlertCircle, CheckCircle2 } from "lucide-react"
import { bulkCreateMembersAction } from "@/lib/actions/members"
import { toast } from "sonner"
import { createMemberSchema } from "@/types"
import { BloodGroup } from "@prisma/client"

interface ImportMemberRow {
    name: string
    address1: string
    address2: string
    address3: string
    aadhaarNo: string
    mobile: string
    email: string
    dob: string
    bloodGroup: string
    isExecutive: boolean
    position: string
    photoUrl?: string
    isActive?: boolean
    __rowNumber: number
}

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : "Failed to import members"
}

const HEADERS_MAP: Record<string, string> = {
    "Name": "name",
    "Address1": "address1",
    "Address2": "address2",
    "Address3": "address3",
    "Aadhaar": "aadhaarNo",
    "Mobile": "mobile",
    "Email": "email",
    "DOB": "dob",
    "Blood Group": "bloodGroup",
    "Is Executive": "isExecutive",
    "Position": "position"
}

const BLOOD_GROUP_MAP: Record<string, BloodGroup> = {
    "A+": "A_POS",
    "A-": "A_NEG",
    "B+": "B_POS",
    "B-": "B_NEG",
    "O+": "O_POS",
    "O-": "O_NEG",
    "AB+": "AB_POS",
    "AB-": "AB_NEG",
}

export function BulkImportDialog({ iconOnly = false }: { iconOnly?: boolean }) {
    const CHUNK_SIZE = 100
    const [open, setOpen] = useState(false)
    const [data, setData] = useState<ImportMemberRow[]>([])
    const [isParsing, setIsParsing] = useState(false)
    const [isImporting, setIsImporting] = useState(false)
    const [errors, setErrors] = useState<Record<number, string[]>>({})
    const [importedRows, setImportedRows] = useState<number[]>([])
    const [failedRows, setFailedRows] = useState<number[]>([])
    const [importProgress, setImportProgress] = useState(0)
    const [importStatus, setImportStatus] = useState("")
    const [importError, setImportError] = useState("")

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsParsing(true)
        setErrors({})
        setImportedRows([])
        setFailedRows([])
        setImportProgress(0)
        setImportStatus("")
        setImportError("")

        try {
            const reader = new FileReader()
            reader.onload = (evt: ProgressEvent<FileReader>) => {
                const bstr = evt.target?.result
                const wb = read(bstr, { type: "binary" })
                const wsname = wb.SheetNames[0]
                const ws = wb.Sheets[wsname]
                const rawData = utils.sheet_to_json<Record<string, string | number | boolean | undefined>>(ws)

                const mappedData: ImportMemberRow[] = rawData.map((row, index) => {
                    const mapped: ImportMemberRow = {
                        name: "",
                        address1: "",
                        address2: "",
                        address3: "",
                        aadhaarNo: "",
                        mobile: "",
                        email: "",
                        dob: "",
                        bloodGroup: "",
                        isExecutive: false,
                        position: "",
                        __rowNumber: index + 2,
                    }
                    Object.entries(HEADERS_MAP).forEach(([header, key]) => {
                        let value = row[header]
                        
                        // Transform Blood Group
                        if (key === "bloodGroup" && value) {
                            value = BLOOD_GROUP_MAP[value] || value
                        }
                        
                        // Transform Is Executive
                        if (key === "isExecutive") {
                            value = value === "TRUE" || value === true || value === "Yes" || value === 1
                        }

                        // Transform DOB to ISO string if it's a number (Excel date)
                        if (key === "dob" && typeof value === 'number') {
                            const date = new Date(Math.round((value - 25569) * 86400 * 1000))
                            value = date.toISOString().split('T')[0]
                        }

                        if (key === "isExecutive") {
                            mapped.isExecutive = !!value
                            return
                        }

                        mapped[key as keyof ImportMemberRow] = value !== undefined ? String(value) : ""
                    })
                    return mapped
                })

                // Validate
                const newErrors: Record<number, string[]> = {}
                const aadhaarRows = new Map<string, number[]>()
                mappedData.forEach((item, index) => {
                    const result = createMemberSchema.safeParse(item)
                    if (!result.success) {
                        newErrors[index] = result.error.issues.map((issue) => issue.message)
                    }

                    const aadhaarNo = typeof item.aadhaarNo === "string" ? item.aadhaarNo.trim() : ""
                    if (aadhaarNo) {
                        const rows = aadhaarRows.get(aadhaarNo) ?? []
                        rows.push(item.__rowNumber)
                        aadhaarRows.set(aadhaarNo, rows)
                    }
                })

                aadhaarRows.forEach((rows, aadhaarNo) => {
                    if (rows.length < 2) return

                    mappedData.forEach((item, index) => {
                        if (item.aadhaarNo?.trim() === aadhaarNo) {
                            newErrors[index] = [
                                ...(newErrors[index] ?? []),
                                `Duplicate Aadhaar in file at Excel rows ${rows.join(", ")}`,
                            ]
                        }
                    })
                })

                setData(mappedData)
                setErrors(newErrors)
                setIsParsing(false)
            }
            reader.readAsBinaryString(file)
        } catch (error) {
            console.error(error)
            toast.error("Failed to parse Excel file")
            setIsParsing(false)
        }
    }

    const handleImport = async () => {
        if (Object.keys(errors).length > 0) {
            toast.error("Please fix errors before importing")
            return
        }

        setIsImporting(true)
        setImportedRows([])
        setFailedRows([])
        setImportProgress(0)
        setImportStatus("")
        setImportError("")

        try {
            const totalRows = data.length
            const chunks = Array.from(
                { length: Math.ceil(totalRows / CHUNK_SIZE) },
                (_, index) => data.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE)
            )

            let completed = 0

            for (let index = 0; index < chunks.length; index++) {
                const chunk = chunks[index]
                const chunkRows = chunk
                    .map((item) => item.__rowNumber)
                    .filter((row): row is number => typeof row === "number")

                setImportStatus(
                    `Importing batch ${index + 1} of ${chunks.length} (${completed + 1}-${completed + chunk.length} of ${totalRows})`
                )

                try {
                    const result = await bulkCreateMembersAction(chunk)
                    completed += result.count
                    setImportedRows((prev) => [...prev, ...chunkRows])
                    setImportProgress(Math.round((completed / totalRows) * 100))
                } catch (error: unknown) {
                    const message = getErrorMessage(error)
                    setFailedRows((prev) => [...prev, ...chunkRows])
                    setImportProgress(Math.round((completed / totalRows) * 100))
                    setImportError(message)
                    throw new Error(message)
                }
            }

            toast.success(`Successfully imported ${completed} members`)
            setOpen(false)
            reset()
        } catch (error: unknown) {
            const message = getErrorMessage(error)
            setImportStatus("Import stopped")
            setImportError(message)
            toast.error(message)
        } finally {
            setIsImporting(false)
        }
    }

    const reset = () => {
        setData([])
        setErrors({})
        setImportedRows([])
        setFailedRows([])
        setImportProgress(0)
        setImportStatus("")
        setImportError("")
    }

    const downloadTemplate = () => {
        const headers = Object.keys(HEADERS_MAP)
        const sampleRow = [
            "John Doe", "Street 1", "Area", "City", "123456789012", "9876543210", 
            "john@example.com", "1990-01-01", "B+", "No", ""
        ]
        const csvContent = [headers, sampleRow].map(e => e.join(",")).join("\n")
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const link = document.createElement("a")
        const url = URL.createObjectURL(blob)
        link.setAttribute("href", url)
        link.setAttribute("download", "member_import_template.csv")
        link.style.visibility = "hidden"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <Dialog open={open} onOpenChange={(val) => { setOpen(val); if(!val) reset(); }}>
            <DialogTrigger asChild>
                <Button 
                    variant="outline" 
                    className={`border-sky-200 text-sky-700 hover:bg-sky-50 ${iconOnly ? 'w-10 px-0' : ''}`}
                    title={iconOnly ? "Bulk Import" : undefined}
                >
                    <FileUp className={`${iconOnly ? '' : 'mr-2'} h-4 w-4`} /> 
                    {!iconOnly && "Bulk Import"}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Bulk Import Members</DialogTitle>
                    <DialogDescription>
                        Upload an Excel or CSV file to import multiple members at once. 
                        Download the template to ensure correct formatting.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex gap-4 items-center p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <Button variant="ghost" size="sm" onClick={downloadTemplate} className="text-sky-600 hover:text-sky-700 hover:bg-sky-100">
                        <Download className="mr-2 h-4 w-4" /> Download Template
                    </Button>
                    <div className="flex-1">
                        <Input 
                            type="file" 
                            accept=".xlsx, .xls, .csv" 
                            onChange={handleFileChange}
                            disabled={isParsing || isImporting}
                        />
                    </div>
                </div>

                {(isImporting || importStatus || importError) && (
                    <div className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-medium text-slate-900">
                                    {importStatus || "Preparing import"}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {importedRows.length} imported, {data.length - importedRows.length} remaining
                                </p>
                            </div>
                            <span className="text-sm font-semibold text-sky-700">{importProgress}%</span>
                        </div>
                        <Progress value={importProgress} className="h-2" />
                        {importError && (
                            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {importError}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex-1 overflow-auto mt-4 border rounded-md">
                    {isParsing ? (
                        <div className="flex flex-col items-center justify-center h-64 space-y-4">
                            <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                            <p className="text-slate-500">Parsing file...</p>
                        </div>
                    ) : data.length > 0 ? (
                        <Table>
                            <TableHeader className="bg-slate-50 sticky top-0 z-10">
                                <TableRow>
                                    <TableHead className="w-12">#</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Mobile</TableHead>
                                    <TableHead>Aadhaar</TableHead>
                                    <TableHead>DOB</TableHead>
                                    <TableHead>Blood</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((row, i) => (
                                    <TableRow
                                        key={i}
                                        className={
                                            errors[i]
                                                ? "bg-red-50"
                                                : failedRows.includes(row.__rowNumber)
                                                    ? "bg-red-50"
                                                    : importedRows.includes(row.__rowNumber)
                                                        ? "bg-emerald-50"
                                                        : ""
                                        }
                                    >
                                        <TableCell className="text-slate-400">{i + 1}</TableCell>
                                        <TableCell>
                                            {errors[i] ? (
                                                <div className="flex items-center text-red-600 gap-1">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <span className="text-xs font-medium">Error</span>
                                                </div>
                                            ) : failedRows.includes(row.__rowNumber) ? (
                                                <div className="flex items-center text-red-600 gap-1">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <span className="text-xs font-medium">Failed</span>
                                                </div>
                                            ) : importedRows.includes(row.__rowNumber) ? (
                                                <div className="flex items-center text-emerald-600 gap-1">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    <span className="text-xs font-medium">Imported</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-green-600 gap-1">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    <span className="text-xs font-medium">Valid</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{row.name}</div>
                                            {(errors[i] || (failedRows.includes(row.__rowNumber) && importError)) && (
                                                <div className="text-[10px] text-red-500 leading-tight mt-1">
                                                    {errors[i]?.join(", ") || importError}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>{row.mobile}</TableCell>
                                        <TableCell>{row.aadhaarNo}</TableCell>
                                        <TableCell>{row.dob}</TableCell>
                                        <TableCell>{row.bloodGroup}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                            <FileUp className="h-12 w-12 mb-2 opacity-20" />
                            <p>No file uploaded</p>
                        </div>
                    )}
                </div>

                <DialogFooter className="mt-4 gap-2">
                    <Button variant="ghost" onClick={() => setOpen(false)} disabled={isImporting}>
                        Cancel
                    </Button>
                    <Button 
                        disabled={data.length === 0 || isImporting || Object.keys(errors).length > 0} 
                        onClick={handleImport}
                        className="bg-sky-600 hover:bg-sky-700"
                    >
                        {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isImporting ? `Importing ${importedRows.length}/${data.length}` : `Import ${data.length} Members`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
