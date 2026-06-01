"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"

export interface ProfessionalProfileData {
  firstName: string
  lastName: string
  phone: string
  radiusKm: number
  email: string
}

/**
 * Recupera los datos del profesional autenticado desde la base de datos
 */
export async function getAccountProfile(): Promise<ProfessionalProfileData | null> {
  const { userId } = await auth()
  if (!userId) throw new Error("No autorizado")

  const professional = await prisma.professional.findUnique({
    where: { id: userId },
    select: {
      firstName: true,
      lastName: true,
      phoneNumber: true,
      radiusKm: true,
      email: true,
    }
  })

  return professional as ProfessionalProfileData | null
}

/**
 * Actualiza los datos del profesional en la base de datos
 */
export async function updateAccountProfile(data: ProfessionalProfileData) {
  const { userId } = await auth()
  if (!userId) throw new Error("No autorizado")

  const safeRadius = ((data.radiusKm < 1) || isNaN(data.radiusKm)) ? 10 : data.radiusKm;

  await prisma.professional.update({
    where: { id: userId },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phone,
      radiusKm: safeRadius,
      email: data.email,
    }
  })

  // Purga la caché de Next.js para esta ruta para mostrar los datos nuevos inmediatamente
  revalidatePath("/account")
}