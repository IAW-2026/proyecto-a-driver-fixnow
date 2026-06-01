"use server"

import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { ServiceType } from "@/lib/constants"

export interface OnboardingData {
    firstName: string
    lastName: string
    phoneNumber: string
    serviceType: ServiceType
}

export async function completeOnboarding(data: OnboardingData) {
    const { userId } = await auth()
    const user = await currentUser()

    if (!userId || !user) throw new Error("Sesión de Clerk invalida")
        
    const email = user.emailAddresses?.[0]?.emailAddress

    try{
        await prisma.professional.create({
        data: {
            id: userId,
            email: email || "",
            firstName: data.firstName,
            lastName: data.lastName,
            phoneNumber: data.phoneNumber,
            serviceType: data.serviceType,
            rating: -1.0,
            latitude: 0,
            longitude: 0,
            radiusKm: 10,
            isVerified: false,
        }
    })
    }catch (error) {
        console.error("Error creating professional profile:", error)
        throw new Error("Error al crear el perfil profesional")
    }
}