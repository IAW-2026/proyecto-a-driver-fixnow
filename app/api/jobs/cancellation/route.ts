import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Endpoint for the professional to cancel a job request

export async function POST(request: Request) {
    try {
        const { jobId, professionalId, cancellationReason } = await request.json();
        if (!jobId || !cancellationReason || !professionalId) {
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
        // Delete the job from the database
        await prisma.jobRequest.delete({
            where: { jobId: jobId }
        });

        // Notify the client app the job was cancelled
        const apiURL = process.env.NEXT_PUBLIC_EXTERNAL_API_CLIENT;
        await fetch(`${apiURL}/jobs/${jobId}/cancellation`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.INTERNAL_API_SECRET_KEY}`
            },
            body: JSON.stringify({
                cancellation_reason: cancellationReason
            })
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