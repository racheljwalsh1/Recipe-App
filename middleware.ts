import { NextRequest, NextResponse } from "next/server"

export function middleware(req: NextRequest) {
  const isAuthenticated = req.cookies.get("auth")?.value === "1"
  const isLoginPage = req.nextUrl.pathname === "/login"

  if (!isAuthenticated && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.nextUrl))
  }

  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL("/", req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
