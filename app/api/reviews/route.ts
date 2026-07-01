import { auth } from "@clerk/nextjs/server"
import { NextResponse } from 'next/server'
import { prisma } from "@/lib/prisma"

// Endpoint interno para que los profesionales soliciten las reseñas

export async function GET(request: Request){
    try {
        const { userId } = await auth();
    
        if (!userId) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const professional = await prisma.professional.findUnique({
            where: {id: userId},
            select: {rating:true}
        })

        if( !professional ){
            return NextResponse.json({error: "Forbidden: no eres un profesional registrado"}, {status: 403})
        }
    
        const externalUrl = new URL(`${process.env.NEXT_PUBLIC_EXTERNAL_API_FEEDBACK}/reviews/professionals/${userId}`);

        const response = await fetch(externalUrl.toString(), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.INTERNAL_API_SECRET_KEY}`
            }
        });
        
        if(!response.ok){
            console.error("Failed to fetch reviews from feedback app:", await response.text());
            return NextResponse.json({error: "Failed to fetch reviews"}, {status: 502})
        }

        const externalData = await response.json();
        const reviewsArray = Array.isArray(externalData) ? externalData : (externalData.reviews || []);

        return NextResponse.json({
            reviews: reviewsArray,
            averageRating: professional?.rating || 0
        }, { status: 200 });
    } catch (error) {
        console.error("Error fetching reviews: ", error);
        return NextResponse.json({error: "Internal Server Error"}, {status: 500})
    }
}