"use client"
import { useState, useEffect } from "react"
import JobRequestCard from "../../components/JobRequestCard"
import { CalendarClock, Loader2, ChevronLeft, ChevronRight } from "lucide-react"

const ITEMS_PER_PAGE = 9

export default function ScheduledJobsTab({ professionalServiceType, professionalId }: { professionalServiceType: string; professionalId: string }) {
  const [jobs, setJobs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchScheduledJobs = async () => {
      try{
        setIsLoading(true)
        setError(null)

        const res = await fetch(`/api/jobs/scheduled?serviceType=${professionalServiceType}`)

        if (!res.ok) throw new Error("Failed to fetch scheduled jobs")
        
        const data = await res.json()
        
        setJobs(data.jobs || [])
      } catch (error) {
        setError("Failed to fetch scheduled jobs")
        setError((error as Error).message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchScheduledJobs()
  }, [professionalServiceType])


  const handleAcceptJob = async (jobId: string) => {
    setAcceptingId(jobId)
    try {
      // -------------------- TODO --------------------
      const res = await fetch(`/api/jobs/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, professionalId })
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to accept job")
      }

      setJobs(prev => {
        const jobIndex = prev.findIndex(job => job.id === jobId || job.jobId === jobId)
        if (jobIndex === -1) return prev

        const newJobs = [...prev]

        const acceptedJob = { ...newJobs[jobIndex], 
          isAccepted: true,
        }
        newJobs.splice(jobIndex, 1)
        newJobs.unshift(acceptedJob)

        return newJobs
      })

      setCurrentPage(1)
      
    } catch (error) {
      console.error("Error accepting scheduled job:", error)
    } finally {
      setAcceptingId(null)
    }
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-4" />
        <p>Buscando trabajos programados...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-400">
        <p>Ocurrió un problema: {error}</p>
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-2xl bg-[#0A0F1C]/50">
        <div className="bg-white/5 p-4 rounded-full mb-4">
          <CalendarClock className="h-8 w-8 text-slate-500" />
        </div>
        <h3 className="text-lg font-semibold text-white">No hay trabajos programados</h3>
        <p className="text-slate-400 mt-2 max-w-sm">
          Actualmente no hay solicitudes de clientes programadas para tu rubro.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-emerald-400" />
          Trabajos Programados ({jobs.length})
        </h2>
      </div>

      {/* Grid Layout for the Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 align-items-stretch">
        {currentJobs.map(job => (
          <JobRequestCard 
            key={job.id}
            job={job}
            onAccept={handleAcceptJob}
            isLoading={acceptingId === job.id}
          />
        ))}
      </div>

      {/* Pagination Controls */}
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
    </div>
  )
}