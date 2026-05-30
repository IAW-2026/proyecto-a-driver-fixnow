import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { broadcastToProfessionals } from './stream/route';

export async function POST(request: Request) {

    try{
        const body = await request.json()
        const {
            job_id, 
            client_id,
            service_type,
            description,
            latitude,
            longitude,
            estimated_price
        } = body;

        if(!job_id || !client_id || !service_type || latitude === undefined || longitude === undefined){
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const existingJob = await prisma.jobRequest.findUnique({
            where: { jobId: job_id }
        })

        if(existingJob){
            return NextResponse.json({ error: "Job already exists" }, { status: 409 })
        }

        const newJob = await prisma.jobRequest.create({
            data: {
                jobId: job_id,
                clientId: client_id,
                serviceType: service_type,
                description: description || "",
                latitude,
                longitude,
                estimatedPrice: estimated_price || null,
                status: "PENDING",
            }
        });

        const availableProfessionals = await prisma.professional.findMany({
            where: {
                serviceType: service_type,
                status: "ONLINE",
            },
                select: { id: true }
        });

        if(availableProfessionals.length === 0){
            return NextResponse.json({ 
                success: true,
                notifiedCount: 0,
                message: "No professionals currently available for this service type"
             }, {status: 200})
        }


        // Notify professionals via SSE stream
        broadcastToProfessionals(availableProfessionals.map(p => p.id), {
            type: "NEW_JOB_REQUEST",
            job_id: newJob.jobId,
            client_id: newJob.clientId,
            service_type: newJob.serviceType,
            description: newJob.description,
            latitude: newJob.latitude,
            longitude: newJob.longitude,
            estimated_price: newJob.estimatedPrice,
        });

        return NextResponse.json({
            success: true,
            notifiedCount: availableProfessionals.length,
        }, {status: 200})


    } catch (error) {
        console.error("Error processing job request:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}