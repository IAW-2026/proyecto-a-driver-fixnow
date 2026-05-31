// app/api/jobs/accept/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcastToProfessionals } from "../stream/route";
import { MESSAGE_TYPES } from "@/lib/constants";

// Internal app endpoint for accepting a job request by a professional 

export async function POST(request: Request) {
  try {
    const { jobId, professionalId } = await request.json();

    if (!jobId || !professionalId) {
      return NextResponse.json({ error: "Missing jobId or professionalId" }, { status: 400 });
    }

    // Get the job
    const job = await prisma.jobRequest.findUnique({
      where: { jobId: jobId }
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.status !== 'PENDING') {
      return NextResponse.json({ error: "Job is no longer available" }, { status: 410 });
    }

    // Update job status and assign professional
    const updatedJob = await prisma.jobRequest.update({
      where: { jobId: jobId },
      data: {
        status: 'ACCEPTED',
        assignedTo: professionalId,
      }
    });

    // Update professional's active job
    await prisma.professional.update({
      where: { id: professionalId },
      data: {
        activeJobID: jobId,
        status: 'BUSY'
      }
    });

    // Get all professionals who were notified (for removal)
    const notifiedProfessionals = await prisma.professional.findMany({
      where: {
        serviceType: job.serviceType,
        status: 'ONLINE'
      },
      select: { id: true }
    });

    const allCandidateIds = notifiedProfessionals.map(p => p.id);

    // Notify the winner
    broadcastToProfessionals([professionalId], {
      type: MESSAGE_TYPES.JOB_ACCEPTED,
      jobId,
      message: 'You have successfully accepted the job!'
    });

    // Notify others to remove the job
    const otherProfessionals = allCandidateIds.filter(id => id !== professionalId);
    broadcastToProfessionals(otherProfessionals, {
      type: MESSAGE_TYPES.JOB_REMOVED,
      jobId,
      reason: 'Another professional accepted this job'
    });

    console.log(`Job ${jobId} accepted by professional ${professionalId}`);

    // -------------------- TODO --------------------
    // Notify the client's app about the acceptance

    return NextResponse.json({ 
      success: true,
      job: updatedJob 
    });

  } catch (error) {
    console.error("Error accepting job:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}