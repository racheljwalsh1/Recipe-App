import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import Link from "next/link"
import "./globals.css"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Recipe App",
  description: "Save and browse your favourite recipes",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <header className="border-b border-amber-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-amber-700 tracking-tight">
              🍳 My Recipes
            </Link>
            <Link
              href="/recipes/new"
              className="rounded-full bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
            >
              <span className="hidden sm:inline">+ New Recipe</span>
              <span className="sm:hidden">+</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8">{children}</main>
        <footer className="border-t border-amber-100 py-4 text-center text-sm text-amber-800/50">
          My Recipe Book
        </footer>
      </body>
    </html>
  )
}
