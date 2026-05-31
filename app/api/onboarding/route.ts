import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

// Internal app endpoint for onboarding professionals (creating/updating their profile)

export async function POST(request: Request) {
  const user = await currentUser()
  if (!user) return NextResponse.json({error: "Unauthorized"}, { status: 401 })

  const body = await request.json()
  const { firstName, lastName, phoneNumber, service} = body

  if (!firstName || !lastName || !phoneNumber || !service) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const email = user.emailAddresses?.[0]?.emailAddress ?? ""

  const professional = await prisma.professional.upsert({
    where: { email: email },
    create: {
      id: user.id,
      email,
      firstName,
      lastName,
      phoneNumber,
      serviceType: service || null,
      rating: 5.0,
      latitude: 0,
      longitude: 0,
      radiusKm: 10,
      isVerified: false,
    },
    update: {
      id: user.id,
      firstName,
      lastName,
      phoneNumber,
      serviceType: service || undefined,
    },
  })

  return NextResponse.redirect(new URL("/home", request.url))
}