"use client"

import { useEffect, useState } from "react"
import { Briefcase, Radio, Trash2, Loader2, ShieldAlert, CheckCircle, MapPin } from "lucide-react"
import JobRequestCard from "./JobRequestCard"

interface jobRequest {
  id: string
  clientName: string
  description: string
  estimatedPrice?: number | null
  latitude: number
  longitude: number
  status: string
}

interface StatusToggleProps {
  professionalId: string
  initialStatus: "ONLINE" | "OFFLINE" | "BUSY"
  latitude: number
  longitude: number
}

function getBrowserLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"))
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 7000,
    })
  })
}

export default function StatusToggle({
  professionalId,
  initialStatus,
  latitude,
  longitude,
}: StatusToggleProps) {
  const [status, setStatus] = useState<"ONLINE" | "OFFLINE" | "BUSY">(initialStatus)
  const [pendingJobs, setPendingJobs] = useState<jobRequest[]>([])
  const [currentJob, setCurrentJob] = useState<jobRequest | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState<"gps" | "saving" | null>(null)
  const [acceptingJobId, setAcceptingJobId] = useState<string | null>(null)

  const isBusy = status === "BUSY"
  const isOnline = status === "ONLINE"

  //SSE Connection
  useEffect(() => {
    if(!professionalId) return

    const eventSource = new EventSource(`/api/jobs/stream?professionalId=${professionalId}`)
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)

      switch(data.type) {
        case 'current_job':
          setCurrentJob(data.job)
          setPendingJobs([])
          setStatus("BUSY")
          break

        case 'initial_jobs':
          setPendingJobs(data.jobs || [])
          setCurrentJob(null)
          break

        case 'new_job':
          if (!currentJob) {
            setPendingJobs(prev => [data, ...prev])
          }
          break

        case 'job_removed':
          setPendingJobs(prev => prev.filter(j => j.id !== data.job_id))
          if (currentJob?.id === data.job_id) setCurrentJob(null)
          break

        case 'job_accepted':
          setCurrentJob(data)
          setPendingJobs([])
          setStatus("BUSY")
          break

        case 'job_completed':
          setCurrentJob(null)
          setStatus("ONLINE")
          break
      }
    }

    return () => eventSource.close()
  }, [professionalId, currentJob?.id]);

  const handleAcceptJob = async (jobId: string) => {
    setAcceptingJobId(jobId)
    try {
      const res = await fetch("/api/jobs/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: jobId, professional_id: professionalId }),
      })
      if (!res.ok) throw new Error("Failed to accept job")
    } catch (err) {
      alert("Error accepting job")
    } finally {
      setAcceptingJobId(null)
    }
  }


  async function updateProfessionalStatus(nextStatus: "ONLINE" | "OFFLINE", includeCoords: boolean) {
    setIsLoading(true)
    let coordsPayload = {}

    if (includeCoords) {
      setLoadingStep("gps") // Subtle hint: reading GPS hardware
      try {
        const position = await getBrowserLocation()
        coordsPayload = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }
      } catch (err) {
        if (err instanceof GeolocationPositionError) {
          console.warn("Location check failed:", err.message)
        }
        coordsPayload = { latitude, longitude }
      }
    }

    setLoadingStep("saving") // Subtle hint: sending data over the network
    try {
      const res = await fetch("/api/professional/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professionalId,
          status: nextStatus,
          ...coordsPayload,
        }),
      })

      if (!res.ok) throw new Error("Server rejected transition")
      setStatus(nextStatus)
    } catch (err) {
      console.error("Failed executing request:", err)
    } finally {
      setIsLoading(false)
      setLoadingStep(null)
    }
  }

  function handleToggleChange() {
    if (isBusy || isLoading) return
    const nextStatus = isOnline ? "OFFLINE" : "ONLINE"
    updateProfessionalStatus(nextStatus, nextStatus === "ONLINE")
  }

  async function handleFinishJob() {
    if (isLoading || !currentJob) return
    setIsLoading(true)
    try{
      const res = await fetch("/api/jobs/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id: currentJob?.id, professional_id: professionalId }),
      })
      if (!res.ok){
        const error = await res.json()
        throw new Error(error.error || "Failed to complete job")
      }
      setCurrentJob(null)
      setPendingJobs([])
      await updateProfessionalStatus("ONLINE", true)
    } catch (err) {
      console.error("Failed to complete job:", err)
      alert("Error al finalizar el trabajo. Intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-[#0B0F19] p-8 space-y-6 transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/5 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">Estado de Disponibilidad</h2>
            
            {/* Status Badge */}
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase transition-colors duration-300
              ${isOnline ? "bg-emerald-500/10 text-emerald-400" : ""}
              ${status === "OFFLINE" ? "bg-slate-500/10 text-slate-400" : ""}
              ${isBusy ? "bg-amber-500/10 text-amber-400 animate-pulse" : ""}
            `}>
              <span className={`h-1.5 w-1.5 rounded-full transition-transform duration-300
                ${isOnline ? "bg-emerald-400 scale-110 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : ""}
                ${status === "OFFLINE" ? "bg-slate-400" : ""}
                ${isBusy ? "bg-amber-400" : ""}
              `} />
              {status === "ONLINE" && "En Línea"}
              {status === "OFFLINE" && "Desconectado"}
              {status === "BUSY" && "Trabajando"}
            </span>
          </div>
          <p className="text-slate-400 text-sm max-w-xl">
            { isOnline ? "Estás disponible para recibir solicitudes de servicio." :
              isBusy
              ? "Te encuentras atendiendo un servicio activo. No puedes cambiar tu disponibilidad hasta terminarlo."
              : "Cuando estás En Línea, podrás recibir solicitudes de servicio."}
          </p>
        </div>

        {/* --- CUSTOM INTERACTIVE TOGGLE BUTTON WITH PULSING RINGS --- */}
        <div className="flex items-center sm:justify-end">
          <button
            type="button"
            disabled={isBusy || isLoading}
            onClick={handleToggleChange}
            className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out outline-none ring-offset-black focus:ring-2 focus:ring-emerald-500/40
              ${isOnline ? "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.2)]" : "bg-white/10"}
              ${isBusy ? "bg-amber-500/30 cursor-not-allowed opacity-60" : ""}
              ${isLoading ? "opacity-80" : ""}
            `}
          >
            <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-300 ease-in-out flex items-center justify-center
              ${isOnline ? "translate-x-7" : "translate-x-0"}
              ${isBusy ? "bg-amber-200" : ""}
            `}>
              {isLoading && <Loader2 className="h-3 w-3 animate-spin text-emerald-600" />}
            </span>
          </button>
        </div>
      </div>

      {/* --- WORKSPACE VIEW OVERVIEW PANEL --- */}
      <div className="rounded-xl border border-white/5 bg-[#030a14] p-8 text-center transition-all duration-300 relative overflow-hidden">
        {isLoading && (
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent w-1/2 animate-[shimmer_1.5s_infinite] transition-all" />
          </div>
        )}

        {isLoading ? (
          // Loading state (unchanged)
          <div className="py-4 flex flex-col items-center justify-center gap-3 animate-fade-in">
          </div>
        ) : isBusy && currentJob ? (
          // Current Job View
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-amber-500/10 p-4 text-amber-400 ring-4 ring-amber-500/5">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-amber-400 font-bold text-lg">Servicio en Curso</p>
              <p className="text-slate-300">{currentJob.description}</p>
              {currentJob.estimatedPrice && (
                <p className="text-emerald-400 font-semibold">
                  Precio estimado: ${currentJob.estimatedPrice.toLocaleString()}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleFinishJob}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-black transition hover:bg-amber-400 hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-lg shadow-amber-500/10"
            >
              <CheckCircle className="h-4 w-4" />
              Finalizar Trabajo y Volver En Línea
            </button>
          </div>
        ) :!isOnline ? (   // ← NEW: OFFLINE State
        <div className="py-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
            <Radio className="h-8 w-8 text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold text-slate-400">Estás Desconectado</h3>
          <p className="text-slate-500 mt-2 max-w-xs">
            Activa tu estado a <span className="text-emerald-400">"En Línea"</span> para ver solicitudes disponibles.
          </p>
        </div>
        ) : (
          // Available Jobs View
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Briefcase className="h-5 w-5 text-emerald-400" />
              <h3 className="font-bold text-lg">Solicitudes Disponibles ({pendingJobs.length})</h3>
            </div>

            {pendingJobs.length === 0 ? (
              <div className="py-12">
                <p className="text-slate-400 font-medium">Aquí recibirás notificaciones sobre nuevas solicitudes de servicio.</p>
                <p className="text-slate-600 text-xs mt-2">
                  Última posición guardada: ({latitude}, {longitude})
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {pendingJobs.map((job) => (
                  <JobRequestCard
                    key={job.id}
                    job={job}
                    onAccept={handleAcceptJob}
                    isLoading={acceptingJobId === job.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}