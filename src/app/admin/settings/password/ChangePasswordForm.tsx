"use client"

import { useState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Loader2, KeyRound, Lock, ShieldCheck, Eye, EyeOff } from "lucide-react"
import { changeUserPassword } from "@/app/actions/users"
import { toast } from "sonner"

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-700" disabled={pending}>
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Password...
                </>
            ) : (
                "Update Password"
            )}
        </Button>
    )
}

export function ChangePasswordForm() {
    const [error, setError] = useState<string | null>(null)
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    async function action(formData: FormData) {
        setError(null)
        const res = await changeUserPassword(formData)
        if (res.error) {
            setError(res.error)
            toast.error(res.error)
        } else {
            toast.success(res.message)
            // Reset form
            const form = document.querySelector('form') as HTMLFormElement
            form?.reset()
        }
    }

    return (
        <Card className="max-w-md mx-auto shadow-sm border-slate-200">
            <CardHeader className="space-y-1 bg-slate-50/50 border-b">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-sky-100 rounded-lg text-sky-600">
                        <KeyRound className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl">Change Password</CardTitle>
                </div>
            </CardHeader>
            <form action={action}>
                <CardContent className="pt-6 space-y-4">
                    {error && (
                        <div className="p-3 text-sm font-medium text-rose-600 bg-rose-50 rounded-md border border-rose-100 italic">
                            {error}
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                                id="currentPassword"
                                name="currentPassword"
                                type={showCurrent ? "text" : "password"}
                                className="pl-10 pr-10"
                                required
                                placeholder="Enter your current password"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent(!showCurrent)}
                                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                            >
                                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                            <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                                id="newPassword"
                                name="newPassword"
                                type={showNew ? "text" : "password"}
                                className="pl-10 pr-10"
                                required
                                placeholder="Min 8 characters"
                                minLength={8}
                                autoComplete="off"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                            >
                                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <div className="relative">
                            <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirm ? "text" : "password"}
                                className="pl-10 pr-10"
                                required
                                placeholder="Re-type new password"
                                minLength={8}
                                autoComplete="off"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                            >
                                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="pt-2">
                    <SubmitButton />
                </CardFooter>
            </form>
        </Card>
    )
}
