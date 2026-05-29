"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { 
  Menu, 
  X, 
  Home, 
  History, 
  Star, 
  Settings, 
  LogOut 
} from "lucide-react"
import { SignOutButton } from "@clerk/nextjs"

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { name: "Inicio", href: "/home", icon: Home },
    { name: "Historial de Trabajos", href: "/history", icon: History },
    { name: "Reseñas", href: "/reviews", icon: Star },
    { name: "Configuración de Cuenta", href: "/account", icon: Settings },
  ]

  return (
    <>
      {/* --- MOBILE TOP BAR NAVIGATION HEADER --- */}
      <div className="flex h-16 items-center justify-between border-b border-white/5 bg-[#0B0F19] px-4 md:hidden sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="FixNow" width={32} height={32} className="object-contain" />
          <span className="font-black text-sm tracking-wider uppercase bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">FixNow Pro</span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="rounded-xl border border-white/10 p-2 text-slate-400 hover:bg-white/5 hover:text-white transition cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* --- MOBILE SIDEBAR BACKDROP OVERLAY --- */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300 animate-fade-in"
        />
      )}

      {/* --- MAIN SIDEBAR CONTAINER PANEL --- */}
      <aside
        className={`fixed bottom-0 top-0 left-0 z-50 flex w-72 flex-col border-r border-white/5 bg-[#0B0F19] transition-transform duration-300 ease-in-out md:sticky md:translate-x-0
          /* Mobile Toggle Drawer Actions */
             ${isOpen ? "translate-x-0 shadow-2xl shadow-black/50" : "-translate-x-full"}
    
            /* Desktop Structural Fixes */
            md:sticky md:top-0 md:h-screen md:translate-x-0 md:flex
        `}
      >
        {/* Sidebar Header & Brand Title */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="FixNow" width={40} height={40} className="object-contain filter brightness-110" />
            <div className="flex flex-col">
              <span className="font-black tracking-wider uppercase text-white leading-tight">FixNow</span>
              <span className="text-[10px] font-bold text-[#FFB800] tracking-widest uppercase">Panel Profesional</span>
            </div>
          </div>
          {/* Mobile Close Trigger */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-xl border border-white/5 p-1.5 text-slate-500 hover:bg-white/5 hover:text-slate-300 md:hidden cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Routes Mapping Blocks */}
        <nav className="flex-1 space-y-1.5 px-4 py-6 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)} // Close layout drawer on link select click
                className={`group flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all duration-200
                  ${isActive
                    ? "bg-[#FFB800] text-black shadow-lg shadow-[#FFB800]/10 font-bold scale-[1.01]"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  }
                `}
              >
                <Icon className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105 ${isActive ? "text-black" : "text-slate-400 group-hover:text-[#FFB800]"}`} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Footer Area with Clerk Safe SignOut Action Session Buttons */}
        <div className="border-t border-white/5 p-4 bg-[#080B13]">
          <SignOutButton redirectUrl="/">
            <button className="flex w-full items-center gap-3.5 rounded-2xl px-4 py-3.5 text-sm font-semibold text-rose-400/80 hover:bg-rose-500/10 hover:text-rose-400 transition-all cursor-pointer group">
              <LogOut className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-0.5" />
              Cerrar Sesión
            </button>
          </SignOutButton>
        </div>
      </aside>
    </>
  )
}