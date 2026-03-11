"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createMemberSchema, CreateMemberInput } from "@/types"
import { toast } from "sonner"
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"

export function MemberForm({
    initialData,
    memberId
}: {
    initialData?: any,
    memberId?: string
}) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const isEditing = !!memberId

    const form = useForm<CreateMemberInput>({
        resolver: zodResolver(createMemberSchema) as any,
        defaultValues: {
            name: initialData?.name || "",
            address1: initialData?.address1 || "",
            address2: initialData?.address2 || "",
            address3: initialData?.address3 || "",
            aadhaarNo: initialData?.aadhaarNo || "",
            mobile: initialData?.mobile || "",
            email: initialData?.email || "",
            dob: initialData?.dob ? new Date(initialData.dob).toISOString().split('T')[0] : "",
            bloodGroup: initialData?.bloodGroup || "O_POS",
            isExecutive: initialData?.isExecutive || false,
            position: initialData?.position || "",
            photoUrl: initialData?.photoUrl || "",
        },
    })

    async function onSubmit(data: CreateMemberInput) {
        setIsLoading(true)
        try {
            const url = isEditing ? `/api/members/${memberId}` : "/api/members"
            const method = isEditing ? "PUT" : "POST"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            const result = await res.json()

            if (!res.ok) {
                toast.error(result.error || "Failed to save member")
            } else {
                toast.success(isEditing ? "Member updated" : "Member created")
                router.push("/admin/members")
                router.refresh()
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{isEditing ? "Edit Member" : "Add New Member"}</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="dob"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date of Birth *</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="bloodGroup"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Blood Group *</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="A_POS">A+</SelectItem>
                                                    <SelectItem value="A_NEG">A-</SelectItem>
                                                    <SelectItem value="B_POS">B+</SelectItem>
                                                    <SelectItem value="B_NEG">B-</SelectItem>
                                                    <SelectItem value="O_POS">O+</SelectItem>
                                                    <SelectItem value="O_NEG">O-</SelectItem>
                                                    <SelectItem value="AB_POS">AB+</SelectItem>
                                                    <SelectItem value="AB_NEG">AB-</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="mobile"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Mobile *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="10-digit number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="email@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="aadhaarNo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Aadhaar Number *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="12-digit number" {...field} disabled={isEditing} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Uploadthing photo upload would go here. Skipped for now per request. */}

                            <div className="md:col-span-2 space-y-4">
                                <FormField
                                    control={form.control}
                                    name="isExecutive"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center gap-3 p-4 border rounded-lg">
                                            <FormControl className="mt-[2px]">
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Executive Committee Member</FormLabel>
                                                <p className="text-sm text-muted-foreground">This member will appear on the public landing page and can be granted login access.</p>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                                {form.watch("isExecutive") && (
                                    <FormField
                                        control={form.control}
                                        name="position"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Executive Position (e.g. Secretary, President)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter position" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </div>

                            <div className="md:col-span-2 border-t pt-4">
                                <h4 className="text-sm font-medium mb-4">Address Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="address1"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>House/Building *</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="address2"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Street/Area</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="address3"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>City/PIN</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-6">
                            <Button type="button" variant="outline" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-sky-600 hover:bg-sky-700" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEditing ? "Save Changes" : "Create Member"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
