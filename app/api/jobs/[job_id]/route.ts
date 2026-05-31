import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcastToProfessionals } from "../stream/route";
import { MESSAGE_TYPES } from "@/lib/constants";

// Endpoint for updating a job request

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ job_id: string }> }
) {
  const jobId = (await params).job_id;

  try {
    const body = await request.json();
    const { 
      description, 
      estimatedPrice, 
      latitude, 
      longitude 
    } = body;

    if (!description && estimatedPrice === undefined && latitude === undefined && longitude === undefined) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    // Find the existing job
    const existingJob = await prisma.jobRequest.findUnique({
      where: { jobId: jobId }
    });

    if (!existingJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (existingJob.status !== 'PENDING') {
      return NextResponse.json({ 
        error: "Only PENDING jobs can be updated" 
      }, { status: 409 });
    }

    // Update the job
    const updatedJob = await prisma.jobRequest.update({
      where: { jobId: jobId },
      data: {
        description: description !== undefined ? description : existingJob.description,
        estimatedPrice: estimatedPrice !== undefined ? estimatedPrice : existingJob.estimatedPrice,
        latitude: latitude !== undefined ? latitude : existingJob.latitude,
        longitude: longitude !== undefined ? longitude : existingJob.longitude,
      }
    });

    // Get currently online professionals for this service type
    const availableProfessionals = await prisma.professional.findMany({
      where: {
        serviceType: updatedJob.serviceType,
        status: "ONLINE",
      },
      select: { id: true }
    });

    const professionalIds = availableProfessionals.map(p => p.id);

    if (professionalIds.length > 0) {
      // Broadcast updated job to professionals
      broadcastToProfessionals(professionalIds, {
        type: MESSAGE_TYPES.JOB_UPDATED,
        jobId: updatedJob.jobId,
        description: updatedJob.description,
        estimatedPrice: updatedJob.estimatedPrice,
        latitude: updatedJob.latitude,
        longitude: updatedJob.longitude,
        timestamp: new Date().toISOString()
      });

      console.log(`Job ${jobId} updated and notified to ${professionalIds.length} professionals`);
    }

    return NextResponse.json({
      success: true,
      message: "Job updated successfully",
      job: updatedJob
    });

  } catch (error) {
    console.error("Error updating job:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}