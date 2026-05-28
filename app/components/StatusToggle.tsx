"use client"

import { useState } from "react"
import { Loader2, ShieldAlert, CheckCircle, MapPin } from "lucide-react"

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
  const [isLoading, setIsLoading] = useState(false)
  
  // Track specific steps for non-intrusive micro-copy feedback
  const [loadingStep, setLoadingStep] = useState<"gps" | "saving" | null>(null)

  const isBusy = status === "BUSY"
  const isOnline = status === "ONLINE"

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
    if (isLoading) return
    await updateProfessionalStatus("ONLINE", true)
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
            {isBusy
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

      {/* --- WORKSPACE VIEW OVERVIEW PANEL WITH NON-INTRUSIVE FEEDBACK --- */}
      <div className="rounded-xl border border-white/5 bg-[#030a14] p-8 text-center transition-all duration-300 relative overflow-hidden">
        
        {/* Subtle top progress bar indicator when loading */}
        {isLoading && (
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent w-1/2 animate-[shimmer_1.5s_infinite] transition-all" />
          </div>
        )}

        {isLoading ? (
          <div className="py-4 flex flex-col items-center justify-center gap-3 animate-fade-in">
            {loadingStep === "gps" ? (
              <>
                <MapPin className="h-5 w-5 text-emerald-400 animate-bounce" />
                <p className="text-sm font-medium text-emerald-400/90">Sincronizando coordenadas GPS actuales...</p>
              </>
            ) : (
              <>
                <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
                <p className="text-sm font-medium text-slate-400">Actualizando estado en el servidor de FixNow...</p>
              </>
            )}
            <p className="text-xs text-slate-600">Esto tomará solo un momento.</p>
          </div>
        ) : isBusy ? (
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-amber-500/10 p-4 text-amber-400 ring-4 ring-amber-500/5">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-amber-400 font-bold text-lg">Servicio en Curso</p>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                Estás asignado a una orden de asistencia técnica. Al finalizar el trabajo presiona el botón de abajo para reportar tu nueva ubicación geográfica.
              </p>
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
        ) : (
          <div className="py-4 space-y-2">
            <p className="text-slate-400 font-medium">Aquí recibirás notificaciones sobre nuevas solicitudes de servicio.</p>
            <p className="text-slate-600 text-xs">
              Última posición guardada: ({latitude}, {longitude}).
            </p>
          </div>
        )}
      </div>
    </div>
  )
}