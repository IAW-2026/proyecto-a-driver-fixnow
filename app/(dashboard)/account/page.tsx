"use client"

import { useEffect, useState } from "react"
import { User, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import { getAccountProfile, updateAccountProfile, ProfessionalProfileData } from "./actions"

export default function AccountPage() {
  const [profile, setProfile] = useState<ProfessionalProfileData | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    async function loadProfile() {
      try{
        const data = await getAccountProfile()
        if(data){
          setProfile(data)
        } else {
          setStatusMessage({ type: "error", text: "No se pudo cargar el perfil." })
        }
      } catch(error){
          console.error("Error al cargar el perfil:", error)
          setStatusMessage({ type: "error", text: "Error al conectar con el servidor." })
      } finally {
          setLoading(false)
      }
    }
    loadProfile()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!profile || saving) return

    setSaving(true)
    setStatusMessage(null)

    try {
      await updateAccountProfile(profile)
      setStatusMessage({ type: "success", text: "Perfil actualizado correctamente." })

      setTimeout(() => setStatusMessage(null), 4000)
    } catch (error) {
      console.error("Error al guardar el perfil:", error)
      setStatusMessage({ type: "error", text: "Hubo un problema al guardar los cambios." })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#FFB800]" />
        <p className="text-sm text-slate-400">Cargando tus datos de configuración...</p>
      </div>
    )
  }


  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración de Cuenta</h1>
        <p className="text-sm text-slate-400 mt-1">Administra tu información personal y preferencias de la aplicación.</p>
      </div>

      {/* --- BANNER DE ESTADO INLINE --- */}
      {statusMessage && (
        <div className={`flex items-center gap-3 rounded-xl border p-4 text-sm font-semibold transition-all animate-fade-in
          ${statusMessage.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
            : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }
        `}>
          {statusMessage.type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* --- FORMULARIO DE INFORMACIÓN PERSONAL --- */}
      <form onSubmit={handleSave} className="rounded-2xl border border-white/5 bg-[#0B0F19] p-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-white/5 pb-4">
          <User className="h-5 w-5 text-[#FFB800]" />
          <h2 className="text-lg font-bold">Información Personal</h2>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-1">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase">Nombre</label>
            <input 
              type="text" 
              value={profile?.firstName || ""} 
              onChange={(e) => setProfile(prev => prev ? { ...prev, firstName: e.target.value } : null)}
              required
              className="w-full rounded-xl border border-white/5 bg-[#030712] px-4 py-3 text-sm text-white outline-none focus:border-[#FFB800]/40 transition" 
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase">Apellido</label>
            <input 
              type="text" 
              value={profile?.lastName || ""} 
              onChange={(e) => setProfile(prev => prev ? { ...prev, lastName: e.target.value } : null)}
              required
              className="w-full rounded-xl border border-white/5 bg-[#030712] px-4 py-3 text-sm text-white outline-none focus:border-[#FFB800]/40 transition" 
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase">Teléfono</label>
            <input 
              type="number" 
              maxLength={7}
              pattern="[0-9]{7}"
              value={profile?.phoneNumber ?? ""} 
              onChange={(e) => setProfile(prev => prev ? { ...prev, phoneNumber: e.target.value } : null)}
              className="w-full rounded-xl border border-white/5 bg-[#030712] px-4 py-3 text-sm text-white outline-none focus:border-[#FFB800]/40 transition" 
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase">Radio de cobertura</label>
            <input 
              type="number" 
              min='1'
              value={profile?.radiusKm ?? ""} 
              onChange={(e) => {
                const parsedValue = parseFloat(e.target.value)
                setProfile(prev => prev ? { ...prev, radiusKm: isNaN(parsedValue) ? 0 : parsedValue } : null)
              }}
              onBlur={() => {
                setProfile(prev => {
                  if (!prev) return null;
                  const currentRadius = prev.radiusKm;

                  if (currentRadius <= 0 || isNaN(currentRadius)) {
                    return { ...prev, radiusKm: 10 };
                  }
                  return prev;
                });
              }}
              className="w-full rounded-xl border border-white/5 bg-[#030712] px-4 py-3 text-sm text-white outline-none focus:border-[#FFB800]/40 transition" 
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase">Correo Electrónico</label>
            <input 
              type="email" 
              value={profile?.email || ""} 
              onChange={(e) => setProfile(prev => prev ? { ...prev, email: e.target.value } : null)}
              required
              className="w-full rounded-xl border border-white/5 bg-[#030712] px-4 py-3 text-sm text-white outline-none focus:border-[#FFB800]/40 transition" 
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button 
            type="submit"
            disabled={saving || !profile}
            className="flex items-center gap-2 rounded-xl bg-[#FFB800] px-5 py-2.5 text-sm font-bold text-black hover:bg-[#e2a400] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </form>
    </div>
  )
}