"use client"

import { useEffect, useState } from "react"
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, Loader2, CalendarX, Eye } from "lucide-react"

const ITEMS_PER_PAGE = 10

interface Job {
  job_id: string
  service_type: string
  description: string
  status: string
  estimated_price: number
  requested_date: string
}

export default function HistoryPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")

  const [jobHistory, setJobHistory] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJobHistory = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const res = await fetch(`/api/jobs/history`)

        if (!res.ok) throw new Error("Failed to fetch job history")
          
        const data = await res.json()
        // Adaptamos para leer tanto un array directo como una propiedad .jobs
        setJobHistory(Array.isArray(data) ? data : (data.jobs || []))
      } catch (error) {
        console.error(error)
        setError("Failed to fetch job history")
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobHistory()
  }, [])

  useEffect(() => {
    setCurrentPage(1) // Resetea a la página 1 si cambia la búsqueda
  }, [searchQuery])

  // Lógica de filtrado basada en tu estructura real de datos
  const filteredJobs = jobHistory.filter(job => {
    const query = searchQuery.toLowerCase()
    return (
      (job.job_id || "").toLowerCase().includes(query) ||
      (job.service_type || "").toLowerCase().includes(query) ||
      (job.description || "").toLowerCase().includes(query)
    )
  })

  // Cálculos de paginación
  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentJobs = filteredJobs.slice(startIndex, endIndex)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Formateador de fecha amigable (DD/MM/AAAA)
  const formatDate = (dateString: string) => {
    if (!dateString) return "S/D"
    return new Date(dateString).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Helper para renderizar dinámicamente el estado en formato Badge
  const renderStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Pagado
          </span>
        )
      case "completed":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Completado
          </span>
        )
      case "cancelled":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
            Cancelado
          </span>
        )
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">
            {status || "Desconocido"}
          </span>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-[#FFB800] mb-4" />
        <p>Cargando historial de trabajos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border border-dashed border-red-500/20 rounded-2xl bg-red-500/[0.01] text-center">
        <div className="bg-red-500/10 p-4 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">No se pudo obtener el historial</h3>
        <p className="text-slate-400 mt-2 max-w-sm text-sm">Hubo un error al intentar recuperar el historial.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">Historial de Trabajos</h1>
        
        {jobHistory.length > 0 && (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Buscar por ID, servicio o detalles..."
                className="w-full rounded-xl border border-white/5 bg-[#0B0F19] pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-[#FFB800]/40 transition"
              />
            </div>
            <button className="flex items-center gap-2 rounded-xl border border-white/5 bg-[#0B0F19] px-4 py-2.5 text-sm font-semibold text-slate-400 hover:text-white transition cursor-pointer">
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
            </button>
          </div>
        )}
      </div>

      {jobHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-2xl bg-[#0A0F1C]/50 text-center">
          <div className="bg-white/5 p-4 rounded-full mb-4">
            <CalendarX className="h-8 w-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-white">Aún no tienes trabajos realizados</h3>
          <p className="text-slate-400 mt-2 max-w-sm text-sm">
            Los servicios que aceptes y completes con éxito en la plataforma aparecerán listados en esta sección.
          </p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-white/10 rounded-2xl bg-[#0A0F1C]/50 text-center">
          <CalendarX className="h-10 w-10 text-slate-500 mb-3" />
          <p className="text-white font-medium">No se encontraron resultados</p>
          <p className="text-sm text-slate-400 mt-1">
            No encontramos coincidencias para "<span className="text-white font-semibold">{searchQuery}</span>". Intenta revisar el texto.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#0B0F19]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[#FFB800] text-black font-bold uppercase tracking-wider text-xs">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Servicio / Descripción</th>
                  <th className="px-6 py-4">Monto Estimado</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {currentJobs.map((job) => (
                  <tr key={job.job_id} className="hover:bg-white/[0.02] transition">
                    {/* Mostramos los primeros 8 caracteres del UUID para que sea legible en UI */}
                    <td className="px-6 py-4 font-mono font-bold text-slate-400" title={job.job_id}>
                      #{job.job_id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(job.requested_date)}
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate">
                      <div className="font-semibold text-white uppercase text-xs tracking-wider mb-0.5">
                        {job.service_type}
                      </div>
                      <div className="text-slate-400 text-sm truncate">{job.description}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-400 whitespace-nowrap">
                      ${job.estimated_price.toLocaleString("es-AR")}
                    </td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      {renderStatusBadge(job.status)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => alert(`Redireccionando al detalle de pago de: ${job.job_id}`)}
                        className="inline-flex items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
                        title="Ver detalles de pago"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/5 px-6 py-4 bg-[#0B0F19]/50">
              <p className="text-sm text-slate-400">
                Mostrando <span className="font-medium text-white">{startIndex + 1}</span> a{" "}
                <span className="font-medium text-white">{Math.min(endIndex, filteredJobs.length)}</span> de{" "}
                <span className="font-medium text-white">{filteredJobs.length}</span> resultados
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-white/5 p-2 bg-[#0B0F19] text-slate-400 hover:text-white disabled:opacity-40 disabled:hover:text-slate-400 transition cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-slate-400 px-2">
                  Página <span className="text-white font-medium">{currentPage}</span> de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-white/5 p-2 bg-[#0B0F19] text-slate-400 hover:text-white disabled:opacity-40 disabled:hover:text-slate-400 transition cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}