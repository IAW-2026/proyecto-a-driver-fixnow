// app/api/jobs/accept/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcastToProfessionals } from "../stream/route";

export async function POST(request: Request) {
  try {
    const { job_id, professional_id } = await request.json();

    if (!job_id || !professional_id) {
      return NextResponse.json({ error: "Missing job_id or professional_id" }, { status: 400 });
    }

    // Get the job
    const job = await prisma.jobRequest.findUnique({
      where: { jobId: job_id }
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.status !== 'PENDING') {
      return NextResponse.json({ error: "Job is no longer available" }, { status: 410 });
    }

    // Update job status and assign professional
    const updatedJob = await prisma.jobRequest.update({
      where: { jobId: job_id },
      data: {
        status: 'ACCEPTED',
        assignedTo: professional_id,
      }
    });

    // Update professional's active job
    await prisma.professional.update({
      where: { id: professional_id },
      data: {
        activeJobID: job_id,
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
    broadcastToProfessionals([professional_id], {
      type: 'job_accepted',
      job_id,
      message: 'You have successfully accepted the job!'
    });

    // Notify others to remove the job
    const otherProfessionals = allCandidateIds.filter(id => id !== professional_id);
    broadcastToProfessionals(otherProfessionals, {
      type: 'job_removed',
      job_id,
      reason: 'Another professional accepted this job'
    });

    console.log(`Job ${job_id} accepted by professional ${professional_id}`);

    // TODO: Later - Notify the client's app via webhook/API

    return NextResponse.json({ 
      success: true,
      job: updatedJob 
    });

  } catch (error) {
    console.error("Error accepting job:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}