// app/api/jobs/accept/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { broadcastToProfessionals } from "../stream/route";
import { MESSAGE_TYPES } from "@/lib/constants";

// Internal app endpoint for accepting a job request by a professional 

export async function POST(request: Request) {

  try {
    const { userId } = await auth();
    if( !userId ){
      return NextResponse.json({ error: "Unauthorized"}, { status: 401 })
    }

    const professionalId = userId

    const isProfessional = await prisma.professional.findUnique({
      where: { id: professionalId },
      select: { id: true }
    });

    if(!isProfessional){
      return NextResponse.json({error: "Forbidden: No eres un profesional registrado"}, { status: 403 })
    }

    const { jobId } = await request.json();

    if (!jobId) {
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

    const apiURL = process.env.NEXT_PUBLIC_EXTERNAL_API_CLIENT;

    const response = await fetch(`${apiURL}/jobs/${jobId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.INTERNAL_API_SECRET_KEY}`
      },
      body: JSON.stringify({
        status: "accepted",
        professional_id: professionalId
      })
    });

    if (!response.ok) {
      console.error("Failed to update job status in external API:", await response.text());
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
      type: MESSAGE_TYPES.JOB_CANCELLED,
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