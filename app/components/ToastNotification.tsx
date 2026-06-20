import { DollarSign, Star, X } from "lucide-react"

export interface ToastNotification {
  id: string
  title: string
  desc: string
  type: "payout" | "rating"
}

interface ToastProps {
  toasts: ToastNotification[]
  onDismiss: (id: string) => void
}

export default function ToastNotifications({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          className="pointer-events-auto relative bg-[#0A0F1C] border border-white/10 shadow-2xl rounded-2xl p-4 flex items-center gap-4 w-[320px] animate-in slide-in-from-right-8 fade-in duration-500"
        >
          <button 
            onClick={() => onDismiss(toast.id)}
            className="absolute top-2 right-2 text-slate-500 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className={`p-2 rounded-full ${toast.type === 'payout' ? 'bg-emerald-500/10' : 'bg-[#FFB800]/10'}`}>
            {toast.type === 'payout' 
              ? <DollarSign className="h-5 w-5 text-emerald-400" /> 
              : <Star className="h-5 w-5 text-[#FFB800] fill-[#FFB800]" />}
          </div>
          <div className="pr-4">
            <h4 className="text-sm font-bold text-white">{toast.title}</h4>
            <p className="text-xs text-slate-400">{toast.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}