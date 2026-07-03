import { useState } from "react"
import { motion } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


export  function UserProvisioningPage() {
    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [department, setDepartment] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleCreateAccount = async () => {
        if (isLoading) return

        // No native form submission; do minimal client-side validation.
        if (!email || !username || !password || !department) {
            console.error("Missing required fields for account provisioning")
            return
        }

        setIsLoading(true)
        try {
            await provisionAccount({
                email,
                username,
                password,
                department,
            })
        } catch (error) {
            console.error("Account provisioning failed", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex w-full  h-full flex-col gap-5 rounded-xl border border-gray-200 bg-white p-6 ">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Account Provisionary</h2>
                    <p className="mt-1 text-sm text-gray-600">
                       Provision credentials without traditional form submission.
                    </p>
                </div>

            
            </div>

            <div className="grid gap-5 sm:grid-cols-1">
                <motion.div
                    className="flex flex-col gap-1"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                >
                    <label htmlFor="provision-email" className="text-sm font-medium text-gray-600">
                        Email
                    </label>
                    <input
                        type="email"
                        id="provision-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        placeholder="Enter email address"
                    />
                </motion.div>

                <motion.div
                    className="flex flex-col gap-1"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <label htmlFor="provision-username" className="text-sm font-medium text-gray-600">
                        Username
                    </label>
                    <input
                        type="text"
                        id="provision-username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        placeholder="Enter username"
                    />
                </motion.div>

                <motion.div
                    className="flex flex-col gap-1"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    <label htmlFor="provision-password" className="text-sm font-medium text-gray-600">
                        Password
                    </label>
                    <input
                        type="password"
                        id="provision-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        placeholder="••••••••"
                    />
                </motion.div>

                <motion.div
                    className="flex flex-col gap-1"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <label htmlFor="provision-department" className="text-sm font-medium text-gray-600">
                        Department
                    </label>
                    <Select value={department} onValueChange={setDepartment}>
                        <SelectTrigger
                            id="provision-department"
                            className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        >
                            <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="engineering">Engineering</SelectItem>
                            <SelectItem value="sales">Sales</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="hr">HR</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="support">Support</SelectItem>
                        </SelectContent>
                    </Select>
                </motion.div>
            </div>

            <motion.div className="flex items-center justify-end">
                <motion.button
                    type="button"
                    onClick={handleCreateAccount}
                    disabled={isLoading}
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.97 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Provisioning...
                        </span>
                    ) : (
                        "Create Account"
                    )}
                </motion.button>
            </motion.div>
        </div>
    )
}

export default UserProvisioningPage

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function provisionAccount(_arg0: { email: string; username: string; password: string; department: string }) {
    throw new Error("Function not implemented.")
}

