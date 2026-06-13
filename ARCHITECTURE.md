# Lumora CRM Architecture

This document provides a deep dive into the technical architecture of the Lumora CRM System.

## High-Level Monorepo Structure

The repository is divided into two primary services:
1. **Frontend (`/frontend`)**: A Next.js 15 Application utilizing the App Router.
2. **Backend (`/backend`)**: A Node.js / Express server powered by Prisma ORM.

### 1. The Frontend Stack
- **Framework**: Next.js 15 (React 19)
- **Styling**: Tailwind CSS with custom CSS variables for Framer design tokens.
- **Components**: `lucide-react` for iconography, `recharts` for dashboard visualizations.
- **Routing**: Client-side Next.js routing. 
- **Landing Page Integration**: The main landing page is an optimized static export from Framer, integrated directly into the `public/` directory. Next.js `rewrites` securely route the root domain (`/`) to the static Framer asset while maintaining the React App Router for `/app/*` paths.

### 2. The Backend Stack
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **AI Integration**: Groq Cloud API running LLaMA-3.3-70B-Versatile.

## Database Schema Overview

The database is built relationally to support complex segmentation:

- **Customer**: The root entity. Holds metadata, total spend, and behavior tags.
- **Order**: A 1-to-many relation to Customer representing purchase history.
- **Segment**: Saved JSON representations of filter queries (e.g., `totalSpend > 20000`).
- **Campaign**: Maps a `Segment` to an outreach channel (Email, SMS, WhatsApp).
- **CommunicationLog**: Records individual message statuses (Delivered, Opened, Clicked) per customer per campaign.

## AI Workflow Explanation

Lumora CRM features an advanced, deeply integrated AI assistant. 

1. **System Prompting**: The Express backend initializes the LLM with a highly specific system prompt containing the exact JSON schema of the database structure and the capabilities of the system.
2. **Natural Language Processing**: When a user inputs a query (e.g., "Create a segment of VIPs in Mumbai"), the LLaMA 70B model parses the intent.
3. **Structured Execution**: Instead of just responding with text, the LLM is instructed to generate executable JSON blocks. 
4. **Action Handlers**: The backend intercepts these JSON blocks and dynamically executes Prisma database queries on the user's behalf.
5. **Real-time Reporting**: The resulting data is fed back to the frontend, rendering interactive UI components (like a new Segment card) directly inside the chat interface.

## Channel Service & Webhooks

To simulate real-world CRM environments, Lumora uses a **Channel Stub Service**.
- When a campaign is launched, the backend dispatches messages to a mock external channel (via an internal API route).
- A background worker loop processes these messages and fires randomized delivery statuses (Sent, Delivered, Opened, Failed) back to the backend's `/api/webhooks/delivery` endpoint.
- This creates realistic, live-updating metrics on the Campaign dashboard without requiring paid Twilio/SendGrid API keys during development.
