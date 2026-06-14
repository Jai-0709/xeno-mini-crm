import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5001;
const CRM_WEBHOOK_URL = process.env.CRM_WEBHOOK_URL || 'http://localhost:5000/api/webhooks/delivery';

// --- CHANNEL STUB ---
// This is a completely separate service that simulates delivering messages 
// to channels (like email/SMS) and fires async webhook callbacks to the CRM.

// In a real system, you might enqueue these internal tasks.
// For the stub, we just accept the request and fire the callback after a delay.
app.post('/api/channel-stub/send', async (req, res) => {
  const { logId, campaignId } = req.body;
  
  if (!logId || !campaignId) {
    return res.status(400).json({ error: 'logId and campaignId required' });
  }

  // Simulate a 5% random failure rate where the channel service itself fails to accept the request
  // This demonstrates the CRM's OutboxWorker retry capability!
  if (Math.random() < 0.05) {
    console.log(`[CHANNEL] Simulated network error rejecting logId ${logId}`);
    return res.status(503).json({ error: 'Service Unavailable (Simulated)' });
  }

  // Accept the request immediately
  res.status(202).json({ status: 'accepted', logId });

  // Process asynchronously
  simulateDelivery(logId, campaignId).catch(console.error);
});

async function simulateDelivery(logId: string, campaignId: string) {
  // Simulate network delay for delivery
  await new Promise(r => setTimeout(r, 500 + Math.random() * 2000));

  // Determine outcome
  // 90% sent -> 85% delivered -> 50% opened -> 20% clicked
  const r = Math.random();
  let outcome = 'failed';
  if (r > 0.1) outcome = 'sent';
  if (r > 0.15) outcome = 'delivered';
  if (r > 0.5) outcome = 'opened';
  if (r > 0.8) outcome = 'clicked';

  console.log(`[CHANNEL] Firing webhook for logId ${logId} -> ${outcome}`);

  // Send webhook back to CRM
  try {
    const response = await fetch(CRM_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logId, campaignId, outcome })
    });
    
    if (!response.ok) {
      console.error(`[CHANNEL] Failed to deliver webhook for logId ${logId}. Status: ${response.status}`);
      // A real channel service would retry webhooks here, but for this assignment,
      // the CRM Outbox retry logic handles the sending side, which is sufficient.
    }
  } catch (err) {
    console.error(`[CHANNEL] Network error delivering webhook for logId ${logId}`, err);
  }
}

app.listen(PORT, () => {
  console.log(`[CHANNEL SERVICE] Running on http://localhost:${PORT}`);
  console.log(`[CHANNEL SERVICE] Targeting CRM webhook: ${CRM_WEBHOOK_URL}`);
});
