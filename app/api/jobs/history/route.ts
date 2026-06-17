import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// Internal app endpoint for fetching job history

export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const externalUrl = new URL(`${process.env.NEXT_PUBLIC_EXTERNAL_API_CLIENT}/jobs/history`);
    externalUrl.searchParams.append("professional_id", userId);

    const response = await fetch(externalUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.INTERNAL_API_SECRET_KEY}`
      }
    });

    if (!response.ok) {
      console.error("Failed to fetch job history from external API:", await response.text());
      return NextResponse.json({ error: "Failed to fetch job history" }, { status: 502 });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching job history:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}