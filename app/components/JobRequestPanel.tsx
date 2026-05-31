"use client"

import { useEffect, useState, useRef } from "react"
import { 
  Briefcase, Radio, Loader2, ShieldAlert, CheckCircle, 
  DollarSign, FileText, Star, ChevronLeft, ChevronRight 
} from "lucide-react"
import JobRequestCard from "./JobRequestCard"
import { MESSAGE_TYPES } from "@/lib/constants"

// -------------------- TODO --------------------
// Add cancel job flow
// Add real connection to client when finishing/cancelling a job
// Factor out components ?

// --- INTERFACES ---
interface jobRequest {
  jobId: string
  clientId: string
  description: string
  serviceType: string
  latitude: number
  longitude: number
  estimatedPrice?: number | null
}

interface JobRequestProps {
  professionalId: string
  initialStatus: "ONLINE" | "OFFLINE" | "BUSY"
  latitude: number
  longitude: number
}

interface ToastNotification {
  id: string
  title: string
  desc: string
  type: "payout" | "rating"
}

// --- UTILS ---
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

export default function JobRequestTable({
  professionalId,
  initialStatus,
  latitude,
  longitude,
}: JobRequestProps) {
  // --- CORE STATE ---
  const [status, setStatus] = useState<"ONLINE" | "OFFLINE" | "BUSY">(initialStatus)
  const [pendingJobs, setPendingJobs] = useState<jobRequest[]>([])
  const [currentJob, setCurrentJob] = useState<jobRequest | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState<"gps" | "saving" | null>(null)
  const [acceptingJobId, setAcceptingJobId] = useState<string | null>(null)

  // --- PAGINATION STATE ---
  const [currentPage, setCurrentPage] = useState(1)
  const JOBS_PER_PAGE = 5

  // --- MOCKUP/DEV STATE ---
  const [showCompletionForm, setShowCompletionForm] = useState(false)
  const [finalPrice, setFinalPrice] = useState("")
  const [finalDescription, setFinalDescription] = useState("")
  const [processingState, setProcessingState] = useState<"idle" | "saving" | "waiting_webhooks">("idle")
  const [toasts, setToasts] = useState<ToastNotification[]>([])

  const isBusy = status === "BUSY"
  const isOnline = status === "ONLINE"

  // SSE Connection
  useEffect(() => {
    if(!professionalId) return

    const eventSource = new EventSource(`/api/jobs/stream?professionalId=${professionalId}`)
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)

      switch(data.type) {
        case MESSAGE_TYPES.ACTIVE_JOB:
          setCurrentJob(data.job)
          setPendingJobs([])
          setStatus("BUSY")
          break
        case MESSAGE_TYPES.INITIAL_JOBS:
          setPendingJobs(data.jobs || [])
          setCurrentJob(null)
          break
        case MESSAGE_TYPES.NEW_JOB:
          if (!currentJob) {
            setPendingJobs(prev => [data, ...prev])
          }
          break
        case MESSAGE_TYPES.JOB_REMOVED:
          setPendingJobs(prev => prev.filter(j => j.jobId !== data.jobId))
          if (currentJob?.jobId === data.jobId) setCurrentJob(null)
          break
        case MESSAGE_TYPES.JOB_UPDATED:
          setPendingJobs(prev => prev.map(j => j.jobId === data.jobId ? {...j, ...data} : j))
          break
        case MESSAGE_TYPES.JOB_ACCEPTED:
          setCurrentJob(data)
          setPendingJobs([])
          setStatus("BUSY")
          break
        case MESSAGE_TYPES.JOB_COMPLETED:
          setCurrentJob(null)
          setStatus("ONLINE")
          break
        case MESSAGE_TYPES.PAYOUT_RECEIVED:
          addToast(data.title, data.desc, "payout")
          break
        case MESSAGE_TYPES.NEW_RATING:
          addToast(data.title, "Se actualizó tu rating", "rating")
          break
      }
    }

    return () => eventSource.close()
  }, [professionalId, currentJob?.jobId])

  useEffect(() => {
    const maxPages = Math.ceil(pendingJobs.length / JOBS_PER_PAGE)
    if (currentPage > maxPages && maxPages > 0) {
      setCurrentPage(maxPages)
    }
  }, [pendingJobs.length, currentPage])

  // --- DEV TOOLS ---
  const simulateIncomingJob = async () => {
  const mockJob = {
    jobId: `mock_${Date.now()}`,
    clientId: "cliente_simulado_001",
    serviceType: "GAS",     //-------------------- TODO -------------------- 
                            // Refactor serviceType a enum en el futuro
    description: "Reparación de fuga de gas en cocina (Prueba simulada)",
    latitude: latitude + (Math.random() * 0.02 - 0.01),
    longitude: longitude + (Math.random() * 0.02 - 0.01),
    estimatedPrice: 45000 + Math.floor(Math.random() * 30000),
  };

  try {
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mockJob)
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Server Error:", data);
      alert(`Error ${res.status}: ${data.error || 'Unknown error'}`);
    } else {
      console.log("Simulated job sent successfully:", data);
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
};

  // --- TOAST NOTIFICATIONS ---
  // -------------------- TODO --------------------
  // Make it show up when receives payout and new rating webhooks
  const addToast = (title: string, desc: string, type: "payout" | "rating") => {
    const id = Math.random().toString(36).substring(7)
    setToasts(prev => [...prev, { id, title, desc, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 6000)
  }

  // --- HANDLERS ---
  const handleAcceptJob = async (jobId: string) => {
    setAcceptingJobId(jobId)
    try {
      const res = await fetch("/api/jobs/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: jobId, professionalId: professionalId }),
      })
      if (!res.ok) throw new Error("Failed to accept job")
      
      // Mockup visual state update (asumiendo que SSE a veces tiene un poco de delay)
      const job = pendingJobs.find(j => j.jobId === jobId)
      if (job) {
        setCurrentJob(job)
        setFinalPrice(job.estimatedPrice?.toString() || "")
        setFinalDescription(job.description)
        setStatus("BUSY")
        setPendingJobs([])
      }
    } catch (err) {
      alert("Error accepting job")
    } finally {
      setAcceptingJobId(null)
    }
  }

  function handleToggleChange() {
    if (isBusy || isLoading) return
    const nextStatus = isOnline ? "OFFLINE" : "ONLINE"
    updateProfessionalStatus(nextStatus, nextStatus === "ONLINE")
  }

  async function handleFinishJob(e: React.FormEvent) {
    e.preventDefault()
    if (!currentJob) return

    setProcessingState("saving")

    try {
      // 1. Llamada real a tu API para completar el trabajo
      const res = await fetch("/api/jobs/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: currentJob.jobId, professionalId: professionalId }),
      })
      if (!res.ok) throw new Error("Failed to complete job")

      setProcessingState("waiting_webhooks")
      
      // 2. Mock de retraso de Webhooks (entre 3 y 8 segundos cada uno)
      fetch(`/api/jobs/${currentJob.jobId}/payout-notification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professionalId, amount: finalPrice })
      });

      fetch(`/api/professionals/${professionalId}/rating`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            rating: 5, 
            totalReviews: 10
        })
      });

      // 3. Limpieza y vuelta a ONLINE
      setCurrentJob(null)
      setShowCompletionForm(false)
      setProcessingState("idle")
      await updateProfessionalStatus("ONLINE", true)

    } catch (err) {
      console.error("Failed to complete job:", err)
      alert("Error al finalizar el trabajo.")
      setProcessingState("idle")
    }
  }

  // -------------------- TODO --------------------
  // Add cancel job handler, which would be similar to finish but hitting a different endpoint

  async function updateProfessionalStatus(nextStatus: "ONLINE" | "OFFLINE", includeCoords: boolean) {
    setIsLoading(true)
    let coordsPayload = {}

    if (includeCoords) {
      setLoadingStep("gps")
      try {
        const position = await getBrowserLocation()
        coordsPayload = { latitude: position.coords.latitude, longitude: position.coords.longitude }
      } catch (err) {
        console.warn("Location check failed")
        coordsPayload = { latitude, longitude }
      }
    }

    setLoadingStep("saving")
    try {
      const res = await fetch("/api/professional/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professionalId, status: nextStatus, ...coordsPayload }),
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

  // --- PAGINATION RENDER MATH ---
  const totalPages = Math.ceil(pendingJobs.length / JOBS_PER_PAGE)
  const paginatedJobs = pendingJobs.slice((currentPage - 1) * JOBS_PER_PAGE, currentPage * JOBS_PER_PAGE)

  return (
    <div className="relative">
      
      {/* --- TOAST NOTIFICATIONS (TOP RIGHT) --- */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto bg-[#0A0F1C] border border-white/10 shadow-2xl rounded-2xl p-4 flex items-center gap-4 w-[320px] animate-in slide-in-from-right-8 fade-in duration-500">
            <div className={`p-2 rounded-full ${toast.type === 'payout' ? 'bg-emerald-500/10' : 'bg-[#FFB800]/10'}`}>
              {toast.type === 'payout' 
                ? <DollarSign className="h-5 w-5 text-emerald-400" /> 
                : <Star className="h-5 w-5 text-[#FFB800] fill-[#FFB800]" />}
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{toast.title}</h4>
              <p className="text-xs text-slate-400">{toast.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* DEV TOOLS (Oculto en Producción) */}
      <div className="flex justify-end mb-4">
        <button 
          onClick={simulateIncomingJob}
          disabled={!isOnline || isBusy}
          className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1.5 rounded-lg hover:bg-indigo-500/20 transition disabled:opacity-50 cursor-pointer"
        >
          ⚡ Disparar Petición Real a /api/jobs
        </button>
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#0B0F19] p-8 space-y-6 transition-all duration-300">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/5 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">Estado de Disponibilidad</h2>
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
                isBusy ? "Te encuentras atendiendo un servicio activo. No puedes cambiar tu disponibilidad hasta terminarlo."
                : "Cuando estás En Línea, podrás recibir solicitudes de servicio."}
            </p>
          </div>

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
          
          {isLoading && !isBusy && (
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent w-1/2 animate-[shimmer_1.5s_infinite] transition-all" />
            </div>
          )}

          {/* -------------------- TODO -------------------- */}
          {/* Add cancel button in the active job view */}

          {isBusy && currentJob ? (
            <div className="flex flex-col items-center gap-6 max-w-md mx-auto animate-in fade-in duration-300">
              
              {!showCompletionForm ? (
                // Vista Info del Trabajo
                <>
                  <div className="rounded-full bg-amber-500/10 p-4 text-amber-400 ring-4 ring-amber-500/5">
                    <ShieldAlert className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-amber-400 font-bold text-xl mb-1">Servicio en Curso</p>
                    <p className="text-slate-300">{currentJob.description}</p>
                    {currentJob.estimatedPrice && (
                      <p className="text-emerald-400 font-semibold mt-2">
                        Precio estimado: ${currentJob.estimatedPrice.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowCompletionForm(true)}
                    className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-4 text-sm font-bold text-black transition hover:bg-amber-400"
                  >
                    <CheckCircle className="h-5 w-5" />
                    Finalizar Trabajo y Cobrar
                  </button>
                </>
              ) : (
                // Formulario de Finalización y Cobro
                <form onSubmit={handleFinishJob} className="w-full space-y-5 text-left bg-[#0A0F1C] p-6 rounded-2xl border border-white/5">
                  <h3 className="font-bold text-lg text-white mb-4 border-b border-white/5 pb-2">Detalles Finales</h3>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 flex items-center gap-2 uppercase tracking-wider">
                      <DollarSign className="h-3.5 w-3.5" /> Monto Final a Cobrar
                    </label>
                    <input 
                      type="number" 
                      value={finalPrice}
                      onChange={(e) => setFinalPrice(e.target.value)}
                      disabled={processingState !== "idle"}
                      className="w-full bg-[#030712] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none transition font-mono text-lg disabled:opacity-50"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 flex items-center gap-2 uppercase tracking-wider">
                      <FileText className="h-3.5 w-3.5" /> Detalle del Trabajo
                    </label>
                    <textarea 
                      value={finalDescription}
                      onChange={(e) => setFinalDescription(e.target.value)}
                      disabled={processingState !== "idle"}
                      rows={3}
                      className="w-full bg-[#030712] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none transition text-sm resize-none disabled:opacity-50"
                      required
                    />
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowCompletionForm(false)}
                      disabled={processingState !== "idle"}
                      className="flex-1 rounded-xl bg-white/5 px-4 py-3.5 text-sm font-bold text-slate-300 hover:bg-white/10 transition disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={processingState !== "idle"}
                      className="flex-[2] rounded-xl bg-emerald-500 px-4 py-3.5 text-sm font-bold text-black hover:bg-emerald-400 transition flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {processingState !== "idle" ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Procesando... </>
                      ) : (
                        "Confirmar y Cerrar"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : !isOnline ? (
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
            // Lista de Trabajos + Paginación
            <div className="space-y-6 text-left">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-emerald-400" />
                  <h3 className="font-bold text-lg">Solicitudes ({pendingJobs.length})</h3>
                </div>
              </div>

              {pendingJobs.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-slate-400 font-medium">Esperando nuevas solicitudes de servicio...</p>
                  <p className="text-slate-600 text-xs mt-2">
                    Última posición guardada: ({latitude.toFixed(4)}, {longitude.toFixed(4)})
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 pr-2">
                    {paginatedJobs.map((job) => (
                      <JobRequestCard
                        key={job.jobId}
                        job={job}
                        onAccept={handleAcceptJob}
                        isLoading={acceptingJobId === job.jobId}
                      />
                    ))}
                  </div>

                  {/* Paginación */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-6">
                      <p className="text-xs text-slate-500">
                        Página {currentPage} de {totalPages}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="p-2 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 disabled:opacity-30 transition"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 disabled:opacity-30 transition"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}