// app/api/jobs/stream/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MESSAGE_TYPES } from '@/lib/constants';

// Internal app endpoint for SSE stream to professionals about job updates

export const dynamic = 'force-dynamic';

// In-memory active connections: professionalId → controller
const activeConnections = new Map<string, ReadableStreamDefaultController>();

export async function GET(req: NextRequest) {
  const professionalId = req.nextUrl.searchParams.get('professionalId');

  if (!professionalId) {
    return new Response('professionalId is required', { status: 400 });
  }

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
          
              // -------------------- TODO --------------------
              // Filter by distance

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