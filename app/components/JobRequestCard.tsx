"use client"

import { MapPin, Clock, DollarSign, CalendarDays } from "lucide-react"

interface JobRequestCardProps {
  job: {
    jobId?: string
    id?: string 
    description: string
    estimatedPrice?: number | null
    latitude?: number
    longitude?: number
    requestedDate?: string
    scheduledTime?: string
    isAccepted?: boolean
  }
  onAccept: (jobId: string) => void
  onDecline?: (jobId: string) => void
  isLoading?: boolean
}

export default function JobRequestCard({ 
  job, 
  onAccept, 
  onDecline, 
  isLoading = false 
}: JobRequestCardProps) {
  
  const targetId = job.jobId || job.id || ""

  // 💡 Al venir el dato como '2026-06-23T06:01:00.000Z' desde la API, 'new Date()' lo procesa automáticamente
  const formattedDate = job.requestedDate 
    ? new Date(job.requestedDate).toLocaleDateString('es-ES', {
        weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      }) 
    : "Hace unos momentos"

  return (
    <div className={`group border bg-[#0A0F1C] rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between
                    ${job.isAccepted ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10' : 'border-white/10 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5'}`}>
      
      <div className="flex items-start gap-4">
        <div className="mt-1">
          <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <MapPin className="h-5 w-5 text-emerald-400" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-slate-200 leading-relaxed text-[15px]">
            {job.description}
          </p>

          {job.estimatedPrice && (
            <div className="mt-3 flex items-center gap-2 text-emerald-400">
              <DollarSign className="h-4 w-4" />
              <span className="font-semibold text-lg">
                ${job.estimatedPrice.toLocaleString()}
              </span>
            </div>
          )}

          <div className={`mt-2 text-xs flex items-center gap-1.5 ${job.requestedDate ? 'text-blue-400 font-medium' : 'text-slate-500'}`}>
            {job.requestedDate ? <CalendarDays className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
            {job.requestedDate ? `Programado para ${formattedDate}` : formattedDate}
          </div>
        </div>
      </div>

      {/* 🛠️ Lógica de Botones Dinámicos Corregida */}
      {job.isAccepted ? (
        <div className="mt-6 flex flex-col gap-3 w-full">
          <div className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-base">
            <span className="text-xl">✓</span> Trabajo Aceptado
          </div>
          
          {/* Aparece SOLO si está aceptado */}
          {onDecline && (
            <button
              type="button"
              onClick={() => onDecline(targetId)}
              disabled={isLoading}
              className="px-4 py-3 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20 text-red-400/80 hover:text-red-400 font-semibold rounded-xl transition-all duration-200 flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Rechazar / Cancelar Trabajo
            </button>
          )}
        </div>
      ) : (
        <div className="mt-6 flex w-full">
          {/* Botón Aceptar (Única opción si el trabajo es nuevo) */}
          {onAccept && (
            <button
              onClick={() => onAccept(targetId)}
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 
                         disabled:from-zinc-700 disabled:to-zinc-700 disabled:text-slate-400
                       text-white font-semibold py-4 rounded-xl transition-all duration-200
                       flex items-center justify-center gap-2 text-base shadow-md shadow-emerald-500/20"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin inline-block">⟳</span>
                  Aceptando...
                </>
              ) : (
                "Aceptar Trabajo"
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}