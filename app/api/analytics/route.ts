import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const secretKey = process.env.ANALYTICS_SECRET_KEY;

    if (!secretKey) {
      console.error('Analytics auth secret is not configured.');
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (token !== secretKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [totalUsuarios, professionals] = await Promise.all([
      prisma.professional.count(),
      prisma.professional.findMany({
        select: {
          firstName: true,
          lastName: true,
          id: true,
          rating: true,
        },
      }),
    ]);

    const professionalsWithRatingPromedio = professionals.map((professional) => ({
      fullName: professional.firstName + " " + professional.lastName,
      id: professional.id,
      ratingPromedio: professional.rating,
    }));

    return NextResponse.json({
      totalUsuarios,
      professionals: professionalsWithRatingPromedio,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
