# Lumora CRM - Ultimate Free Deployment Guide

This guide covers the exact step-by-step process to deploy your CRM for 100% free, 24/7, without ever encountering Render's 15-minute sleep restrictions.

**The Stack:**
- **Database:** Supabase (Free PostgreSQL)
- **Backend:** Render (Free Node Server)
- **Frontend:** Vercel (Free Next.js Hosting)
- **Anti-Sleep Bot:** UptimeRobot (Free Pinging Service)

---

## Step 1: Push Your Code to GitHub
Before you can use any cloud hosting, your code must be on GitHub.

1. Create a free account on [GitHub](https://github.com/).
2. Click the **"+"** icon in the top right and select **New repository**.
3. Name it `lumora-crm` and make it **Private**. Click **Create**.
4. Open your terminal in VS Code (ensure you are in the `c:\My Web Sites\CRM SYSTEM` folder).
5. Run the following commands:
```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/lumora-crm.git
git push -u origin main
```
*(Replace `YOUR_USERNAME` with your actual GitHub username).*

---

## Step 2: Setup the Database (Supabase)
We need a cloud database so your backend can save customers and campaigns.

1. Go to [Supabase.com](https://supabase.com/) and sign in with GitHub.
2. Click **New Project** and select your organization.
3. Name the project `Lumora Database`.
4. Create a secure Database Password and save it somewhere safely!
5. Select a region close to you and click **Create new project**. *(It takes about 2 minutes to provision).*
6. Once provisioned, click the **Settings (Gear Icon)** in the left sidebar.
7. Click **Database** under the Configuration section.
8. Scroll down to **Connection String** and select **URI**.
9. It will look like this: `postgresql://postgres.[YOUR_PROJECT_ID]:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres`
10. Copy this string. Replace `[YOUR-PASSWORD]` with the password you created in step 4. Keep this full string ready for the next step.

---

## Step 3: Deploy the Backend (Render)
Now we deploy the Express server to Render.

1. Go to [Render.com](https://render.com/) and sign in with GitHub.
2. Click the **"New +"** button in the top right and select **Web Service**.
3. Select **Build and deploy from a Git repository** and click Next.
4. Connect your GitHub account and select your `lumora-crm` repository.
5. Fill out the configuration exactly like this:
   - **Name:** `lumora-api`
   - **Region:** (Choose the one closest to your Supabase region)
   - **Root Directory:** `backend` *(CRITICAL: DO NOT SKIP THIS)*
   - **Environment:** `Node`
   - **Build Command:** `npm install && npx prisma generate && npx prisma db push && npx prisma db seed && npm run build`
   - **Start Command:** `npm start`
6. Scroll down to **Environment Variables** and add two keys:
   - Key: `DATABASE_URL` | Value: *(Paste your Supabase connection string from Step 2)*
   - Key: `GROQ_API_KEY` | Value: *(Paste your Groq AI API Key)*
7. Click **Create Web Service**.
8. Render will now download your code, connect to Supabase, build your database schema (`db push`), seed the fake data (`db seed`), and start the server.
9. Look at the top left of the Render dashboard and copy your backend URL (e.g., `https://lumora-api.onrender.com`).

---

## Step 4: The "Anti-Sleep" Trick (UptimeRobot)
Render's free tier puts your app to sleep if it receives no traffic for 15 minutes. We will use UptimeRobot to ping the backend every 10 minutes, keeping it awake 24/7 forever for free.

1. Go to [UptimeRobot.com](https://uptimerobot.com/) and create a free account.
2. Click **Add New Monitor**.
3. Configure it exactly like this:
   - **Monitor Type:** `HTTP(s)`
   - **Friendly Name:** `Lumora Backend Keep-Alive`
   - **URL (or IP):** *(Paste your Render URL here, e.g., `https://lumora-api.onrender.com`)*
   - **Monitoring Interval:** `10 minutes`
4. Click **Create Monitor**.
5. Your backend will now never fall asleep! You will use exactly 744 hours of your 750-hour monthly Render allowance, meaning it stays free forever.

---

## Step 5: Deploy the Frontend (Vercel)
Finally, we host the stunning UI on Vercel.

1. Go to [Vercel.com](https://vercel.com/) and sign in with GitHub.
2. Click **Add New... -> Project**.
3. Find your `lumora-crm` repository and click **Import**.
4. In the configuration screen, look for **Root Directory**. Click **Edit** and select `frontend`.
5. Open the **Environment Variables** section and add one key:
   - Key: `NEXT_PUBLIC_API_URL` | Value: *(Paste your Render backend URL from Step 3)*
6. Click **Deploy**.
7. Vercel will build the frontend and link it automatically to your backend.

## 🎉 You're Done!
Once Vercel finishes, click **Continue to Dashboard** and click the **Visit** button. Your Lumora CRM is now fully live on the internet, awake 24/7, and operating 100% free of charge.
