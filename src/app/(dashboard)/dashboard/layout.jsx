"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { cn, isNavActive } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { HamburgerMenu } from "@/components/layout/HamburgerMenu"

const NAV_LINKS = [
  { href: "/dashboard",        label: "Inicio" },
  { href: "/dashboard/skills", label: "Skills" },
  { href: "/dashboard/users",  label: "Usuarios" },
  { href: "/dashboard/goals",  label: "Metas" },
  { href: "/chat",             label: "Comunidad" },
]

export default function DashboardLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    if (!token) router.replace("/login")
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    router.replace("/login")
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-base font-semibold">
            Skill Exchange
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm transition-colors",
                  isNavActive(pathname, link.href)
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="hidden md:flex"
          >
            Cerrar sesión
          </Button>

          <HamburgerMenu links={NAV_LINKS} onLogout={handleLogout} />
        </div>
      </header>

      {children}
    </div>
  )
}
