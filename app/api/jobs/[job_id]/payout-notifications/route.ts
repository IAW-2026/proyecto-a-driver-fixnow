import { NextRequest, NextResponse } from "next/server";
import { broadcastToProfessionals } from "../../stream/route";
import { prisma } from "@/lib/prisma";
import { MESSAGE_TYPES } from "@/lib/constants";
import { validateInternalToken } from "@/lib/auth-api";

// Endpoint for sending payout notification to professional after the payment is completed

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ job_id: string }> }
) {

  try {
    const jobId = (await params).job_id;
    const { professional_id, amount } = await request.json();
    const professionalId = professional_id;

    const { isValid, errorResponse } = validateInternalToken(request);
    if(!isValid) return errorResponse;

    if (!professionalId || !amount) {
      return NextResponse.json({ 
        error: "professionalId and amount are required" 
      }, { status: 400 });
    }

    // Check if the professional is registered in the database
    const professional = await prisma.professional.findUnique({
      where: { id: professionalId },
    });

    if (!professional) {
      return NextResponse.json({ 
        error: "Professional not found" 
      }, { status: 404 });
    }

    // Notify the professional via SSE
    broadcastToProfessionals([professionalId], {
      type: MESSAGE_TYPES.PAYOUT_RECEIVED,
      jobId,
      amount,
      title: "¡Pago recibido!",
      desc: `Se han acreditado $${amount} en tu cuenta.`,
    });

    return NextResponse.json({
      success: true,
      message: "Payout notification sent successfully to professional",
    });

  } catch (error) {
    console.error("Error processing payout notification:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}