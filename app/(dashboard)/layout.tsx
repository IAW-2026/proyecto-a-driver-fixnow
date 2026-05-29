import Sidebar from "../components/Sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // min-h-screen creates the base viewport height limit
    // h-screen md:overflow-hidden keeps the sidebar crisp and prevents double-scrollbars
    <div className="flex flex-col md:flex-row md:min-h-screen w-full bg-[#030712] text-white overflow-x-hidden">
      
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