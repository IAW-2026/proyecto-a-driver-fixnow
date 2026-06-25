// app/api/jobs/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcastToProfessionals } from './stream/route';
import { MESSAGE_TYPES } from "@/lib/constants";
import { validateInternalToken } from "@/lib/auth-api";

// Endpoint for creating a new job request from the client app

export async function POST(request: Request) {
  try {

    const { isValid, errorResponse } = validateInternalToken(request);
    if(!isValid) return errorResponse;

    const body = await request.json();

    const { 
      job_id, 
      client_id,
      client_full_name, 
      service_type, 
      description, 
      location,
      estimated_price 
    } = body;

    // Validate required fields
    if (!job_id || !client_id || !service_type || !description || location?.lat === undefined || location?.lng === undefined) {
      return NextResponse.json({ 
        error: "Missing required fields", 
        received: Object.keys(body) 
      }, { status: 400 });
    }

    const jobId = job_id;
    const clientId = client_id;
    const clientName = client_full_name;
    const serviceType = service_type.toUpperCase();
    const estimatedPrice = estimated_price !== undefined ? Number(estimated_price) : null;

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
        serviceType: serviceType,        // Cast if needed
        description,
        latitude: location.lat,
        longitude: location.lng,
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