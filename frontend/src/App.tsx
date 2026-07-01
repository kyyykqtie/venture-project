import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { authClient } from "./lib/auth-client"
import { LoginForm, SignUpForm } from "./components/auth-forms"

function App() {
  const { data: session, isPending: isLoading } = authClient.useSession()
  const [activeForm, setActiveForm] = useState<"login" | "signup">("login")

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
          <p className="text-sm text-gray-400">Loading...</p>
        </motion.div>
      </div>
    )
  }

  if (session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <motion.div
          className="flex flex-col items-center gap-6 rounded-2xl bg-white p-10 shadow-md"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <motion.div
            className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
          >
            👤
          </motion.div>
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-800">Welcome back!</h1>
            <p className="mt-1 text-sm text-gray-500">
              Signed in as{" "}
              <span className="font-medium text-gray-700">{session.user.name}</span>
            </p>
          </div>
          <motion.button
            onClick={() => authClient.signOut()}
            className="mt-2 rounded-lg bg-red-500 px-6 py-2 text-sm font-medium text-white"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Sign out
          </motion.button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <motion.div
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-md"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Tab switcher */}
        <div className="flex rounded-lg bg-gray-100 p-1 mb-8 relative">
          <motion.div
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-md bg-white shadow-sm"
            animate={{ x: activeForm === "login" ? 0 : "calc(100% + 8px)" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
          <button
            onClick={() => setActiveForm("login")}
            className={`relative z-10 flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              activeForm === "login" ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveForm("signup")}
            className={`relative z-10 flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
              activeForm === "signup" ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Animated form swap */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeForm}
            initial={{ opacity: 0, x: activeForm === "login" ? -16 : 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeForm === "login" ? 16 : -16 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {activeForm === "login" ? <LoginForm /> : <SignUpForm />}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

export default App
