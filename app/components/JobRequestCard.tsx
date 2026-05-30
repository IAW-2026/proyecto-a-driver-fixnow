// components/JobRequestCard.tsx
"use client"
import { MapPin, Clock, DollarSign } from "lucide-react"

interface JobRequestCardProps {
  job: {
    id: string
    description: string
    estimatedPrice?: number | null
    latitude?: number
    longitude?: number
  }
  onAccept: (jobId: string) => void
  isLoading?: boolean
}

export default function JobRequestCard({ job, onAccept, isLoading = false }: JobRequestCardProps) {
  return (
    <div className="group border border-white/10 bg-[#0A0F1C] hover:border-emerald-500/30 
                    rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/5">
      
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

          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Hace unos momentos
          </div>
        </div>
      </div>

      <button
        onClick={() => onAccept(job.id)}
        disabled={isLoading}
        className="mt-6 w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 
                   disabled:from-zinc-700 disabled:to-zinc-700 disabled:text-slate-400
                   text-white font-semibold py-4 rounded-xl transition-all duration-200
                   flex items-center justify-center gap-2 text-base shadow-md shadow-emerald-500/20"
      >
        {isLoading ? (
          <>
            <span className="animate-spin inline-block">⟳</span>
            Aceptando trabajo...
          </>
        ) : (
          "Aceptar Trabajo"
        )}
      </button>
    </div>
  )
}