// app/api/jobs/complete/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcastToProfessionals } from "../stream/route";
import { MESSAGE_TYPES } from "@/lib/constants";
import { auth } from "@clerk/nextjs/server"

// Internal app endpoint for marking a job as completed by a professional

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
    

    const { jobId, price, description } = await request.json();

    if (!jobId || price === undefined || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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

    const apiURL = process.env.NEXT_PUBLIC_EXTERNAL_API_CLIENT;

    const response = await fetch(`${apiURL}/jobs/${jobId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.INTERNAL_API_SECRET_KEY}`
      },
      body: JSON.stringify({
        status: "completed",
        price,
        description
      })
    });
    
    if (!response.ok) {
      console.error("Failed to send payout notification:", await response.text());
      return NextResponse.json({error: "Failed to notify the client app"}, {status: 502})
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