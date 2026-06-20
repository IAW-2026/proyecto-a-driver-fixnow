import Sidebar from "../components/Sidebar"
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from "@/lib/prisma"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const {userId} = await auth();

  if(!userId){
    redirect("/")
  }

  const professional = await prisma.professional.findUnique({
    where: {id: userId},
    select: {id: true}
  })

  if(!professional){
    redirect("/onboarding")
  }

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