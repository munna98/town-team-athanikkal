import { ChangePasswordForm } from "./ChangePasswordForm"

export const metadata = {
    title: "Change Password | Town Team Athanikkal",
}

export default function ChangePasswordPage() {
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="text-center sm:text-left">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Account Security</h1>
                <p className="text-slate-500">Update your password to keep your account secure.</p>
            </div>

            <div className="py-8">
                <ChangePasswordForm />
            </div>
            
            <div className="bg-sky-50 border border-sky-100 rounded-lg p-6 space-y-3">
                <h3 className="font-semibold text-sky-900 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" />
                    Password Requirements
                </h3>
                <ul className="text-sm text-sky-800 space-y-1 list-disc list-inside opacity-80">
                    <li>Minimum 8 characters long</li>
                    <li>Should be different from your current password</li>
                    <li>Avoid using common words or personal information</li>
                </ul>
            </div>
        </div>
    )
}

import { ShieldCheck } from "lucide-react"
