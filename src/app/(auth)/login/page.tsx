"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoginInput, loginSchema } from "@/types"
import { toast } from "sonner"
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
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
import { Lock, Mail, Loader2 } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(data: LoginInput) {
        setIsLoading(true)
        try {
            const result = await signIn("credentials", {
                redirect: false,
                email: data.email,
                password: data.password,
            })

            if (result?.error) {
                toast.error("Invalid credentials")
            } else {
                toast.success("Login successful")
                router.push("/admin")
                router.refresh()
            }
        } catch (error) {
            toast.error("An error occurred during login")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Link href="/" className="absolute top-8 left-8 font-bold text-sky-600 text-xl flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold">TT</div>
                Town Team
            </Link>

            <Card className="w-full max-w-md shadow-lg border-t-4 border-t-sky-500">
                <CardHeader className="space-y-1 text-center mb-2">
                    <CardTitle className="text-2xl font-bold text-slate-800">Admin Portal</CardTitle>
                    <CardDescription>
                        Enter your credentials to access the management system
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                            <FormControl>
                                                <Input placeholder="admin@townteamathanikkal.com" className="pl-9" {...field} />
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                            <FormControl>
                                                <Input type="password" placeholder="••••••••" className="pl-9" {...field} />
                                            </FormControl>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-700" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-center border-t p-4 mt-4 bg-slate-50 text-sm text-slate-500 rounded-b-lg">
                    Authorized personnel only. Contact committee for access.
                </CardFooter>
            </Card>
        </div>
    )
}
