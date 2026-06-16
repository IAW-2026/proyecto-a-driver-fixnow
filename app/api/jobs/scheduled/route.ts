// app/api/jobs/scheduled/route.ts
import { NextResponse } from "next/server";

// Internal app endpoint for fetching scheduled jobs

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceType = searchParams.get("serviceType");
    const professionalId = searchParams.get("professionalId");
    
    if (!serviceType || !professionalId) {
      return NextResponse.json({ error: "Missing serviceType or professionalId" }, { status: 400 });
    }

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