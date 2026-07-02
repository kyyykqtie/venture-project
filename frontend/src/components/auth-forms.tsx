import { useState } from "react"
import { motion } from "framer-motion"
import { authClient } from "../lib/auth-client"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export function LoginForm() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            await authClient.signIn.email({ email, password })
        } catch (error) {
            console.error("Sign in failed", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <h2 className="text-xl font-semibold text-gray-800">Sign In</h2>

            <motion.div
                className="flex flex-col gap-1"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
            >
                <label htmlFor="email" className="text-sm font-medium text-gray-600">
                    Email
                </label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    placeholder="you@example.com"
                />
            </motion.div>

            <motion.div
                className="flex flex-col gap-1"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <label htmlFor="password" className="text-sm font-medium text-gray-600">
                    Password
                </label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    placeholder="••••••••"
                />
            </motion.div>

            <motion.button
                type="submit"
                disabled={isLoading}
                className="mt-1 rounded-lg bg-blue-500 py-2.5 text-sm font-medium text-white disabled:opacity-60"
                whileHover={{ scale: isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isLoading ? 1 : 0.97 }}
                transition={{ type: "spring", stiffness: 300 }}
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Signing In...
                    </span>
                ) : (
                    "Sign In"
                )}
            </motion.button>
        </form>
    )
}

async function provisionAccount(payload: {
    email: string
    username: string
    password: string
    department: string
}) {
    return Promise.resolve(payload)
}



