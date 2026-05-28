import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { UserButton } from "@clerk/nextjs"
import { Briefcase, Clock, ShieldCheck, MapPin } from "lucide-react"
import StatusToggle from "../components/StatusToggle"

export default async function HomePage() {
  const { userId } = await auth()
  const user = await currentUser()

  // Guard: Redirect to landing if unauthenticated
  if (!userId || !user) {
    redirect("/")
  }

  // Fetch the professional's local database profile including their schedule
  const professional = await prisma.professional.findUnique({
    where: { id: userId },
  })

  // Guard: If they authenticated but haven't onboarded yet, send them back to onboarding
  if (!professional) {
    redirect("/onboarding") // Adjust to your actual onboarding route path
  }

  // Format the primary service label neatly
  const formatService = (type: string | null) => {
    if (!type) return "No asignado"
    const mapping: Record<string, string> = {
      PLOMERIA: "Plomero Profesional",
      GAS: "Gasista Matriculado",
      ELECTRICIDAD: "Electricista Profesional",
    }
    return mapping[type] || type
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      {/* 1. TOP NAVBAR CONTAINER */}
      <nav className="border-b border-white/5 bg-[#0B0F19] px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-20 h-20 opacity-90 transition-transform duration-500 group-hover:scale-105">
              {/* Replace with your specific Mascot Asset */}
              <Image 
                src="/logo.png" 
                alt="FixNow Mascot" 
                width={60}
                height={60}
                priority
                className="object-contain filter brightness-110 drop-shadow-[0_0_20px_rgba(255,184,0,0.15)]"
              />
            </div>
            <span className="font-black tracking-wider text-xl text-white">
              FIX<span className="text-[#FFB800]">NOW</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-400 hidden sm:inline">
              Panel del Profesional
            </span>
            <UserButton />
          </div>
        </div>
      </nav>

      {/* 2. MAIN BODY CONTENT */}
      <main className="mx-auto max-w-7xl px-6 py-10">
        
        {/* Welcome Header Banner */}
        <div className="mb-10 space-y-2">
          <h1 className="text-3xl font-black sm:text-4xl">
            ¡Hola, <span className="text-[#FFB800]">{professional.firstName}</span>!
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Gestiona tu estado de servicio, zona de cobertura y horarios desde un solo lugar.
          </p>
        </div>

        {/* 3. METRICS GRID CARDS */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10">
          
          {/* Card 1: Profession */}
          <div className="rounded-2xl border border-white/5 bg-[#0B0F19] p-6 flex items-start gap-4">
            <div className="rounded-xl bg-[#FFB800]/10 p-3 text-[#FFB800]">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Oficio</p>
              <h3 className="text-lg font-bold mt-1">{formatService(professional.serviceType)}</h3>
            </div>
          </div>

          {/* Card 2: Rating */}
          <div className="rounded-2xl border border-white/5 bg-[#0B0F19] p-6 flex items-start gap-4">
            <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Radio de Cobertura</p>
              <h3 className="text-lg font-bold mt-1">{professional.radiusKm} km a la redonda</h3>
            </div>
          </div>

          {/* Card 3: Verification Status */}
          <div className="rounded-2xl border border-white/5 bg-[#0B0F19] p-6 flex items-start gap-4">
            <div className={`rounded-xl p-3 ${professional.isVerified ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-500'}`}>
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Verificación</p>
              <h3 className="text-lg font-bold mt-1">
                {professional.isVerified ? "Cuenta Verificada" : "Pendiente de Revisión"}
              </h3>
            </div>
          </div>

        </div>

        {/* 4. WORK OVERVIEW BLOCK */}
        <StatusToggle 
          professionalId={professional.id}
          initialStatus={professional.status} // Passes: ONLINE | OFFLINE | BUSY
          latitude={professional.latitude}
          longitude={professional.longitude}
        />

      </main>
    </div>
  )
}