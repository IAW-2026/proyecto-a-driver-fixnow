import Sidebar from "../components/Sidebar"

const handleAcceptScheduledJob = async (jobId: string) => {
  try {
    const res = await fetch("/api/jobs/acceptation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, professionalId }),
    })
    
    if (!res.ok) throw new Error("Error al aceptar")

    // 🔥 LA CLAVE: Aquí NO cambias el estado a BUSY.
    // El profesional sigue ONLINE en el Home para recibir trabajos de hoy.
    
    // Lo que haces es actualizar tu estado local de la lista de programados:
    setScheduledJobs(prev => 
      prev.map(job => job.jobId === jobId ? { ...job, isAccepted: true } : job)
    )

  } catch (err) {
    alert("No se pudo agendar el trabajo")
  }
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // min-h-screen creates the base viewport height limit
    // h-screen md:overflow-hidden keeps the sidebar crisp and prevents double-scrollbars
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#030712] text-white overflow-hidden">
      
      {/* Persistent Responsive Sidebar Panel */}
      <Sidebar />

      {/* Main Dynamically Swapped Content Target Area */}
      <main className="flex-1 w-full px-4 py-6 sm:px-8 lg:px-12 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  )
}