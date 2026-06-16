// app/api/jobs/scheduled/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// Internal app endpoint for fetching scheduled jobs

export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the professional's local database profile to get their profession
    const professional = await prisma.professional.findUnique({
      where: { id: userId },
      select: { id: true, serviceType: true },
    });

    if (!professional || !professional.serviceType) {
      return NextResponse.json({ error: "Professional profile or service type not found" }, { status: 404 });
    }

    const serviceType = professional.serviceType;
    const professionalId = professional.id;
    const apiURL = process.env.NEXT_PUBLIC_EXTERNAL_API_CLIENT;
    const externalUrl = new URL(`${apiURL}/jobs/scheduled`);

    externalUrl.searchParams.append("serviceType", serviceType);
    if(professionalId) {
        externalUrl.searchParams.append("professionalId", professionalId);
    }

    const response = await fetch(externalUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.INTERNAL_API_SECRET_KEY}`
      }
    });

    if (!response.ok) {
      console.error("Failed to fetch scheduled jobs from external API:", await response.text());
      return NextResponse.json({ error: "Failed to fetch scheduled jobs" }, { status: 502 });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
} catch (error) {
    console.error("Error fetching scheduled jobs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}