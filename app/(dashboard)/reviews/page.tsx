"use client"

import { useEffect, useState } from "react"
import { Star, ChevronLeft, ChevronRight, Loader2, MessageSquareOff, AlertCircle } from "lucide-react"

const ITEMS_PER_PAGE = 10

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const res = await fetch(`/api/reviews`)

        if (!res.ok) throw new Error("Failed to fetch reviews")

        const data = await res.json()
        
        // Manejamos si la respuesta es un array directo o un objeto con propiedad reviews
        setReviews(Array.isArray(data) ? data : (data.reviews || []))
      } catch (err: any) {
        setError(err.message || "Failed to fetch reviews")
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [])

  // 1. Estado de Carga Coherente con las otras pantallas
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-[#FFB800] mb-4" />
        <p>Cargando reseñas de clientes...</p>
      </div>
    )
  }

  // 2. Control de Errores Anticipado (Captura fallas de API externas)
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border border-dashed border-red-500/20 rounded-2xl bg-[#0B0F19] text-center max-w-3xl">
        <div className="bg-red-500/10 p-4 rounded-full mb-4">
          <AlertCircle className="h-8 w-8 text-red-400 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-white">No se pudieron cargar las reseñas</h3>
        <p className="text-slate-400 mt-2 max-w-sm text-sm">
          Ocurrió un problema al comunicarse con el servicio de calificaciones (502 Bad Gateway).
        </p>
      </div>
    )
  }

  // 3. Estado Vacío Real: El profesional no posee feedbacks en su cuenta
  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-2xl bg-[#0A0F1C]/50 text-center max-w-3xl">
        <div className="bg-white/5 p-4 rounded-full mb-4">
          <MessageSquareOff className="h-8 w-8 text-slate-500" />
        </div>
        <h3 className="text-lg font-semibold text-white">Sin reseñas por el momento</h3>
        <p className="text-slate-400 mt-2 max-w-sm text-sm">
          Las opiniones y calificaciones de los clientes aparecerán en este lugar una vez que completes tus primeras asistencias.
        </p>
      </div>
    )
  }

  // 4. Lógica de Paginación Dinámica
  const totalPages = Math.ceil(reviews.length / ITEMS_PER_PAGE) || 1
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentReviews = reviews.slice(startIndex, endIndex)

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Reseñas de Clientes</h1>
        <p className="text-sm text-slate-400 mt-1">Calificaciones obtenidas por tus asistencias técnicas en FixNow.</p>
      </div>

      {/* Grid de Reseñas Reales */}
      <div className="grid gap-4 max-w-3xl">
        {currentReviews.map((review) => {
          // Normalización de propiedades en caso de variaciones en la nomenclatura de la API externa
          const authorName = review.author || review.clientName || "Usuario Anónimo"
          const reviewDate = review.date || review.createdAt || "S/D"
          const commentText = review.comment || review.text || "Sin comentarios de texto."
          const ratingValue = Number(review.rating || 5)

          return (
            <div key={review.id || review._id} className="rounded-2xl border border-white/5 bg-[#0B0F19] p-6 space-y-4 hover:border-white/10 transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-slate-300">
                    {authorName[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white">{authorName}</h3>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 uppercase">Verificada</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{reviewDate}</p>
                  </div>
                </div>

                {/* Sistema de Estrellas */}
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      className={`h-4 w-4 ${index < ratingValue ? "fill-[#FFB800] text-[#FFB800]" : "text-white/10"}`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed sm:pl-13">
                "{commentText}"
              </p>
            </div>
          )
        })}
      </div>

      {/* Controles de Paginación Dinámicos */}
      <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-6 max-w-3xl">
        <span className="text-sm text-slate-400">
          Mostrando <span className="font-medium text-white">{startIndex + 1}</span> a{" "}
          <span className="font-medium text-white">
            {Math.min(endIndex, reviews.length)}
          </span>{" "}
          de <span className="font-medium text-white">{reviews.length}</span> reseñas
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