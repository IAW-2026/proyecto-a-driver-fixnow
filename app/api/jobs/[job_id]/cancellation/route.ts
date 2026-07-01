import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcastToProfessionals } from "@/app/api/jobs/stream/route";
import { MESSAGE_TYPES } from "@/lib/constants";
import { validateInternalToken } from "@/lib/auth-api";

// Endpoint for cancelling a job request by the client app.

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ job_id: string }> }
) {

  const { isValid, errorResponse } = validateInternalToken(request);
  if(!isValid) return errorResponse;

  const jobId = (await params).job_id;

  try {
    const body = await request.json();
    const { cancellation_reason } = body;

    if (!cancellation_reason) {
      return NextResponse.json({ error: "Cancellation reason is required" }, { status: 400 });
    }

    const cancellationReason = cancellation_reason;

    // Find the existing job
    const existingJob = await prisma.jobRequest.findUnique({
      where: { jobId: jobId }
    });

    if (!existingJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (existingJob.status === 'ACCEPTED') {
        // Notify the completeprofessional that the job was cancelled
        if (existingJob.assignedTo) {
            const professional = await prisma.professional.findUnique({
                where: { id: existingJob.assignedTo }
            });

            if (professional) {
                broadcastToProfessionals([professional.id], {
                    type: MESSAGE_TYPES.JOB_CANCELLED,
                    message: `El cliente canceló el trabajo ${existingJob.jobId}. Razón: ${cancellationReason}`,
                    jobId: existingJob.jobId
                });
            }
        }
    }

    // Delete the job from the database
    await prisma.jobRequest.delete({
      where: { jobId: jobId }
    });

    return NextResponse.json({
      success: true,
      message: "Job cancelled successfully",
    });

  } catch (error) {
    console.error("Error cancelling job:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}