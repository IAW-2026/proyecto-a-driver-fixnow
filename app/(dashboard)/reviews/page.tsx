"use client"

import { useState } from "react"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"

// Lista ampliada de reseñas para visualizar la paginación
const mockReviews = [
  { id: 1, author: "Luis G.", date: "15/11/2023", comment: "Excelente atención y puntualidad. Resolvió el problema de gas en minutos.", rating: 5 },
  { id: 2, author: "María F.", date: "14/11/2023", comment: "Muy prolijo, dejó todo limpio después de cambiar los caños.", rating: 5 },
  { id: 3, author: "Carlos M.", date: "12/11/2023", comment: "Buen trabajo, aunque llegó un poco tarde.", rating: 4 },
  { id: 4, author: "Ana V.", date: "10/11/2023", comment: "Súper recomendable. Me explicó todo lo que estaba arreglando.", rating: 5 },
  { id: 5, author: "Roberto P.", date: "08/11/2023", comment: "Rápido y eficiente. El precio me pareció justo.", rating: 5 },
  { id: 6, author: "Lucía D.", date: "05/11/2023", comment: "Pudo arreglar el aire acondicionado el mismo día que lo llamé.", rating: 5 },
  { id: 7, author: "Jorge T.", date: "02/11/2023", comment: "Hizo el trabajo bien, pero faltó un poco de prolijidad al final.", rating: 3 },
  { id: 8, author: "Elena R.", date: "30/10/2023", comment: "Un genio, me salvó con una pérdida de agua un domingo a la noche.", rating: 5 },
  { id: 9, author: "Martín C.", date: "28/10/2023", comment: "Todo correcto, el termotanque quedó funcionando perfecto.", rating: 4 },
  { id: 10, author: "Sofía L.", date: "25/10/2023", comment: "Muy amable y respetuoso. Definitivamente lo volvería a llamar.", rating: 5 },
  { id: 11, author: "Diego A.", date: "22/10/2023", comment: "Resolvió el cortocircuito rapidísimo. 10 puntos.", rating: 5 },
  { id: 12, author: "Camila S.", date: "20/10/2023", comment: "Buen servicio, precio acorde al mercado.", rating: 4 },
  { id: 13, author: "Pablo N.", date: "18/10/2023", comment: "Llegó a horario y traía todas sus herramientas. Muy profesional.", rating: 5 },
  { id: 14, author: "Laura M.", date: "15/10/2023", comment: "Me solucionó un problema que otros dos plomeros no pudieron.", rating: 5 },
  { id: 15, author: "Andrés B.", date: "12/10/2023", comment: "El trabajo quedó bien, tardó un poco más de lo estimado.", rating: 4 },
  { id: 16, author: "Florencia G.", date: "10/10/2023", comment: "Impecable. Recomiendo mucho sus servicios.", rating: 5 },
  { id: 17, author: "Hugo V.", date: "08/10/2023", comment: "Conocimiento técnico excelente, me asesoró sobre qué repuesto comprar.", rating: 5 },
  { id: 18, author: "Marta E.", date: "05/10/2023", comment: "Buena atención. El arreglo de la estufa quedó de diez.", rating: 4 },
  { id: 19, author: "Gabriel C.", date: "02/10/2023", comment: "Súper honesto. Era una pavada y no me quiso cobrar de más.", rating: 5 },
  { id: 20, author: "Daniela R.", date: "28/09/2023", comment: "Rápido, limpio y educado. Nada de qué quejarme.", rating: 5 },
  { id: 21, author: "Javier P.", date: "25/09/2023", comment: "Cumplió con todo lo pactado por la app.", rating: 4 },
  { id: 22, author: "Valeria O.", date: "20/09/2023", comment: "Excelente, dejó funcionando el tablero eléctrico de toda la casa.", rating: 5 },
  { id: 23, author: "Cristian F.", date: "18/09/2023", comment: "Buen profesional. Se nota que sabe lo que hace.", rating: 4 },
  { id: 24, author: "Silvia M.", date: "15/09/2023", comment: "Me reparó una fuga de gas urgente. Eternamente agradecida.", rating: 5 },
  { id: 25, author: "Esteban J.", date: "10/09/2023", comment: "Trabajo correcto y rápido.", rating: 4 },
]

const ITEMS_PER_PAGE = 10

{/* -------------------- TODO -------------------- */}
{/* Agregar fetch al backend para obtener las reseñas reales del profesional */}

export default function ReviewsPage() {
  const [currentPage, setCurrentPage] = useState(1)

  // Cálculos de paginación
  const totalPages = Math.ceil(mockReviews.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentReviews = mockReviews.slice(startIndex, endIndex)

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reseñas de Clientes</h1>
        <p className="text-sm text-slate-400 mt-1">Calificaciones obtenidas por tus asistencias técnicas en FixNow.</p>
      </div>

      <div className="grid gap-4 max-w-3xl">
        {currentReviews.map((review) => (
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

      {/* Pagination Controls */}
      <div className="flex items-center justify-between border-t border-white/5 pt-6 mt-6 max-w-3xl">
        <span className="text-sm text-slate-400">
          Mostrando <span className="font-medium text-white">{startIndex + 1}</span> a{" "}
          <span className="font-medium text-white">
            {Math.min(endIndex, mockReviews.length)}
          </span>{" "}
          de <span className="font-medium text-white">{mockReviews.length}</span> reseñas
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