import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { validateInternalToken } from "@/lib/auth-api";

// Endpoint for sharing a professional's information

export async function GET( 
    request: NextRequest,
    { params }: { params: Promise<{ professional_id: string }> } 
){
    try {
        const { isValid, errorResponse } = validateInternalToken(request);
        if(!isValid) return errorResponse;

        const professionalId = (await params).professional_id;

        if (!professionalId){
            return NextResponse.json({error: "Missing professional ID"}, {status: 400})
        }

        const professional = await prisma.professional.findUnique({
            where: {id: professionalId},
            select: {
                firstName: true,
                lastName: true,
                phoneNumber: true,
                rating: true,
                serviceType: true
            }
        })

        if(!professional){
            return NextResponse.json({error: "No professional with that ID"}, {status: 404})
        }

        return NextResponse.json({
            success: true,
            professional,
        }, {status: 200})
    } catch(error) {
        console.error("Error fetching professional information:", error)
        return NextResponse.json({ error: "Internal Server Error"}, {status: 502})
    }
}