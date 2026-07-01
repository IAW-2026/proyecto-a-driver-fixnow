import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server"

// Internal endpoint for the professional to cancel a job request

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

        const { jobId, cancellationReason } = await request.json();
        if (!jobId || !cancellationReason || !professionalId) {
            console.error
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
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

        // Notify the client app the job was cancelled
        const apiURL = process.env.NEXT_PUBLIC_EXTERNAL_API_CLIENT;
        const response = await fetch(`${apiURL}/jobs/${jobId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.INTERNAL_API_SECRET_KEY}`
            },
            body: JSON.stringify({
                status: "cancelled",
                cancellation_reason: cancellationReason
            })
        });

        if(!response.ok){
            console.error("Failed to notify the client app", await response.text())
            return NextResponse.json({error: "Failed to notify the client app"}, {status: 502})
        }

        // Delete the job from the database
        await prisma.jobRequest.delete({
            where: { jobId: jobId }
        });

        return NextResponse.json({
            success: true,
            message: "Job cancelled successfully",
        }); 
    } catch (error) {
        console.error("Error cancelling job:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}