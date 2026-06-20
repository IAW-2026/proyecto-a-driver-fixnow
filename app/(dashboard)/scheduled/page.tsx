"use client"
import { useState, useEffect, useCallback } from "react"
import JobRequestCard from "../../components/JobRequestCard"
import { Calendar, CheckSquare, Square, CalendarClock, Loader2, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"

const ITEMS_PER_PAGE = 9

export default function ScheduledJobsTab({ professionalId }: { professionalId: string }) {
  const [jobs, setJobs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Filtros
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [showUnaccepted, setShowUnaccepted] = useState(true)
  const [showAccepted, setShowAccepted] = useState(true)

  // Estados para el botón de refresco y su bloqueo (cooldown)
  const [refreshCooldown, setRefreshCooldown] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)

  // 1. Extraemos la función de Fetch a un useCallback para reutilizarla
  const fetchScheduledJobs = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams({
        professionalId,
        showUnaccepted: String(showUnaccepted),
        showAccepted: String(showAccepted),
      })
      if (startDate) params.append("startDate", startDate)
      if (endDate) params.append("endDate", endDate)

      const res = await fetch(`/api/jobs/scheduled?${params.toString()}`)

      if (!res.ok) throw new Error("Failed to fetch scheduled jobs")
      
      const data = await res.json()
      const fetchedJobs = Array.isArray(data) ? data : (data.jobs || [])

      // Ordenar los datos iniciales que vienen del backend para priorizar los aceptados arriba
      const sortedInitialJobs = [...fetchedJobs].sort((a, b) => {
        if (a.isAccepted && !b.isAccepted) return -1
        if (!a.isAccepted && b.isAccepted) return 1
        return 0
      })

      setJobs(sortedInitialJobs)
      setCurrentPage(1)
    } catch (error) {
      setError((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }, [professionalId, startDate, endDate, showUnaccepted, showAccepted])

  // Disparador de filtros automáticos
  useEffect(() => {
    fetchScheduledJobs()
  }, [fetchScheduledJobs])

  // Manejador del botón de actualizar con bloqueo por segundos
  const handleManualRefresh = async () => {
    if (refreshCooldown || isLoading) return

    await fetchScheduledJobs()

    // Activamos el bloqueo por 4 segundos
    setRefreshCooldown(true)
    setCooldownSeconds(4)

    // Un pequeño intervalo para la cuenta regresiva visual del botón
    const interval = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setRefreshCooldown(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleAcceptJob = async (jobId: string) => {
    setAcceptingId(jobId)
    try {
      const res = await fetch(`/api/jobs/acceptation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, professionalId })
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to accept job")
      }

      // 2. Lógica de reordenamiento: Agrupa TODOS los aceptados arriba
      setJobs(prev => {
        // Marcamos el item editado como aceptado
        const updatedJobs = prev.map(job => 
          (job.id === jobId || job.jobId === jobId) ? { ...job, isAccepted: true } : job
        )

        // Ordenamos el array completo: los aceptados (true) van primero (-1)
        return updatedJobs.sort((a, b) => {
          if (a.isAccepted && !b.isAccepted) return -1
          if (!a.isAccepted && b.isAccepted) return 1
          return 0 
        })
      })

      setCurrentPage(1)
      
    } catch (error) {
      console.error("Error accepting scheduled job:", error)
    } finally {
      setAcceptingId(null)
    }
  }

  const handleDeclineJob = (jobId: string) => {
    setJobs(prev => prev.filter(job => job.id !== jobId && job.jobId !== jobId))
  }

  // Cálculos de paginación
  const totalPages = Math.ceil(jobs.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentJobs = jobs.slice(startIndex, endIndex)

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  return (
    <div className="space-y-6">
      {/* Encabezado Principal con el Botón de Refresco */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-emerald-400" />
          Trabajos Programados ({jobs.length})
        </h2>

        {/* Botón de refresco con estados Responsivos */}
        <button
          onClick={handleManualRefresh}
          disabled={isLoading || refreshCooldown}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-300
            ${refreshCooldown 
              ? "border-amber-500/20 bg-amber-500/5 text-amber-400 opacity-75 cursor-not-allowed" 
              : "border-white/10 bg-[#0A0F1C] text-slate-300 hover:text-white hover:bg-white/[0.02] disabled:opacity-50"
            }`}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
          ) : (
            <RefreshCw className={`h-4 w-4 ${refreshCooldown ? "" : "group-hover:rotate-180 transition-transform duration-500"}`} />
          )}
          
          {refreshCooldown ? `Esperar (${cooldownSeconds}s)` : "Actualizar"}
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0A0F1C] p-4 rounded-2xl border border-white/5">
        {/* Checkboxes */}
        <div className="flex items-center gap-4 bg-[#030712] px-4 py-2.5 rounded-xl border border-white/5">
          <button 
            onClick={() => setShowAccepted(!showAccepted)}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition"
          >
            {showAccepted ? <CheckSquare className="h-4 w-4 text-emerald-400" /> : <Square className="h-4 w-4 text-slate-500" />}
            Aceptados
          </button>
          <div className="h-4 w-[1px] bg-white/10" />
          <button 
            onClick={() => setShowUnaccepted(!showUnaccepted)}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition"
          >
            {showUnaccepted ? <CheckSquare className="h-4 w-4 text-emerald-400" /> : <Square className="h-4 w-4 text-slate-500" />}
            Disponibles
          </button>
        </div>

        {/* Rango de Fechas con Apertura Dinámica (showPicker) */}
        <div className="flex flex-wrap items-center gap-2 bg-[#030712] p-2 rounded-xl border border-white/5 text-sm">
          <Calendar className="h-4 w-4 text-slate-400 ml-2" />
          <input 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
            onClick={(e) => e.currentTarget.showPicker()}
            className="bg-transparent text-white outline-none [color-scheme:dark] px-1 cursor-pointer select-none"
          />
          <span className="text-slate-600 font-medium">al</span>
          <input 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
            onClick={(e) => e.currentTarget.showPicker()}
            className="bg-transparent text-white outline-none [color-scheme:dark] px-1 cursor-pointer select-none"
          />
        </div>
      </div>

      {/* Contenido Dinámico */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-4" />
          <p className="text-sm">Filtrando agenda...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-red-500/20 rounded-2xl bg-red-500/[0.01] text-center">
          <h3 className="text-md font-semibold text-white">No se pudo obtener los trabajos</h3>
          <p className="text-slate-400 mt-1 text-xs max-w-sm">{error}</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-2xl bg-[#0A0F1C]/30">
          <h3 className="text-base font-semibold text-slate-300">No hay resultados</h3>
          <p className="text-slate-500 mt-1 text-sm max-w-xs">
            Prueba cambiando las fechas o activando otros filtros de estado.
          </p>
        </div>
      ) : (
        <>
          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 align-items-stretch">
            {currentJobs.map(job => (
              <JobRequestCard 
                key={job.id || job.jobId}
                job={job}
                onAccept={handleAcceptJob}
                onDecline={handleDeclineJob}
                isLoading={acceptingId === job.id || acceptingId === job.jobId}
              />
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-6">
              <span className="text-sm text-slate-400">
                Mostrando <span className="font-medium text-white">{startIndex + 1}</span> a{" "}
                <span className="font-medium text-white">
                  {Math.min(endIndex, jobs.length)}
                </span>{" "}
                de <span className="font-medium text-white">{jobs.length}</span> solicitudes
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-[#0B0F19] text-slate-400 hover:text-white hover:bg-white/[0.02] disabled:opacity-50 disabled:cursor-not-allowed transition"
                  aria-label="Página anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-[#0B0F19] text-slate-400 hover:text-white hover:bg-white/[0.02] disabled:opacity-50 disabled:cursor-not-allowed transition"
                  aria-label="Página siguiente"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}