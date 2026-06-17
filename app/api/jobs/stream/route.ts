// app/api/jobs/stream/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MESSAGE_TYPES } from '@/lib/constants';
import { auth } from '@clerk/nextjs/server'

// Internal app endpoint for SSE stream to professionals about job updates

export const dynamic = 'force-dynamic';

// Auxiliary function for calculated distance between two lat/lng points (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// In-memory active connections: professionalId → controller
const activeConnections = new Map<string, ReadableStreamDefaultController>();

export async function GET(req: NextRequest) {

  const { userId } = await auth();

  if ( !userId ) return new Response('Unauthorized', {status: 401})

  const professionalId = userId;

  const stream = new ReadableStream({
    async start(controller) {
      activeConnections.set(professionalId, controller);
      console.log(`Professional ${professionalId} connected via SSE`);

      // Send connection confirmation
      controller.enqueue(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

      const professional = await prisma.professional.findUnique({
        where: { id: professionalId },
        select: { 
          serviceType: true,
          activeJobID: true,
          status: true,
          latitude: true,
          longitude: true,
          radiusKm: true
        }
      });

      if (!professional?.serviceType) {
        controller.enqueue(`data: ${JSON.stringify({
          type: 'error',
          message: 'Professional not found or no service type'
        })}\n\n`);
        return;
      }



      // === Initial Sync: Send all currently pending jobs for this professional ===
      try {

          if(professional.activeJobID && professional.status === "BUSY"){
            const activeJob = await prisma.jobRequest.findUnique({
              where: { jobId: professional.activeJobID }
            });

            if(activeJob && activeJob.status === "ACCEPTED"){
              controller.enqueue(`data: ${JSON.stringify({
                type: MESSAGE_TYPES.ACTIVE_JOB,
                job: activeJob
              })}\n\n`);
            }
          } else {

              const pendingJobs = await prisma.jobRequest.findMany({
                where: {
                  serviceType: professional.serviceType,
                  status: 'PENDING',
                },
              });

              // Filter jobs by distance to professional's location
              for (const job of pendingJobs) {
                const distance = calculateDistance(
                  job.latitude,
                  job.longitude,
                  professional.latitude,
                  professional.longitude
                );
                if (distance > professional.radiusKm) {
                  // Remove jobs that are outside the professional's radius
                  pendingJobs.splice(pendingJobs.indexOf(job), 1);
                }
              }

              if (pendingJobs.length > 0) {
                controller.enqueue(`data: ${JSON.stringify({
                  type: MESSAGE_TYPES.INITIAL_JOBS,
                  jobs: pendingJobs
                })}\n\n`);
              }
          }
      } catch (error) {
        console.error('Error sending initial jobs:', error);
      }
    },

    cancel() {
      activeConnections.delete(professionalId);
      console.log(`Professional ${professionalId} disconnected`);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// Helper to broadcast messages
export function broadcastToProfessionals(professionalIds: string[], data: any) {
  const message = `data: ${JSON.stringify(data)}\n\n`;

  professionalIds.forEach(id => {
    const controller = activeConnections.get(id);
    if (controller) {
      try {
        controller.enqueue(message);
      } catch {
        activeConnections.delete(id);
      }
    }
  });
}