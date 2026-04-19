"use client"

import { useActionState } from "react"
import { login } from "./actions"

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null)

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-sm rounded-2xl border border-amber-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <span className="text-4xl">🍳</span>
          <h1 className="mt-2 text-xl font-bold text-amber-900">My Recipes</h1>
          <p className="mt-1 text-sm text-amber-700/60">Enter the password to continue</p>
        </div>

        <form action={action} className="space-y-4">
          <input
            type="password"
            name="password"
            placeholder="Password"
            autoFocus
            required
            className="w-full rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-sm text-amber-900 placeholder:text-amber-300 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
          />

          {state?.error && (
            <p className="text-sm text-red-500">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50 transition-colors"
          >
            {pending ? "Checking…" : "Enter"}
          </button>
        </form>
      </div>
    </div>
  )
}
