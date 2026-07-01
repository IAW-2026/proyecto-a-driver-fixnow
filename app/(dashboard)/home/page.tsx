import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Briefcase, ShieldCheck, MapPin } from "lucide-react"
import JobRequestTable from "@/app/components/JobRequestPanel"

export default async function HomePage() {
  const { userId } = await auth()

  if(!userId) return;

  // Fetch the professional's local database profile
  const professional = await prisma.professional.findUnique({
    where: { id: userId },
  })

  if(!professional) return;

  const formatService = (type: string | null) => {
    if (!type) return "No asignado"
    const mapping: Record<string, string> = {
      PLOMERIA: "PLOMERO",
      GAS: "GASISTA",
      ELECTRICIDAD: "ELECTRICISTA",
    }
    return mapping[type] || type
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white">

      {/* 1. MAIN BODY CONTENT */}
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

        {/* 2. METRICS GRID CARDS */}
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

          {/* Card 2: Cover Radius */}
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

        {/* 3. WORK OVERVIEW BLOCK */}
        <JobRequestTable 
          professionalId={professional.id}
          initialStatus={professional.status} // Passes: ONLINE | OFFLINE | BUSY
          latitude={professional.latitude}
          longitude={professional.longitude}
        />

      </main>
    </div>
  )
}