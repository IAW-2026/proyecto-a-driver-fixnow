import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const user = await currentUser()
  if (!user) return NextResponse.json({error: "Unauthorized"}, { status: 401 })

  const body = await request.json()
  const { name, service, startTime, endTime } = body

  if (!name || !service || !startTime || !endTime) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }
  if(startTime >= endTime) {
    return NextResponse.json({ error: "Invalid time range" }, { status: 400 })
  }

  const email = user.emailAddresses?.[0]?.emailAddress ?? ""

  const professional = await prisma.professional.upsert({
    where: { email: email },
    create: {
      id: user.id,
      email,
      fullName: name,
      serviceType: service || null,
      rating: 5.0,
      latitude: 0,
      longitude: 0,
      radiusKm: 10,
      isVerified: false,
      isAvailable: false,
    },
    update: {
      id: user.id,
      fullName: name,
      serviceType: service || undefined,
      availabilities: { 
        deleteMany: {},
        create: {
          date: new Date(),
          startTime: `${startTime}:00`,
          endTime: `${endTime}:00`,
        }
      }
    },
  })

  return NextResponse.redirect(new URL("/home", request.url))
}