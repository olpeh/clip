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

## Important Notes

⚠️ **Data Persistence**: This demo uses in-memory storage that resets on each serverless function invocation. In production, you should use a persistent database like:

- Vercel KV (Redis)
- MongoDB
- PostgreSQL
- Supabase

⚠️ **Security**: This is a demo application. Do not use for sensitive data as content is stored in memory and could be accessible to other users on the same serverless instance.

## API Endpoints

- `POST /api/set` - Store content with a PIN
- `POST /api/status` - Check if content exists and is available
- `POST /api/consume` - Retrieve and consume content (one-time use)

## Architecture

The application has been converted from a traditional Express server to Vercel serverless functions:

- Static files are served from the `public/` directory
- API endpoints are serverless functions in the `api/` directory
- Configuration is handled by `vercel.json`
