import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { authClient } from "@/lib/auth-client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const API_BASE = "http://localhost:3000"

interface Department {
  id: string
  name: string
  description?: string | null
}

interface FormState {
  name: string
  email: string
  password: string
  departmentId: string
}

const EMPTY_FORM: FormState = { name: "", email: "", password: "", departmentId: "" }

export function UserProvisioningPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [departments, setDepartments] = useState<Department[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${API_BASE}/departments`)
      .then((r) => r.json())
      .then(setDepartments)
      .catch(() => setError("Failed to load departments."))
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
    setSuccess(null)
  }

  async function handleCreateAccount() {
    if (isLoading) return

    if (!form.name || !form.email || !form.password || !form.departmentId) {
      setError("All fields are required.")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // 1. Create the user via better-auth admin API
      const result = await authClient.admin.createUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role: "user",
      })

      if (result.error) {
        setError(result.error.message ?? "Failed to create account.")
        return
      }

      const userId = result.data?.user?.id
      if (!userId) {
        setError("User was created but ID was not returned.")
        return
      }

      // 2. Assign the user to the selected department
      const assignRes = await fetch(`${API_BASE}/departments/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId, departmentId: form.departmentId }),
      })

      if (!assignRes.ok) {
        setError("User created but department assignment failed.")
        return
      }

      setSuccess(`Account created for ${form.email} and assigned to department.`)
      setForm(EMPTY_FORM)
    } catch {
      setError("An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  const textFields = [
    { id: "name",     label: "Full Name", type: "text",     placeholder: "Enter full name",     delay: 0.05 },
    { id: "email",    label: "Email",     type: "email",    placeholder: "Enter email address", delay: 0.1  },
    { id: "password", label: "Password",  type: "password", placeholder: "••••••••",            delay: 0.15 },
  ] as const

  return (
    <div className="flex w-full h-full flex-col gap-5 rounded-xl border border-gray-200 bg-white p-6">

      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Account Provisioning</h2>
        <p className="mt-1 text-sm text-gray-600">
          Create user accounts and assign them to a department.
        </p>
      </div>

      {/* Feedback */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Text fields */}
      <div className="grid gap-5">
        {textFields.map(({ id, label, type, placeholder, delay }) => (
          <motion.div
            key={id}
            className="flex flex-col gap-1"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
          >
            <label htmlFor={`provision-${id}`} className="text-sm font-medium text-gray-600">
              {label}
            </label>
            <input
              id={`provision-${id}`}
              name={id}
              type={type}
              value={form[id]}
              onChange={handleChange}
              className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder={placeholder}
              autoComplete="off"
            />
          </motion.div>
        ))}

        {/* Department selector */}
        <motion.div
          className="flex flex-col gap-1"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label htmlFor="provision-department" className="text-sm font-medium text-gray-600">
            Department
          </label>
          <Select
            value={form.departmentId}
            onValueChange={(val) => {
              setForm((prev) => ({ ...prev, departmentId: val }))
              setError(null)
            }}
          >
            <SelectTrigger
              id="provision-department"
              className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <SelectValue placeholder="Select a department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>
      </div>

      {/* Submit */}
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
            <span className="flex items-center gap-2">
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
