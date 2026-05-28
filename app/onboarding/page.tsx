import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import ProfileForm from "../components/ProfileForm"
import { prisma } from "@/lib/prisma"

export default async function OnboardingPage() {
  const user = await currentUser()
  if (!user) redirect("/")

  const existing = await prisma.professional.findUnique({
    where: { id: user.id },
  })

  if (existing) {
    redirect("/home")
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8 rounded-[2rem] border border-white/10 bg-[#07101f]/90 p-8 shadow-[0_0_60px_rgba(0,0,0,0.25)]">
          <h1 className="mt-4 text-4xl font-black tracking-tight">
            Completa tu perfil
          </h1>
          <p className="mt-3 max-w-2xl text-slate-400">
            Déjanos saber tu nombre, número de teléfono y servicio principal para activar tu cuenta.
          </p>
        </div>

        <ProfileForm
          clerkId={user.id}
          email={user.emailAddresses?.[0]?.emailAddress ?? ""}
        />
      </div>
    </div>
  )
}