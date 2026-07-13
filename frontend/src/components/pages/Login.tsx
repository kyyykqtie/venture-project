import { useId, useState, type FormEvent } from "react"
import { motion } from "framer-motion"
import { LoaderCircle } from "lucide-react"
import { authClient } from "../../lib/auth-client"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import jacolbsLogo from "@/assets/JACOLBSV2.png"
import { Dashboard } from "./menu/Dashboard"


function App() {
  const { data: session, isPending: isLoading } = authClient.useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formId = useId()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      await authClient.signIn.email({
        email,
        password,
      })
    } catch (error) {
      console.error("Sign in failed", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_38%),linear-gradient(180deg,_#f8fafc_0%,_#ffffff_100%)] px-4">
        <motion.div
          className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-background/90 px-8 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <LoaderCircle className="h-9 w-9 animate-spin text-foreground/70" />
          <p className="text-sm text-muted-foreground">Loading your session...</p>
        </motion.div>
      </div>
    )
  }

  if (session) {
    return <Dashboard />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_38%),linear-gradient(180deg,_#f8fafc_0%,_#ffffff_100%)] px-4 py-10">
      <motion.div
        className="relative w-full max-w-lg overflow-hidden  rounded-2xl border border-border bg-background/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur md:p-8"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="flex flex-col items-center gap-4 border-b border-border pb-6 text-center">
          <img
            src={jacolbsLogo}
            alt="JACOLBS logo"
            className="h-14 w-auto max-w-[220px] rounded-lg object-contain"
          />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Welcome Back!
            </h1>
            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Enter your credentials to log in to your account.
            </p>
          </div>
        </div>

        <form id={formId} onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor={`${formId}-email`}>Email</Label>
              <Input
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                id={`${formId}-email`}
                placeholder="enter your email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${formId}-password`}>Password</Label>
              <Input
                id={`${formId}-password`}
                placeholder="Enter your password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id={`${formId}-remember`}
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <Label htmlFor={`${formId}-remember`} className="font-normal text-muted-foreground">
                Remember me
              </Label>
            </div>
            <a className="text-sm underline underline-offset-4 hover:no-underline" href="#">
              Forgot password?
            </a>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </Button>

          <div className="flex items-center gap-3 before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
            <span className="text-xs text-muted-foreground">Or</span>
          </div>

          <Button variant="outline" type="button" className="w-full">
            Login with Google
          </Button>
        </form>
      </motion.div>
    </div>
  )
}

export default App

