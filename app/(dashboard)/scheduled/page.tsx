"use client"
import { useState } from "react"
import JobRequestCard from "../../components/JobRequestCard"
import { CalendarClock, Loader2, ChevronLeft, ChevronRight } from "lucide-react"

// Datos simulados para visualizar la interfaz
const mockScheduledJobs = [
  { id: "SCH-1001", clientName: "Martín López", service: "Revisión de Instalación", requestedDate: "15/06/2026", scheduledTime: "09:00", address: "Av. Alem 123", description: "Revisión anual preventiva." },
  { id: "SCH-1002", clientName: "Lucía Fernández", service: "Mantenimiento AC", requestedDate: "16/06/2026", scheduledTime: "10:30", address: "Mitre 456", description: "Limpieza de filtros y carga de gas." },
  { id: "SCH-1003", clientName: "Carlos Ruiz", service: "Cambio de Cañerías", requestedDate: "16/06/2026", scheduledTime: "14:00", address: "Sarmiento 789", description: "Reemplazo de caño principal del baño." },
  { id: "SCH-1004", clientName: "Ana Martínez", service: "Instalación Eléctrica", requestedDate: "17/06/2026", scheduledTime: "08:00", address: "Zapiola 321", description: "Cableado nuevo para ampliación." },
  { id: "SCH-1005", clientName: "Diego Torres", service: "Reparación de Gas", requestedDate: "18/06/2026", scheduledTime: "11:00", address: "Urquiza 654", description: "Pérdida detectada en la cocina." },
  { id: "SCH-1006", clientName: "Elena Gómez", service: "Destapaciones", requestedDate: "19/06/2026", scheduledTime: "16:00", address: "Belgrano 987", description: "Desagüe tapado en lavadero." },
  { id: "SCH-1007", clientName: "Juan Díaz", service: "Plomería General", requestedDate: "20/06/2026", scheduledTime: "09:30", address: "San Martín 159", description: "Cambio de grifería completa." },
  { id: "SCH-1008", clientName: "Sofía Castro", service: "Instalación de Termotanque", requestedDate: "21/06/2026", scheduledTime: "10:00", address: "Rivadavia 753", description: "Instalación de equipo nuevo de 120L." },
  { id: "SCH-1009", clientName: "Pablo Silva", service: "Revisión de Tablero", requestedDate: "22/06/2026", scheduledTime: "13:30", address: "Alsina 852", description: "Saltan las térmicas con frecuencia." },
  { id: "SCH-1013", clientName: "Luis Navarro", service: "Plomería General", requestedDate: "26/06/2026", scheduledTime: "14:30", address: "Donado 963", description: "Fuga de agua en pared del baño." },
  { id: "SCH-1014", clientName: "Marta Ríos", service: "Cambio de Cañerías", requestedDate: "27/06/2026", scheduledTime: "09:00", address: "Rondeau 741", description: "Renovación de plomería antigua." },
  { id: "SCH-1015", clientName: "Jorge Ramos", service: "Instalación de Termotanque", requestedDate: "28/06/2026", scheduledTime: "11:30", address: "Vieytes 852", description: "Reemplazo de termotanque pinchado." },
  { id: "SCH-1016", clientName: "Rosa Ortiz", service: "Revisión de Tablero", requestedDate: "29/06/2026", scheduledTime: "16:00", address: "Blandengues 159", description: "Cambio de disyuntor." },
  { id: "SCH-1017", clientName: "Silvia Cruz", service: "Mantenimiento AC", requestedDate: "30/06/2026", scheduledTime: "10:00", address: "Castelli 357", description: "Reubicación de unidad exterior." },
  { id: "SCH-1018", clientName: "Daniel Paz", service: "Reparación Eléctrica", requestedDate: "01/07/2026", scheduledTime: "13:30", address: "Güemes 456", description: "Instalación de luminarias." },
  { id: "SCH-1019", clientName: "M. Pérez", service: "Reparación de Gas", requestedDate: "02/07/2026", scheduledTime: "09:00", address: "Saavedra 789", description: "Prueba de hermeticidad." },
  { id: "SCH-1020", clientName: "Javier P.", service: "Plomería General", requestedDate: "03/07/2026", scheduledTime: "15:00", address: "Gorriti 123", description: "Instalación de bomba presurizadora." },
  { id: "SCH-1021", clientName: "Valeria O.", service: "Revisión de Instalación", requestedDate: "04/07/2026", scheduledTime: "11:00", address: "Chiclana 654", description: "Inspección para habilitación." },
  { id: "SCH-1022", clientName: "Cristian F.", service: "Mantenimiento AC", requestedDate: "05/07/2026", scheduledTime: "14:00", address: "Undiano 987", description: "Cambio de plaqueta." },
  { id: "SCH-1023", clientName: "Silvia M.", service: "Reparación de Gas", requestedDate: "06/07/2026", scheduledTime: "10:30", address: "Villarino 321", description: "Cambio de regulador." },
  { id: "SCH-1024", clientName: "Esteban J.", service: "Destapaciones", requestedDate: "07/07/2026", scheduledTime: "16:30", address: "Darregueira 753", description: "Limpieza de cámara séptica." },
  { id: "SCH-1025", clientName: "Florencia G.", service: "Instalación Eléctrica", requestedDate: "08/07/2026", scheduledTime: "08:00", address: "Thompson 852", description: "Renovación de cableado." },
]

const ITEMS_PER_PAGE = 9

// -------------------- TODO --------------------
// Implementar la funcion de fetch al backend para recuperar los trabajos programados

export default function ScheduledJobsTab({ professionalServiceType }: { professionalServiceType: string }) {
  const [jobs, setJobs] = useState<any[]>(mockScheduledJobs)
  const [isLoading, setIsLoading] = useState(false) // Cambiado a false temporalmente
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  
  const [currentPage, setCurrentPage] = useState(1)

  const handleAcceptJob = async (jobId: string) => {
    setAcceptingId(jobId)
    try {
      // -------------------- TODO --------------------
      // Implementar la funcionalidad de aceptar el trabajo programado
      // const res = await fetch('/api/scheduled/...', { ... })
      
      // Simulación de tiempo de carga
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setJobs(prev => {
        const newJobs = prev.filter(job => job.id !== jobId)
        const newTotalPages = Math.ceil(newJobs.length / ITEMS_PER_PAGE)
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages)
        }
        return newJobs
      })
      
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