import { useState } from "react"
import { ShieldAlert, CheckCircle, DollarSign, FileText, Loader2, XCircle } from "lucide-react"

interface ActiveJobProps {
  job: {
    jobId: string
    description: string
    estimatedPrice?: number | null
  }
  professionalId: string
  onComplete: () => void
}

export default function ActiveJobCard({ job, professionalId, onComplete }: ActiveJobProps) {
  const [view, setView] = useState<"info" | "completing" | "cancelling">("info")
  const [price, setPrice] = useState(job.estimatedPrice ? job.estimatedPrice.toString() : "")
  const [description, setDescription] = useState(job.description ? job.description : "")
  const [cancelReason, setCancelReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFinishJob = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    try {
      const res = await fetch("/api/jobs/completion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.jobId, professionalId, price, description }),
      })
      if (!res.ok) throw new Error("Failed to complete job")
      onComplete()
    } catch (err) {
      console.error(err)
      alert("Error al finalizar el trabajo.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancelJob = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    try {
      const res = await fetch(`/api/jobs/cancellation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            jobId: job.jobId,
            cancellation_reason: cancelReason }),
      })
      if (!res.ok) throw new Error("Failed to cancel job")
      onComplete() // Llama a onComplete para limpiar el estado y volver a ONLINE
    } catch (err) {
      console.error(err)
      alert("Error al cancelar el trabajo.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (view === "completing") {
    return (
      <form onSubmit={handleFinishJob} className="w-full max-w-md mx-auto space-y-5 text-left bg-[#0A0F1C] p-6 rounded-2xl border border-white/5 animate-in fade-in duration-300">
        <h3 className="font-bold text-lg text-white mb-4 border-b border-white/5 pb-2">Finalizar y Cobrar</h3>
        
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 flex items-center gap-2 uppercase tracking-wider">
            <DollarSign className="h-3.5 w-3.5" /> Monto Final
          </label>
          <input 
            type="number" value={price} onChange={(e) => setPrice(e.target.value)}
            disabled={isProcessing} required
            className="w-full bg-[#030712] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none transition font-mono text-lg disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 flex items-center gap-2 uppercase tracking-wider">
            <FileText className="h-3.5 w-3.5" /> Detalle del Trabajo
          </label>
          <textarea 
            value={description} onChange={(e) => setDescription(e.target.value)}
            disabled={isProcessing} rows={3} required
            className="w-full bg-[#030712] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-emerald-500 outline-none transition text-sm resize-none disabled:opacity-50"
          />
        </div>

        <div className="flex gap-3 mt-6">
          <button type="button" onClick={() => setView("info")} disabled={isProcessing} className="flex-1 rounded-xl bg-white/5 px-4 py-3.5 text-sm font-bold text-slate-300 hover:bg-white/10 transition">
            Volver
          </button>
          <button type="submit" disabled={isProcessing} className="flex-[2] rounded-xl bg-emerald-500 px-4 py-3.5 text-sm font-bold text-black hover:bg-emerald-400 transition flex justify-center items-center gap-2">
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar"}
          </button>
        </div>
      </form>
    )
  }

  if (view === "cancelling") {
    return (
      <form onSubmit={handleCancelJob} className="w-full max-w-md mx-auto space-y-5 text-left bg-[#0A0F1C] p-6 rounded-2xl border border-red-500/20 animate-in fade-in duration-300">
        <h3 className="font-bold text-lg text-red-400 mb-4 border-b border-red-500/10 pb-2">Cancelar Servicio</h3>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 flex items-center gap-2 uppercase tracking-wider">
            Motivo de la cancelación
          </label>
          <textarea 
            value={cancelReason} onChange={(e) => setCancelReason(e.target.value)}
            disabled={isProcessing} rows={3} required placeholder="Explica brevemente por qué debes cancelar..."
            className="w-full bg-[#030712] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-red-500 outline-none transition text-sm resize-none disabled:opacity-50"
          />
        </div>
        <div className="flex gap-3 mt-6">
          <button type="button" onClick={() => setView("info")} disabled={isProcessing} className="flex-1 rounded-xl bg-white/5 px-4 py-3.5 text-sm font-bold text-slate-300 hover:bg-white/10 transition">
            Volver
          </button>
          <button type="submit" disabled={isProcessing} className="flex-[2] rounded-xl bg-red-500 px-4 py-3.5 text-sm font-bold text-white hover:bg-red-600 transition flex justify-center items-center gap-2">
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cancelar Trabajo"}
          </button>
        </div>
      </form>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 max-w-md mx-auto animate-in fade-in duration-300">
      <div className="rounded-full bg-amber-500/10 p-4 text-amber-400 ring-4 ring-amber-500/5">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <div className="space-y-1 text-center">
        <p className="text-amber-400 font-bold text-xl mb-1">Servicio en Curso</p>
        <p className="text-slate-300">{job.description}</p>
        {job.estimatedPrice && (
          <p className="text-emerald-400 font-semibold mt-2">
            Precio estimado: ${job.estimatedPrice.toLocaleString()}
          </p>
        )}
      </div>
      <div className="w-full flex flex-col gap-3 mt-2">
        <button onClick={() => setView("completing")} className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-4 text-sm font-bold text-black transition hover:bg-amber-400">
          <CheckCircle className="h-5 w-5" /> Finalizar y Cobrar
        </button>
        <button onClick={() => setView("cancelling")} className="w-full flex items-center justify-center gap-2 rounded-xl bg-transparent border border-white/10 px-6 py-3 text-sm font-bold text-slate-400 transition hover:bg-white/5 hover:text-white">
          <XCircle className="h-4 w-4" /> Cancelar Servicio
        </button>
      </div>
    </div>
  )
}