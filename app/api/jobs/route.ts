// app/api/jobs/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcastToProfessionals } from './stream/route';
import { MESSAGE_TYPES } from "@/lib/constants";

// Endpoint for creating a new job request from the client app

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // -------------------- TODO --------------------
    // Verify fields
    const { 
      jobId, 
      clientId, 
      serviceType, 
      description, 
      latitude, 
      longitude, 
      estimatedPrice 
    } = body;

    // Validate required fields
    if (!jobId || !clientId || !serviceType || !description || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ 
        error: "Missing required fields", 
        received: Object.keys(body) 
      }, { status: 400 });
    }

    // Check if job already exists
    const existing = await prisma.jobRequest.findUnique({
      where: { jobId: jobId }
    });

    if (existing) {
      return NextResponse.json({ error: "Job already exists" }, { status: 409 });
    }

    // Create job
    const newJob = await prisma.jobRequest.create({
      data: {
        jobId: jobId,
        clientId: clientId,
        serviceType: serviceType as any,        // Cast if needed
        description,
        latitude,
        longitude,
        estimatedPrice: estimatedPrice || null,
        status: "PENDING",
      }
    });

    // Get professionals
    const availableProfessionals = await prisma.professional.findMany({
      where: {
        serviceType: serviceType as any,
        status: "ONLINE",
      },
      select: { id: true }
    });

    const professionalIds = availableProfessionals.map(p => p.id);

    // Broadcast
    if (professionalIds.length > 0) {
      broadcastToProfessionals(professionalIds, {
        type: MESSAGE_TYPES.NEW_JOB,
        jobId: newJob.jobId,
        clientId: newJob.clientId,
        serviceType: newJob.serviceType,
        description: newJob.description,
        latitude: newJob.latitude,
        longitude: newJob.longitude,
        estimatedPrice: newJob.estimatedPrice,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`Job created: ${jobId} | Notified: ${professionalIds.length}`);

    return NextResponse.json({
      success: true,
      notifiedCount: professionalIds.length,
      jobId: newJob.jobId
    });

  } catch (error: any) {
    console.error("Error in /api/jobs:", error);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: error.message 
    }, { status: 500 });
  }
}