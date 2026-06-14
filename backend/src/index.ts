import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import Groq from 'groq-sdk';

const prisma = new PrismaClient({ log: ['error'] });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const GROQ_MODEL = 'llama-3.3-70b-versatile';

const app = express();

// Health check endpoint for UptimeRobot
app.get('/', (req, res) => {
  res.status(200).send('Lumora CRM Backend is Awake!');
});
app.use(cors());
app.use(express.json());

// ─── Utilities ───────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// ─── Filter Engine ────────────────────────────────────────────────────────────
// Supports camelCase field names from the frontend

type FilterRule = { field: string; operator: string; value: string | number };

function buildPrismaWhere(filters: FilterRule[], logic: 'AND' | 'OR' = 'AND') {
  const conditions = filters.map((f) => {
    const { field, operator, value } = f;
    const numVal = typeof value === 'string' ? parseFloat(value) : value;

    switch (field) {
      case 'totalSpend':
      case 'total_spend':
        return { totalSpend: mapOp(operator, numVal) };
      case 'totalOrders':
      case 'order_count':
        return { totalOrders: mapOp(operator, numVal) };
      case 'avgOrderValue':
      case 'avg_order_value':
        return { avgOrderValue: mapOp(operator, numVal) };
      case 'city':
        return { city: { equals: String(value) } };
      case 'tag':
        return { tag: { equals: String(value) } };
      case 'lastPurchaseDate':
      case 'days_since_purchase': {
        const days = numVal;
        const date = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        return operator === 'gt'
          ? { lastPurchaseDate: { lt: date } }
          : { lastPurchaseDate: { gte: date } };
      }
      default:
        return {};
    }
  }).filter(c => Object.keys(c).length > 0);

  if (conditions.length === 0) return {};
  return logic === 'AND' ? { AND: conditions } : { OR: conditions };
}

function mapOp(operator: string, value: number) {
  switch (operator) {
    case 'gt':  return { gt: value };
    case 'lt':  return { lt: value };
    case 'gte': return { gte: value };
    case 'lte': return { lte: value };
    case 'eq':  return { equals: value };
    case 'neq': return { not: value };
    default:    return { gte: value };
  }
}

// ─── Channel Simulation Loop ──────────────────────────────────────────────────

// Called internally — simulates async delivery for a single CommunicationLog
async function simulateDelivery(logId: string, campaignId: string) {
  try {
    // Mark as "sent" after a short delay (channel handoff)
    await sleep(randInt(100, 400));
    await prisma.communicationLog.update({
      where: { id: logId },
      data: { status: 'sent', sentAt: new Date() },
    });
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { sent: { increment: 1 } },
    });

    // Simulate delivery (92% success rate)
    await sleep(randInt(300, 1200));
    const delivered = Math.random() < 0.92;
    if (!delivered) {
      await prisma.communicationLog.update({
        where: { id: logId },
        data: { status: 'failed' },
      });
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { failed: { increment: 1 } },
      });
      return;
    }

    await prisma.communicationLog.update({
      where: { id: logId },
      data: { status: 'delivered', deliveredAt: new Date() },
    });
    await prisma.campaign.update({
      where: { id: campaignId },
      data: { delivered: { increment: 1 } },
    });

    // Simulate open (45% open rate)
    await sleep(randInt(500, 3000));
    if (Math.random() < 0.45) {
      await prisma.communicationLog.update({
        where: { id: logId },
        data: { status: 'opened', openedAt: new Date() },
      });
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { opened: { increment: 1 } },
      });

      // Simulate click (30% of opens)
      await sleep(randInt(500, 2000));
      if (Math.random() < 0.30) {
        await prisma.communicationLog.update({
          where: { id: logId },
          data: { status: 'clicked', clickedAt: new Date() },
        });
        await prisma.campaign.update({
          where: { id: campaignId },
          data: { clicked: { increment: 1 } },
        });
      }
    }

    // Check if campaign should be marked complete
    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (campaign && (campaign.sent + campaign.failed) >= campaign.totalRecipients) {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: 'completed', completedAt: new Date() },
      });
    }
  } catch (err) {
    // Simulation errors are non-fatal
    console.error('[channel-stub] error for log', logId, err);
  }
}

