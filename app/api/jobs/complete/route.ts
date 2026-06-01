// app/api/jobs/complete/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcastToProfessionals } from "../stream/route";
import { MESSAGE_TYPES } from "@/lib/constants";

// Internal app endpoint for marking a job as completed by a professional

export async function POST(request: Request) {
  try {
    const { jobId, professionalId } = await request.json();

    if (!jobId || !professionalId) {
      return NextResponse.json({ error: "Missing jobId or professionalId" }, { status: 400 });
    }

    // Get the job to verify it belongs to this professional
    const job = await prisma.jobRequest.findUnique({
      where: { jobId: jobId }
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.assignedTo !== professionalId) {
      return NextResponse.json({ error: "This job is not assigned to you" }, { status: 403 });
    }

    // Delete the JobRequest from the database
    await prisma.jobRequest.delete({
      where: { jobId: jobId }
    });

    // Update Professional status back to available
    await prisma.professional.update({
      where: { id: professionalId },
      data: {
        activeJobID: null,
        status: 'ONLINE'
      }
    });

    // -------------------- TODO --------------------
    // Notify the client app that the job was completed and update the price if needed

    // Notify the professional (success)
    broadcastToProfessionals([professionalId], {
      type: MESSAGE_TYPES.JOB_COMPLETED,
      jobId,
      message: 'Job completed successfully'
    });

    console.log(`Job ${jobId} completed and deleted by professional ${professionalId}`);

    return NextResponse.json({ 
      success: true,
      message: "Job completed and removed"
    });

  } catch (error) {
    console.error("Error completing job:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}