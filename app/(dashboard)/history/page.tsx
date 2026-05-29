"use client"

import { Search, SlidersHorizontal, CheckCircle2 } from "lucide-react"

const mockJobs = [
  { id: "FX1001", date: "12/10/2023", client: "M. Pérez", service: "Reparación de Gas", amount: "$150.00" },
  { id: "FX1002", date: "12/10/2023", client: "M. Pérez", service: "Reparación de Gas", amount: "$150.00" },
  { id: "FX1003", date: "12/10/2023", client: "M. Pérez", service: "Reparación de Gas", amount: "$150.00" },
  { id: "FX1004", date: "12/10/2023", client: "M. Pérez", service: "Reparación de Gas", amount: "$150.00" },
  { id: "FX1005", date: "12/10/2023", client: "M. Pérez", service: "Reparación de Gas", amount: "$150.00" },
]

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Historial de Trabajos</h1>
        
        {/* Search & Filters */}
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
              {mockJobs.map((job) => (
                <tr key={job.id} className="hover:bg-white/[0.02] transition">
                  <td className="px-6 py-4 font-mono font-bold text-slate-400">{job.id}</td>
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
      </div>
    </div>
  )
}