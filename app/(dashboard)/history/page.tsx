"use client"

import { useState } from "react"
import { Search, SlidersHorizontal, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react"

// Datos simulados ampliados para demostrar la paginación
const mockJobs = [
  { jobId: "FX1025", date: "15/11/2023", client: "Lucía Fernández", service: "Instalación Eléctrica", amount: "$320.00" },
  { jobId: "FX1024", date: "14/11/2023", client: "Roberto Sánchez", service: "Plomería General", amount: "$85.50" },
  { jobId: "FX1023", date: "12/11/2023", client: "M. Pérez", service: "Reparación de Gas", amount: "$150.00" },
  { jobId: "FX1022", date: "10/11/2023", client: "Ana Martínez", service: "Mantenimiento AC", amount: "$110.00" },
  { jobId: "FX1021", date: "09/11/2023", client: "Carlos Ruiz", service: "Cambio de Cañerías", amount: "$450.00" },
  { jobId: "FX1020", date: "05/11/2023", client: "Elena Gómez", service: "Reparación Eléctrica", amount: "$95.00" },
  { jobId: "FX1019", date: "02/11/2023", client: "Diego Torres", service: "Destapaciones", amount: "$60.00" },
  { jobId: "FX1018", date: "28/10/2023", client: "M. Pérez", service: "Reparación de Gas", amount: "$150.00" },
  { jobId: "FX1017", date: "25/10/2023", client: "Sofía Castro", service: "Instalación de Termotanque", amount: "$280.00" },
  { jobId: "FX1016", date: "22/10/2023", client: "Juan Díaz", service: "Plomería General", amount: "$75.00" },
  { jobId: "FX1015", date: "20/10/2023", client: "Laura Vega", service: "Revisión de Tablero", amount: "$55.00" },
  { jobId: "FX1014", date: "18/10/2023", client: "Pablo Silva", service: "Mantenimiento AC", amount: "$110.00" },
  { jobId: "FX1013", date: "15/10/2023", client: "M. Pérez", service: "Reparación de Gas", amount: "$150.00" },
  { jobId: "FX1012", date: "14/10/2023", client: "Carmen Luna", service: "Instalación Eléctrica", amount: "$190.00" },
  { jobId: "FX1011", date: "10/10/2023", client: "Andrés Pinto", service: "Destapaciones", amount: "$60.00" },
  { jobId: "FX1010", date: "08/10/2023", client: "Marta Ríos", service: "Cambio de Cañerías", amount: "$420.00" },
  { jobId: "FX1009", date: "05/10/2023", client: "Luis Navarro", service: "Plomería General", amount: "$90.00" },
  { jobId: "FX1008", date: "02/10/2023", client: "M. Pérez", service: "Reparación de Gas", amount: "$150.00" },
  { jobId: "FX1007", date: "28/09/2023", client: "Rosa Ortiz", service: "Revisión de Tablero", amount: "$50.00" },
  { jobId: "FX1006", date: "25/09/2023", client: "Jorge Ramos", service: "Instalación de Termotanque", amount: "$295.00" },
  { jobId: "FX1005", date: "20/09/2023", client: "M. Pérez", service: "Reparación de Gas", amount: "$150.00" },
  { jobId: "FX1004", date: "18/09/2023", client: "Silvia Cruz", service: "Mantenimiento AC", amount: "$110.00" },
  { jobId: "FX1003", date: "15/09/2023", client: "M. Pérez", service: "Reparación de Gas", amount: "$150.00" },
  { jobId: "FX1002", date: "10/09/2023", client: "Daniel Paz", service: "Reparación Eléctrica", amount: "$85.00" },
  { jobId: "FX1001", date: "05/09/2023", client: "M. Pérez", service: "Reparación de Gas", amount: "$150.00" },
]

const ITEMS_PER_PAGE = 10

// -------------------- TODO --------------------
// Implementar búsqueda y filtros
// Implementar fetch a backend para recuperar el historial del trabajador
// Botón para poder ir a los detalles del pago de cada trabajo

export default function HistoryPage() {
  const [currentPage, setCurrentPage] = useState(1)

  // Cálculos de paginación
  const totalPages = Math.ceil(mockJobs.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentJobs = mockJobs.slice(startIndex, endIndex)

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Historial de Trabajos</h1>
        
        {/* Search & Filters */}
        {/* -------------------- TODO -------------------- */}
        {/* Implementar funcionalidad de búsqueda y filtros */}

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar trabajo..."
              className="w-full rounded-xl border border-white/5 bg-[#0B0F19] pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#FFB800]/40 transition"
            />
          </div>
          <button className="flex items-center gap-2 rounded-xl border border-white/5 bg-[#0B0F19] px-4 py-2.5 text-sm font-semibold text-slate-400 hover:text-white transition cursor-pointer">
            <SlidersHorizontal className="h-4 w-4" />
            Filtros
          </button>
        </div>
      </div>

      {/* Responsive Table Wrapper */}
      {/* -------------------- TODO -------------------- */}
      {/* Mejorar los campos para que sean más acorde a los datos del trabajo */}
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
                <tr key={job.jobId} className="hover:bg-white/[0.02] transition">
                  <td className="px-6 py-4 font-mono font-bold text-slate-400">{job.jobId}</td>
                  <td className="px-6 py-4">{job.date}</td>
                  <td className="px-6 py-4 font-medium text-white">{job.client}</td>
                  <td className="px-6 py-4">{job.service}</td>
                  <td className="px-6 py-4 font-semibold text-emerald-400">{job.amount}</td>
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
        
        {/* Pagination Controls */}
        <div className="flex items-center justify-between border-t border-white/5 px-6 py-4 bg-[#0B0F19]/50">
          <span className="text-sm text-slate-400">
            Mostrando <span className="font-medium text-white">{startIndex + 1}</span> a{" "}
            <span className="font-medium text-white">
              {Math.min(endIndex, mockJobs.length)}
            </span>{" "}
            de <span className="font-medium text-white">{mockJobs.length}</span> resultados
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
    </div>
  )
}