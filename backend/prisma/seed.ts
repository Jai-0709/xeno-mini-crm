import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const names = [
  'Aarav Shah','Priya Mehta','Rohan Gupta','Ananya Singh','Vikram Nair',
  'Kavya Reddy','Arjun Sharma','Sneha Patel','Karan Joshi','Pooja Iyer',
  'Rahul Verma','Diya Kapoor','Amit Desai','Riya Kumar','Nikhil Tiwari',
  'Sanya Bose','Aditya Rao','Meera Pillai','Suresh Malhotra','Naina Chawla',
  'Ishaan Pandey','Tanvi Srivastava','Devraj Menon','Simran Ahuja','Pranav Saxena',
  'Anushka Bhatt','Varun Sethi','Kritika Jain','Ronak Trivedi','Swati Mishra',
  'Siddharth Naik','Divya Agarwal','Manish Oberoi','Pallavi Das','Rajesh Kaur',
  'Preeti Thakur','Akash Bansal','Shruti Walia','Vipul Chatterjee','Madhuri Gill',
  'Yash Khanna','Ritika Sinha','Gaurav Dubey','Poonam Rastogi','Kartik Bhardwaj',
  'Nidhi Rajan','Shubham Lal','Anjali Choudhary','Deepak Mittal','Neha Saini',
];

const cities = ['Mumbai','Delhi','Bengaluru','Chennai','Hyderabad','Pune','Kolkata','Ahmedabad','Jaipur','Surat'];
const colors = ['#4f6ef7','#7c5cbf','#22c55e','#f59e0b','#ef4444','#06b6d4','#ec4899','#8b5cf6','#14b8a6','#f97316'];
const tags = ['VIP','Regular','At-Risk','New','Loyal'];
const products = ['iPhone 15 Pro','Sony WH-1000XM5','Samsung 4K TV','MacBook Air M3','Nike Air Max','Levi\'s Jeans','Dyson V15','iPad Pro','AirPods Pro','Canon DSLR','Bose Speaker','Dell Monitor','Kindle Paperwhite','GoPro Hero','Fitbit Charge'];

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - randomBetween(1, daysAgo));
  return d;
}

async function main() {
  console.log('🌱 Seeding database...');

  await prisma.communicationLog.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.segment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();

  const customers = [];
  for (let i = 0; i < 50; i++) {
    const name = names[i];
    const city = cities[i % cities.length];
    const color = colors[i % colors.length];
    const tag = tags[Math.floor(Math.random() * tags.length)];
    const email = name.toLowerCase().replace(/\s/g, '.') + '@example.com';
    const phone = `+91${randomBetween(7000000000, 9999999999)}`;

    const c = await prisma.customer.create({
      data: { name, email, phone, city, avatarColor: color, tag },
    });
    customers.push(c);
  }

  // Create 3 orders per customer (150 total)
  for (const customer of customers) {
    let totalSpend = 0;
    let totalOrders = 0;
    let lastDate: Date | null = null;

    for (let j = 0; j < 3; j++) {
      const amount = parseFloat((randomBetween(500, 25000) + Math.random()).toFixed(2));
      const createdAt = randomDate(365);
      await prisma.order.create({
        data: {
          customerId: customer.id,
          productName: products[randomBetween(0, products.length - 1)],
          amount,
          status: ['completed','completed','completed','returned','pending'][randomBetween(0,4)],
          createdAt,
        },
      });
      totalSpend += amount;
      totalOrders += 1;
      if (!lastDate || createdAt > lastDate) lastDate = createdAt;
    }

    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        totalOrders,
        totalSpend: parseFloat(totalSpend.toFixed(2)),
        avgOrderValue: parseFloat((totalSpend / totalOrders).toFixed(2)),
        lastPurchaseDate: lastDate,
      },
    });
  }

  // 5 Segments
  const segments = await Promise.all([
    prisma.segment.create({ data: { name: 'High Spenders', description: 'Customers who spent over ₹20,000', filters: JSON.stringify([{ field:'totalSpend', operator:'gt', value:20000 }]), customerCount: customers.filter(c => true).length } }),
    prisma.segment.create({ data: { name: 'Mumbai VIPs', description: 'VIP customers in Mumbai', filters: JSON.stringify([{ field:'city', operator:'eq', value:'Mumbai' },{ field:'tag', operator:'eq', value:'VIP' }]), customerCount: 8 } }),
    prisma.segment.create({ data: { name: 'At-Risk Users', description: 'Customers tagged At-Risk', filters: JSON.stringify([{ field:'tag', operator:'eq', value:'At-Risk' }]), customerCount: 10 } }),
    prisma.segment.create({ data: { name: 'New Customers', description: 'Recently joined customers', filters: JSON.stringify([{ field:'totalOrders', operator:'lte', value:1 }]), customerCount: 12 } }),
    prisma.segment.create({ data: { name: 'Loyal Buyers', description: 'Customers with 3+ orders', filters: JSON.stringify([{ field:'totalOrders', operator:'gte', value:3 }]), customerCount: 35 } }),
  ]);

  // 8 Campaigns
  const channels = ['whatsapp','email','sms','email','whatsapp','sms','email','whatsapp'];
  const campaignNames = [
    'Diwali Flash Sale','Win-Back VIPs','Summer Kickoff','New Arrivals Alert',
    'Loyalty Rewards','Re-Engage Mumbai','Weekly Newsletter','Product Launch'
  ];
  const statuses = ['completed','completed','running','scheduled','completed','failed','completed','draft'];

  for (let i = 0; i < 8; i++) {
    const seg = segments[i % segments.length];
    const total = randomBetween(100, 500);
    const sent = statuses[i] === 'draft' ? 0 : total;
    const delivered = statuses[i] === 'draft' ? 0 : Math.floor(sent * 0.92);
    const opened = statuses[i] === 'draft' ? 0 : Math.floor(delivered * 0.45);
    const clicked = statuses[i] === 'draft' ? 0 : Math.floor(opened * 0.3);
    const failed = sent - delivered;

    await prisma.campaign.create({
      data: {
        name: campaignNames[i],
        channel: channels[i],
        segmentId: seg.id,
        message: `Hi {{name}}, check out our exclusive offer just for you! 🎉`,
        status: statuses[i],
        scheduledAt: statuses[i] === 'scheduled' ? new Date(Date.now() + 86400000) : null,
        launchedAt: statuses[i] !== 'draft' && statuses[i] !== 'scheduled' ? randomDate(30) : null,
        completedAt: statuses[i] === 'completed' ? randomDate(10) : null,
        totalRecipients: total,
        sent,
        delivered,
        failed,
        opened,
        clicked,
        createdAt: randomDate(60),
      },
    });
  }

  console.log('✅ Seeded 50 customers, 150 orders, 5 segments, 8 campaigns');
}

main().catch(console.error).finally(() => prisma.$disconnect());
