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
    const [open, setOpen] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [data, setData] = useState<any[]>([])
    const [isParsing, setIsParsing] = useState(false)
    const [isImporting, setIsImporting] = useState(false)
    const [errors, setErrors] = useState<Record<number, string[]>>({})

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setFile(file)
        setIsParsing(true)
        setErrors({})

        try {
            const reader = new FileReader()
            reader.onload = (evt) => {
                const bstr = evt.target?.result
                const wb = read(bstr, { type: "binary" })
                const wsname = wb.SheetNames[0]
                const ws = wb.Sheets[wsname]
                const rawData = utils.sheet_to_json(ws)

                const mappedData = rawData.map((row: any) => {
                    const mapped: any = {}
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

                        mapped[key] = value !== undefined ? String(value) : (key === "isExecutive" ? false : "")
                        if (key === "isExecutive") mapped[key] = !!value
                    })
                    return mapped
                })

                // Validate
                const newErrors: Record<number, string[]> = {}
                mappedData.forEach((item, index) => {
                    const result = createMemberSchema.safeParse(item)
                    if (!result.success) {
                        newErrors[index] = result.error.issues.map((e: any) => e.message)
                    }
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
        try {
            const result = await bulkCreateMembersAction(data)
            toast.success(`Successfully imported ${result.count} members`)
            setOpen(false)
            reset()
        } catch (error: any) {
            toast.error(error.message || "Failed to import members")
        } finally {
            setIsImporting(false)
        }
    }

    const reset = () => {
        setFile(null)
        setData([])
        setErrors({})
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
                                    <TableRow key={i} className={errors[i] ? "bg-red-50" : ""}>
                                        <TableCell className="text-slate-400">{i + 1}</TableCell>
                                        <TableCell>
                                            {errors[i] ? (
                                                <div className="flex items-center text-red-600 gap-1">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <span className="text-xs font-medium">Error</span>
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
                                            {errors[i] && (
                                                <div className="text-[10px] text-red-500 leading-tight mt-1">
                                                    {errors[i].join(", ")}
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
                        Import {data.length} Members
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
