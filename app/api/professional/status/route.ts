import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Internal app endpoint for updating professional status (e.g. ONLINE, OFFLINE, BUSY)

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { professionalId, status, latitude, longitude } = body

    if (!professionalId || !status) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    // Safety validation block: Ensure we don't bypass a database busy lockout via dev tools
    const currentProfile = await prisma.professional.findUnique({
      where: { id: professionalId },
      select: { status: true },
    })

    if (currentProfile?.status === "BUSY" && status !== "OFFLINE") {
      return NextResponse.json({ error: "Profile is locked in an active job" }, { status: 403 })
    }

    const updateData: any = { status }

    if (latitude !== undefined && longitude !== undefined) {
      updateData.latitude = latitude
      updateData.longitude = longitude
    }

    // Process table record save updates
    const updated = await prisma.professional.update({
      where: { id: professionalId },
      data: updateData,
    })

    return NextResponse.json({ success: true, status: updated.status })
  } catch (error) {
    console.error("PATCH status error:", error)
    return NextResponse.json({ error: "Internal Database Error" }, { status: 500 })
  }
}