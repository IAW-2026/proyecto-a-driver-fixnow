"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { SignOutButton } from "@clerk/nextjs"

const services = [
  { value: "PLOMERIA", label: "Plomería" },
  { value: "GAS", label: "Gas" },
  { value: "ELECTRICIDAD", label: "Electricista" },
]

export default function ProfileForm({
  clerkId,
  email,
}: {
  clerkId: string
  email: string
}) {
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [service, setService] = useState("")
  const [startTime, setStartTime] = useState("08:00")
  const [endTime, setEndTime] = useState("17:00")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isFormValid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    phoneNumber.trim().length === 7 &&
    service.length > 0 &&
    startTime.length > 0 &&
    endTime.length > 0 &&
    startTime < endTime

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try{
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clerkId,
          email,
          firstName,
          lastName,
          phoneNumber,
          service,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error || 
          `No se pudo completar el registro.
          Por favor, intente nuevamente.`)
        return
      }

    router.push("/home")
  } catch (err) {
    setError(
      `No se pudo completar el registro. 
      Por favor, intente nuevamente.`
    )
  } finally {
    setIsSubmitting(false)
  }
}

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-[2rem] border border-white/10 bg-[#0b0f19]/90 p-8 shadow-[0_0_60px_rgba(0,0,0,0.25)]"
    >
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-300">Nombre</label>
        <input
          required
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          placeholder="Juan"
          className="w-full rounded-2xl border border-white/10 bg-[#03101f] px-4 py-3 text-white outline-none transition focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-300">Apellido</label>
        <input
          required
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          placeholder="Pérez"
          className="w-full rounded-2xl border border-white/10 bg-[#03101f] px-4 py-3 text-white outline-none transition focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-300">Servicio Principal</label>
        <select
          required
          value={service}
          onChange={(event) => setService(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-[#03101f] px-4 py-3 text-white outline-none transition focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20"
        >
          <option value="">Selecciona tu profesión</option>
          {services.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-300">Número de teléfono sin código de area</label>
        <input
          required
          type="number"
          maxLength={7}
          pattern="[0-9]{7}"
          value={phoneNumber}
          onChange={(event) => setPhoneNumber(event.target.value)}
          placeholder="1234567"
          className="w-full rounded-2xl border border-white/10 bg-[#03101f] px-4 py-3 text-white outline-none transition focus:border-[#FFB800] focus:ring-2 focus:ring-[#FFB800]/20"
        />
      </div>

      <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/10">
        <SignOutButton>
          <button
            type="button"
            className="min-w-[120px] rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/10"
          >
            Cancelar
          </button>
        </SignOutButton>

        {error ? (
          <p className="text-sm text-rose-400 text-center whitespace-pre-line leading-relaxed">
            {error}
          </p>
        ) : null}

        <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="min-w-[120px] rounded-2xl bg-[#FFB800] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#e5a600] disabled:cursor-not-allowed disabled:bg-[#A58200] disabled:opacity-70"
            >
            {isSubmitting ? "Guardando..." : "Confirmar"}
        </button>
      </div>
    </form>
  )
}
