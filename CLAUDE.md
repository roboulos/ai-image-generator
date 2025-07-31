# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is an AI Image Generator web application built with Next.js 15, React 19, and Vercel AI SDK. It uses OpenAI's DALL-E 3 model to generate images from text prompts.

## Core Commands

```bash
# Development
npm run dev              # Start development server with Turbopack
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run Next.js linting

# Installation
npm install              # Install dependencies
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15.4.5 with App Router
- **UI**: React 19.1.0 with TypeScript
- **Styling**: Tailwind CSS v4 with PostCSS
- **AI Integration**: Vercel AI SDK with OpenAI provider
- **Image Generation**: DALL-E 3 API

### Project Structure
```
app/
├── api/
│   └── generate-image/
│       └── route.ts        # API endpoint for image generation
├── page.tsx                # Main UI component (client-side)
├── layout.tsx              # Root layout
└── globals.css             # Global styles with Tailwind
```

### Key Implementation Details

1. **API Route** (`app/api/generate-image/route.ts`):
   - POST endpoint that accepts a prompt
   - Uses `experimental_generateImage` from Vercel AI SDK
   - Configured for DALL-E 3 with HD quality and vivid style
   - Returns base64-encoded image data

2. **Client Component** (`app/page.tsx`):
   - State management for prompt, image URL, loading, and errors
   - Fetches from `/api/generate-image` endpoint
   - Displays generated images with download functionality
   - Responsive design with Tailwind CSS

3. **Environment Configuration**:
   - Requires `OPENAI_API_KEY` in `.env.local`
   - TypeScript strict mode enabled
   - Path alias `@/*` configured for project root

## Development Guidelines

### API Integration
- The app uses Vercel AI SDK's experimental image generation feature
- Image size is fixed at 1024x1024
- Provider options include quality and style settings

### State Management
- Simple useState hooks for local component state
- No global state management library currently implemented

### Error Handling
- API returns structured error responses
- Client displays user-friendly error messages
- Console logging for debugging in API routes

### TypeScript Configuration
- Strict mode enabled
- Module resolution set to "bundler"
- Next.js plugin configured for enhanced type checking