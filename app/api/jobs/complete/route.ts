// app/api/jobs/complete/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcastToProfessionals } from "../stream/route";

export async function POST(request: Request) {
  try {
    const { job_id, professional_id } = await request.json();

    if (!job_id || !professional_id) {
      return NextResponse.json({ error: "Missing job_id or professional_id" }, { status: 400 });
    }

    // Get the job to verify it belongs to this professional
    const job = await prisma.jobRequest.findUnique({
      where: { jobId: job_id }
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.assignedTo !== professional_id) {
      return NextResponse.json({ error: "This job is not assigned to you" }, { status: 403 });
    }

    // Delete the JobRequest (as you requested)
    await prisma.jobRequest.delete({
      where: { jobId: job_id }
    });

    // Update Professional status back to available
    await prisma.professional.update({
      where: { id: professional_id },
      data: {
        activeJobID: null,
        status: 'ONLINE'
      }
    });

    // TODO: Notify the client app that the job was completed and update the price if needed
    // await notifyClientJobCompleted(job.clientId, job_id);

    // Notify the professional (success)
    broadcastToProfessionals([professional_id], {
      type: 'job_completed',
      job_id,
      message: 'Job marked as completed successfully'
    });

    console.log(`Job ${job_id} completed and deleted by professional ${professional_id}`);

    return NextResponse.json({ 
      success: true,
      message: "Job completed and removed"
    });

  } catch (error) {
    console.error("Error completing job:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}