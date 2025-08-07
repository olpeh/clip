# One-Time Public Clipboard

A simple web application for sharing temporary content protected by a 4-digit PIN. Content can be retrieved only once and expires after 5 minutes.

## Features

- Share content with a 4-digit PIN
- Content expires after 5 minutes
- Content can only be retrieved once
- Simple, clean interface

## Deployment on Vercel

This application is configured for Vercel serverless deployment.

### Prerequisites

1. Install Vercel CLI:

   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

### Deploy

1. Deploy to Vercel:

   ```bash
   vercel
   ```

2. Follow the prompts to link your project

3. For production deployment:
   ```bash
   vercel --prod
   ```

### Local Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run locally with Vercel dev:
   ```bash
   npm run dev
   ```

## Database Setup (Required for Production)

This application uses **Redis** for persistent data storage. You need to set up a Redis database and configure the connection.

### 1. Set Up Redis Database

You can use any Redis provider:

- **Redis Cloud** (recommended for Vercel)
- **Upstash Redis**
- **AWS ElastiCache**
- **Google Cloud Memorystore**
- **Self-hosted Redis**

### 2. Configure Environment Variables

Add the `REDIS_URL` environment variable to your Vercel project:

1. Go to your Vercel project dashboard
2. Navigate to "Settings" → "Environment Variables"
3. Add `REDIS_URL` with your Redis connection string
4. Deploy your project

### 3. Local Development

For local development, create a `.env.local` file in your project root:

```bash
REDIS_URL=redis://localhost:6379
```

Or if using a cloud Redis service:

```bash
REDIS_URL=redis://username:password@host:port
```

## Important Notes

✅ **Data Persistence**: This application uses Redis for persistent data storage across serverless function invocations.

⚠️ **Security**: While this uses a proper database, it's still a demo application. Do not use for highly sensitive data as content is stored in plain text.

## API Endpoints

- `POST /api/set` - Store content with a PIN
- `POST /api/status` - Check if content exists and is available
- `POST /api/consume` - Retrieve and consume content (one-time use)

## Architecture

The application has been converted from a traditional Express server to Vercel serverless functions:

- Static files are served from the `public/` directory
- API endpoints are serverless functions in the `api/` directory
- Configuration is handled by `vercel.json`
