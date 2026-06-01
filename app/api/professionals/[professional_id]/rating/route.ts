import { NextRequest, NextResponse } from "next/server";
import { broadcastToProfessionals } from "@/app/api/jobs/stream/route";
import { MESSAGE_TYPES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

// Endpoint for updating a professional's rating after a job is completed

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ professional_id: string }> }
) {
  try {
    const professionalId = (await params).professional_id;
    const { avgRating, rating } = await request.json();

    if (!avgRating){
      return NextResponse.json({ 
        error: "Rating (average) is required" 
      }, { status: 400 });
    }

    // Check if professional exists
    const professional = await prisma.professional.findUnique({
      where: { id: professionalId },
      select: { id: true }
    });

    if (!professional) {
      return NextResponse.json({ error: "Professional not found" }, { status: 404 });
    }

    // Update the rating
    await prisma.professional.update({
      where: { id: professionalId },
      data: {
        rating: Number(avgRating),
      }
    });

    await new Promise(resolve => setTimeout(resolve, 5000));

    // Broadcast the new rating to the professional
    broadcastToProfessionals([professionalId], {
      type: MESSAGE_TYPES.NEW_RATING,
      rating: avgRating,
      title: "Nuevo rating recibido",
      body: `El cliente te calificó con ${rating} estrellas.`,
    });

    return NextResponse.json({
      success: true,
      message: "Professional rating updated successfully",
    });

  } catch (error) {
    console.error("Error updating professional rating:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}