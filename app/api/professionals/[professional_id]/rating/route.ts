import { NextRequest, NextResponse } from "next/server";
import { broadcastToProfessionals } from "@/app/api/jobs/stream/route";
import { MESSAGE_TYPES } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { validateInternalToken } from "@/lib/auth-api";

// Endpoint for updating a professional's rating after a job is completed

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ professional_id: string }> }
) {
  try {
    const { isValid, errorResponse } = validateInternalToken(request);
    if(!isValid) return errorResponse;

    const professionalId = (await params).professional_id;
    const { new_average_rating, rating } = await request.json();

      if (!new_average_rating){
      return NextResponse.json({ 
        error: "Rating (average) is required" 
      }, { status: 400 });
    }

    const avgRating = new_average_rating;

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