// ─── CUSTOMERS ────────────────────────────────────────────────────────────────

app.get('/api/customers', async (req, res) => {
  try {
    const { search, tag } = req.query;
    let where: any = {};
    if (search) {
      const s = String(search);
      where.OR = [
        { name: { contains: s } },
        { email: { contains: s } },
        { city: { contains: s } },
      ];
    }
    if (tag) where.tag = String(tag);
    const customers = await prisma.customer.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json(customers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

app.get('/api/customers/:id', async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        orders: { orderBy: { createdAt: 'desc' } },
        communications: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!customer) return res.status(404).json({ error: 'Not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// ─── SEGMENTS ─────────────────────────────────────────────────────────────────

app.get('/api/segments', async (req, res) => {
  try {
    const segments = await prisma.segment.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(segments);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch segments' });
  }
});

// POST /api/segments — create OR preview
app.post('/api/segments', async (req, res) => {
  try {
    const { name, description, filters, logic = 'AND', preview } = req.body;
    const rules: FilterRule[] = Array.isArray(filters) ? filters : JSON.parse(filters || '[]');
    const where = buildPrismaWhere(rules, logic);
    const customerCount = await prisma.customer.count({ where });

    // preview=true just returns the count, does not save
    if (preview) {
      return res.json({ count: customerCount });
    }

    const segment = await prisma.segment.create({
      data: {
        name,
        description: description || '',
        filters: JSON.stringify(rules),
        customerCount,
      },
    });
    res.json(segment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save segment' });
  }
});

app.delete('/api/segments/:id', async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({ where: { segmentId: req.params.id } });
    for (const c of campaigns) {
      await prisma.communicationLog.deleteMany({ where: { campaignId: c.id } });
      await prisma.campaign.delete({ where: { id: c.id } });
    }
    await prisma.segment.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete segment' });
  }
});

// ─── CAMPAIGNS ────────────────────────────────────────────────────────────────

app.get('/api/campaigns', async (req, res) => {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: { segment: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// POST /api/campaigns — create new campaign draft
app.post('/api/campaigns', async (req, res) => {
  try {
    const { name, channel, segmentId, message, scheduledAt, status } = req.body;
    const campaign = await prisma.campaign.create({
      data: {
        name,
        channel,
        segmentId,
        message,
        status: status || 'draft',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
      include: { segment: true },
    });
    res.json(campaign);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// GET /api/campaigns/:id/stats — live polling endpoint
app.get('/api/campaigns/:id/stats', async (req, res) => {
  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
      include: { segment: true },
    });
    res.json(campaign || {});
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch campaign stats' });
  }
});

// DELETE /api/campaigns/:id — delete campaign
app.delete('/api/campaigns/:id', async (req, res) => {
  try {
    await prisma.communicationLog.deleteMany({ where: { campaignId: req.params.id } });
    await prisma.campaign.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete campaign' });
  }
});

// ─── GLOBAL SEARCH ────────────────────────────────────────────────────────────
app.get('/api/search', async (req, res) => {
  try {
    const q = String(req.query.q || '');
    if (!q) return res.json({ customers: [], campaigns: [], segments: [] });

    const [customers, campaigns, segments] = await Promise.all([
      prisma.customer.findMany({
        where: { OR: [{ name: { contains: q } }, { email: { contains: q } }, { city: { contains: q } }] },
        take: 5
      }),
      prisma.campaign.findMany({
        where: { name: { contains: q } },
        take: 5
      }),
      prisma.segment.findMany({
        where: { name: { contains: q } },
        take: 5
      })
    ]);

    res.json({ customers, campaigns, segments });
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// POST /api/campaigns/:id/launch — the full channel service loop entry point
app.post('/api/campaigns/:id/launch', async (req, res) => {
  try {
    const { id } = req.params;
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: { segment: true },
    });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    if (campaign.status === 'running' || campaign.status === 'completed') {
      return res.status(400).json({ error: `Campaign already ${campaign.status}` });
    }

    // 1. Resolve segment → matching customers
    let filters: FilterRule[] = [];
    try { filters = JSON.parse(campaign.segment.filters); } catch {}
    const where = buildPrismaWhere(filters);
    const customers = await prisma.customer.findMany({ where, select: { id: true } });

    if (customers.length === 0) {
      return res.status(400).json({ error: 'Segment has 0 matching customers' });
    }

    // 2. Update campaign to "running"
    await prisma.campaign.update({
      where: { id },
      data: {
        status: 'running',
        launchedAt: new Date(),
        totalRecipients: customers.length,
        sent: 0, delivered: 0, failed: 0, opened: 0, clicked: 0,
      },
    });

    // 3. Create CommunicationLog row for each recipient (queued)
    // Batch-create to avoid SQLite timeout
    const BATCH = 20;
    const logIds: string[] = [];
    for (let i = 0; i < customers.length; i += BATCH) {
      const batch = customers.slice(i, i + BATCH);
      // createMany doesn't return IDs in SQLite; create individually
      for (const customer of batch) {
        const log = await prisma.communicationLog.create({
          data: {
            campaignId: id,
            customerId: customer.id,
            channel: campaign.channel,
            message: campaign.message.replace('{{name}}', ''),
            status: 'queued',
          },
        });
        logIds.push(log.id);
      }
    }

    // 4. Return immediately — fire-and-forget the simulation
    res.json({ ok: true, totalRecipients: customers.length });

    // 5. Trigger channel stub simulation async (staggered so SQLite isn't slammed)
    const stagger = Math.min(50, 2000 / logIds.length); // max 2s ramp-up
    for (let idx = 0; idx < logIds.length; idx++) {
      const logId = logIds[idx];
      setTimeout(() => {
        simulateDelivery(logId, id).catch(console.error);
      }, idx * stagger);
    }

  } catch (err) {
    console.error('[launch]', err);
    res.status(500).json({ error: 'Failed to launch campaign' });
  }
});

// ─── CHANNEL STUB (external-facing stub endpoint) ─────────────────────────────
// This would normally be a separate microservice. We expose it here for completeness.

app.post('/api/channel-stub/send', async (req, res) => {
  const { logId, campaignId } = req.body;
  if (!logId || !campaignId) return res.status(400).json({ error: 'logId and campaignId required' });
  // Accept immediately and simulate asynchronously
  res.status(202).json({ status: 'accepted', logId });
  simulateDelivery(logId, campaignId).catch(console.error);
});

// ─── DELIVERY WEBHOOK ─────────────────────────────────────────────────────────
// Receives callbacks from the channel service

app.post('/api/webhooks/delivery', async (req, res) => {
  try {
    const { logId, campaignId, outcome } = req.body;
    // outcome: sent | delivered | failed | opened | clicked

    const statusMap: Record<string, string> = {
      sent: 'sent', delivered: 'delivered', failed: 'failed',
      opened: 'opened', clicked: 'clicked',
    };

    const newStatus = statusMap[outcome];
    if (!newStatus) return res.status(400).json({ error: 'Unknown outcome' });

    const dateFields: Record<string, object> = {
      sent:      { sentAt: new Date() },
      delivered: { deliveredAt: new Date() },
      opened:    { openedAt: new Date() },
      clicked:   { clickedAt: new Date() },
    };

    await prisma.communicationLog.update({
      where: { id: logId },
      data: { status: newStatus, ...dateFields[outcome] },
    });

    await prisma.campaign.update({
      where: { id: campaignId },
      data: { [outcome]: { increment: 1 } },
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('[webhook]', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────

app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const [customerCount, campaigns] = await Promise.all([
      prisma.customer.count(),
      prisma.campaign.findMany(),
    ]);

    const activeCampaigns = campaigns.filter(c => c.status === 'running').length;
    const openRates = campaigns.filter(c => c.delivered > 0)
      .map(c => (c.opened / c.delivered) * 100);
    const avgOpenRate = openRates.length
      ? Math.round(openRates.reduce((a, b) => a + b, 0) / openRates.length * 10) / 10
      : 0;
    const totalRevenue = campaigns.reduce((sum, c) => sum + c.clicked * 1200, 0); // attributed revenue stub

    res.json({
      customerCount,
      campaignCount: campaigns.length,
      activeCampaigns,
      avgOpenRate,
      totalRevenue,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// ─── AI ENDPOINTS ────────────────────────────────────────────────────────────

app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    // Pull live context to ground the AI
    const [customers, campaigns, segments] = await Promise.all([
      prisma.customer.findMany({ take: 50 }),
      prisma.campaign.findMany({ take: 20, include: { segment: true } }),
      prisma.segment.findMany({ take: 10 }),
    ]);

    const totalSpend = customers.reduce((s, c) => s + c.totalSpend, 0);
    const openRates = campaigns.filter(c => c.delivered > 0)
      .map(c => Math.round(c.opened / c.delivered * 100));
    const avgOpen = openRates.length
      ? Math.round(openRates.reduce((a, b) => a + b, 0) / openRates.length)
      : 0;

    const systemPrompt = `You are Lumora AI — a CRM analytics assistant for an Indian e-commerce brand.
You have access to live data:
- ${customers.length} customers, total spend ₹${totalSpend.toLocaleString('en-IN')}
- ${campaigns.length} campaigns, avg open rate ${avgOpen}%
- ${segments.length} segments: ${segments.map(s => `${s.name} (${s.customerCount} customers)`).join(', ')}
- Top campaigns: ${campaigns.slice(0, 3).map(c => `${c.name} (${c.status}, ${c.opened} opens)`).join(', ')}
- Customer tags distribution: VIP, Loyal, Regular, New, At-Risk
Answer concisely and data-specifically. Format with **bold** and bullet points where helpful.`;

    const historyMessages = (history || []).slice(-8).map((m: any) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...historyMessages,
        { role: 'user', content: message },
      ],
      model: GROQ_MODEL,
      temperature: 0.7,
      max_tokens: 1024,
    });

    res.json({ reply: completion.choices[0]?.message?.content || 'I am unable to assist right now.' });
  } catch (err) {
    console.error('[ai/chat]', err);
    res.status(500).json({ error: 'AI chat failed' });
  }
});

app.post('/api/ai/message', async (req, res) => {
  try {
    const { channel, campaignName, segmentName, tone } = req.body;
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a marketing copywriter for an Indian e-commerce brand. Write a concise, high-converting ${channel?.toUpperCase()} message. Use {{name}} for personalisation. Keep it under 160 characters for SMS, under 300 words for WhatsApp/Email. Tone: ${tone || 'friendly'}.`,
        },
        {
          role: 'user',
          content: `Write a ${channel} message for campaign "${campaignName}" targeting the "${segmentName}" segment.`,
        },
      ],
      model: GROQ_MODEL,
      temperature: 0.75,
      max_tokens: 400,
    });
    res.json({ message: completion.choices[0]?.message?.content || '' });
  } catch (err) {
    console.error('[ai/message]', err);
    res.status(500).json({ error: 'Failed to generate message' });
  }
});

app.post('/api/ai/segment', async (req, res) => {
  try {
    const { prompt } = req.body;
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You convert natural-language segment descriptions into filter rules. 
Available fields: totalSpend (number), totalOrders (number), avgOrderValue (number), city (string: Mumbai/Delhi/Bengaluru/Chennai/Hyderabad/Pune/Kolkata/Ahmedabad/Jaipur/Surat), tag (string: VIP/Regular/At-Risk/New/Loyal), lastPurchaseDate (number = days ago).
Operators: gt, lt, gte, lte, eq, neq.
Respond ONLY with valid JSON: {"name": "Segment Name", "rules": [{"field": "...", "operator": "...", "value": "..."}]}`,
        },
        { role: 'user', content: prompt },
      ],
      model: GROQ_MODEL,
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });
    const parsed = JSON.parse(completion.choices[0]?.message?.content || '{}');
    res.json({ rules: parsed.rules || [], name: parsed.name || 'AI Segment' });
  } catch (err) {
    console.error('[ai/segment]', err);
    res.status(500).json({ error: 'Failed to generate segment rules' });
  }
});

// ─── SERVER ──────────────────────────────────────────────────────────────────

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Lumora CRM backend running on http://localhost:${PORT}`);
  console.log(`   Channel stub loop: integrated`);
  console.log(`   AI: Groq llama-3.3-70b`);
});
