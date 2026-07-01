"use server"

import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { ProfessionalStatus } from "@/lib/constants"

export async function updateProfessionalLocation(latitude: number, longitude: number) {
    const { userId } = await auth()

    if (!userId) {
        throw new Error("Unauthorized")
    }

    try {
        await prisma.professional.update({
            where: { id: userId },
            data: { latitude, longitude }
        })
    } catch (error) {
        console.error("Error updating location:", error)
        throw new Error("Failed to update location")
    }
}  

export async function updateProfessionalStatus(status: ProfessionalStatus) {
    const { userId } = await auth()

    if (!userId) {
        throw new Error("Unauthorized")
    }

    try {
        await prisma.professional.update({
            where: { id: userId },
            data: { status }
        })
    } catch (error) {
        console.error("Error updating status:", error)
        throw new Error("Failed to update status")
    }
}
