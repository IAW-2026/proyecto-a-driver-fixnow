"use client"

import { Star } from "lucide-react"

const mockReviews = [
  { id: 1, author: "Luis G.", date: "12/10/2023", comment: "Juan fue muy rápido y profesional.", rating: 5 },
  { id: 2, author: "Luis G.", date: "12/10/2023", comment: "Excelente atención y puntualidad. Resolvió el problema de gas en minutos.", rating: 5 },
  { id: 3, author: "Carlos M.", date: "10/10/2023", comment: "Buen trabajo, muy limpio al trabajar.", rating: 4 },
]

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reseñas de Clientes</h1>
        <p className="text-sm text-slate-400 mt-1">Calificaciones obtenidas por tus asistencias técnicas en FixNow.</p>
      </div>

      <div className="grid gap-4 max-w-3xl">
        {mockReviews.map((review) => (
          <div key={review.id} className="rounded-2xl border border-white/5 bg-[#0B0F19] p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {/* Fake User Avatar placeholder */}
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-slate-300">
                  {review.author[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white">{review.author}</h3>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 uppercase">Verificada</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{review.date}</p>
                </div>
              </div>

              {/* Star Array */}
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    className={`h-4 w-4 ${index < review.rating ? "fill-[#FFB800] text-[#FFB800]" : "text-white/10"}`}
                  />
                ))}
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed pl-13">
              "{review.comment}"
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}