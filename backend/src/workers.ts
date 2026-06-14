import { prisma } from './lib/prisma';

// Worker config
const OUTBOX_POLL_INTERVAL = 2000; // Poll every 2 seconds
const INBOX_POLL_INTERVAL = 1000;  // Poll every 1 second
const BATCH_SIZE = 50;
const MAX_RETRIES = 5;
const CHANNEL_SERVICE_URL = process.env.CHANNEL_SERVICE_URL || 'http://localhost:5001/api/channel-stub/send';

// Helper to calculate exponential backoff (in milliseconds)
function getBackoffMs(attempts: number): number {
  return Math.min(Math.pow(2, attempts) * 1000, 60000); // Max 60 seconds
}

// -----------------------------------------------------------------------------
// OUTBOX WORKER: Sends payloads to the Channel Service
// -----------------------------------------------------------------------------
export async function startOutboxWorker() {
  console.log('[WORKER] Outbox worker started');
  
  setInterval(async () => {
    try {
      // Find pending jobs that are ready to be processed
      const jobs = await prisma.outboxJob.findMany({
        where: {
          status: 'pending',
          nextAttemptAt: { lte: new Date() }
        },
        take: BATCH_SIZE,
        orderBy: { createdAt: 'asc' }
      });

      if (jobs.length === 0) return;

      // Mark jobs as processing to avoid concurrent worker conflicts
      const jobIds = jobs.map(j => j.id);
      await prisma.outboxJob.updateMany({
        where: { id: { in: jobIds } },
        data: { status: 'processing' }
      });

      // Process in parallel
      await Promise.allSettled(jobs.map(async (job) => {
        try {
          const payload = JSON.parse(job.payload);
          
          const res = await fetch(CHANNEL_SERVICE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (res.ok) {
            // Success -> Mark completed
            await prisma.outboxJob.update({
              where: { id: job.id },
              data: { status: 'completed' }
            });
          } else {
            throw new Error(`Channel service returned ${res.status}`);
          }
        } catch (err: any) {
          // Failure -> Retry logic
          const newAttempts = job.attempts + 1;
          if (newAttempts >= MAX_RETRIES) {
            console.error(`[WORKER] OutboxJob ${job.id} failed permanently:`, err.message);
            await prisma.outboxJob.update({
              where: { id: job.id },
              data: { status: 'failed', attempts: newAttempts }
            });
          } else {
            const backoff = getBackoffMs(newAttempts);
            console.warn(`[WORKER] OutboxJob ${job.id} failed, retrying in ${backoff}ms...`);
            await prisma.outboxJob.update({
              where: { id: job.id },
              data: { 
                status: 'pending', 
                attempts: newAttempts,
                nextAttemptAt: new Date(Date.now() + backoff)
              }
            });
          }
        }
      }));

    } catch (err) {
      console.error('[WORKER] Outbox worker error:', err);
    }
  }, OUTBOX_POLL_INTERVAL);
}


// -----------------------------------------------------------------------------
// INBOX WORKER: Processes Webhooks from Channel Service securely
// -----------------------------------------------------------------------------
export async function startInboxWorker() {
  console.log('[WORKER] Inbox worker started');

  // Define funnel hierarchy (larger index = further along funnel)
  const STATUS_RANK: Record<string, number> = {
    queued: 0,
    sent: 1,
    delivered: 2,
    opened: 3,
    clicked: 4,
    failed: 5 // Terminal state
  };

  const dateFields: Record<string, object> = {
    sent:      { sentAt: new Date() },
    delivered: { deliveredAt: new Date() },
    opened:    { openedAt: new Date() },
    clicked:   { clickedAt: new Date() },
  };

  setInterval(async () => {
    try {
      const jobs = await prisma.inboxJob.findMany({
        where: { status: 'pending' },
        take: BATCH_SIZE,
        orderBy: { createdAt: 'asc' }
      });

      if (jobs.length === 0) return;

      const jobIds = jobs.map(j => j.id);
      await prisma.inboxJob.updateMany({
        where: { id: { in: jobIds } },
        data: { status: 'processing' }
      });

      for (const job of jobs) {
        try {
          const { logId, campaignId, outcome } = JSON.parse(job.payload);
          
          if (!STATUS_RANK[outcome]) {
            throw new Error(`Unknown outcome: ${outcome}`);
          }

          // Fetch current log state
          const currentLog = await prisma.communicationLog.findUnique({
            where: { id: logId }
          });

          if (!currentLog) {
            throw new Error(`Log ${logId} not found`);
          }

          const currentRank = STATUS_RANK[currentLog.status] || 0;
          const incomingRank = STATUS_RANK[outcome];

          // State Machine: Only process if the incoming event is "further" in the funnel
          // E.g., if we already got "opened", we ignore a late "delivered"
          if (incomingRank > currentRank) {
            await prisma.$transaction(async (tx) => {
              await tx.communicationLog.update({
                where: { id: logId },
                data: { status: outcome, ...dateFields[outcome] },
              });
        
              await tx.campaign.update({
                where: { id: campaignId },
                data: { [outcome]: { increment: 1 } },
              });
            });
          } else {
            console.log(`[WORKER] Inbox ignored out-of-order event for ${logId}: ${outcome} arrived but current state is ${currentLog.status}`);
          }

          // Mark job as completed
          await prisma.inboxJob.update({
            where: { id: job.id },
            data: { status: 'completed' }
          });

        } catch (err: any) {
          console.error(`[WORKER] InboxJob ${job.id} failed:`, err.message);
          await prisma.inboxJob.update({
            where: { id: job.id },
            data: { status: 'failed' }
          });
        }
      }

    } catch (err) {
      console.error('[WORKER] Inbox worker error:', err);
    }
  }, INBOX_POLL_INTERVAL);
}
