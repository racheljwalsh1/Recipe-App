"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const PASSWORD = "marinasmells"

export async function login(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const password = formData.get("password") as string

  if (password !== PASSWORD) {
    return { error: "Incorrect password." }
  }

  const cookieStore = await cookies()
  cookieStore.set("auth", "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  })

  redirect("/")
}
