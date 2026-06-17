"use client"

import { useEffect, useState } from "react"
import { Search, SlidersHorizontal, CheckCircle2, ChevronLeft, ChevronRight, Loader2, CalendarX, AlertCircle } from "lucide-react"

const ITEMS_PER_PAGE = 10

// -------------------- TODO --------------------
// Implementar búsqueda y filtros
// Implementar fetch a backend para recuperar el historial del trabajador
// Botón para poder ir a los detalles del pago de cada trabajo

export default function HistoryPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")

  const [jobHistory, setJobHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJobHistory = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        const res = await fetch(`/api/jobs/history`)

        if(!res.ok) throw new Error("Failed to fetch job history")
          
        const data = await res.json()
        setJobHistory(Array.isArray(data) ? data : (data.jobs || []))
      } catch (error) {
        setError("Failed to fetch job history")
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobHistory()
  }, []);

  // Lógica de filtrado basada en la búsqueda
  const filteredJobs = jobHistory.filter(job => {
    const query = searchQuery.toLowerCase()
    return (
      (job.jobId || job.id || "").toLowerCase().includes(query) ||
      (job.client || job.clientName || "").toLowerCase().includes(query) ||
      (job.service || job.serviceType || "").toLowerCase().includes(query)
    )
  })

  // Cálculos de paginación
  const totalPages = Math.ceil(jobHistory.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentJobs = jobHistory.slice(startIndex, endIndex)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  if(isLoading){
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
        <p className="text-slate-400 mt-2 max-w-sm text-sm">
          Hubo un error al intentar recuperar el historial.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">Historial de Trabajos</h1>
        
        {/* Buscador (Solo lo mostramos si el profesional tiene al menos un trabajo en su historial general) */}
        {jobHistory.length > 0 && (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Buscar por ID, cliente o servicio..."
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

      {/* 🌟 LOGICA DE CONTROL DE ESTADOS VACÍOS 🌟 */}
      {jobHistory.length === 0 ? (
        /* CASO A: La base de datos externa retornó un array vacío (Cero trabajos realizados en su historia) */
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-2xl bg-[#0A0F1C]/50 text-center">
          <div className="bg-white/5 p-4 rounded-full mb-4">
            <CheckCircle2 className="h-8 w-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-white">Aún no tienes trabajos realizados</h3>
          <p className="text-slate-400 mt-2 max-w-sm text-sm">
            Los servicios que aceptes y completes con éxito en la plataforma aparecerán listados en esta sección.
          </p>
        </div>
      ) : filteredJobs.length === 0 ? (
        /* CASO B: Sí tiene trabajos, pero el filtro de búsqueda actual no coincide con ninguno */
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-white/10 rounded-2xl bg-[#0A0F1C]/50 text-center">
          <CalendarX className="h-10 w-10 text-slate-500 mb-3" />
          <p className="text-white font-medium">No se encontraron resultados</p>
          <p className="text-sm text-slate-400 mt-1">
            No encontramos coincidencias para "<span className="text-white font-semibold">{searchQuery}</span>". Intenta revisar el texto.
          </p>
        </div>
      ) : (
        /* CASO C: Todo está correcto y hay información para mostrar en la tabla */
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#0B0F19]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="bg-[#FFB800] text-black font-bold uppercase tracking-wider text-xs">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Fecha</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Servicio</th>
                  <th className="px-6 py-4">Monto</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {currentJobs.map((job) => (
                  <tr key={job.jobId || job.id} className="hover:bg-white/[0.02] transition cursor-pointer">
                    <td className="px-6 py-4 font-mono font-bold text-slate-400">{job.jobId || job.id}</td>
                    <td className="px-6 py-4">{job.date || "S/D"}</td>
                    <td className="px-6 py-4 font-medium text-white">{job.client || job.clientName}</td>
                    <td className="px-6 py-4">{job.service || job.serviceType}</td>
                    <td className="px-6 py-4 font-semibold text-emerald-400">{job.amount || job.price}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center text-emerald-500">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Paginación */}
          <div className="flex items-center justify-between border-t border-white/5 px-6 py-4 bg-[#0B0F19]/50">
            {/* ... Controles de paginación idénticos a los tuyos ... */}
          </div>
        </div>
      )}
    </div>
  )
}