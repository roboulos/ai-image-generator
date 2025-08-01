# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
This is an AI Image Generator web application built with Next.js 15, React 19, and Vercel AI SDK. It uses OpenAI's DALL-E 3 model to generate images from text prompts with a chat-based interface.

## Core Commands

```bash
# Development
npm run dev              # Start development server with Turbopack (usually on port 3001)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run Next.js linting

# Installation
npm install              # Install dependencies

# Git Workflow
git add -A && git commit -m "message" && git push origin main  # Commit and deploy
```

## Effective Tactics for Development & Debugging

### 1. Vercel Deployment Commands
```bash
# Deploy to production
vercel --prod --yes

# List recent deployments
vercel ls --yes | head -5

# Check deployment status and get URLs
vercel ls --yes

# Check build logs for errors
vercel inspect --logs <deployment-url>

# Check runtime logs (waits for new logs)
vercel logs <deployment-url>

# List environment variables
vercel env ls
```

### 2. Testing & Debugging Flow
```bash
# 1. Test API endpoints locally
curl -X POST http://localhost:3001/api/generate-image \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test prompt"}'

# 2. Test deployed API endpoint
curl -X POST https://<deployment-url>/api/generate-image \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test prompt"}'

# 3. Create test script for debugging
node test-api.js  # Create a simple Node.js script to test API responses
```

### 3. Common Issues & Solutions

**Authentication Issues:**
- If seeing "Authentication Required" page, check Vercel project settings
- Go to Settings → Deployment Protection → Disable authentication if needed

**API Key Issues:**
- Add `OPENAI_API_KEY` in Vercel dashboard: Settings → Environment Variables
- Test locally with `.env.local` file

**Content Policy Violations:**
- DALL-E 3 has strict content policies
- Simple words like "hello" may be rejected
- Use descriptive prompts: "A beautiful sunset" instead of single words

**TypeScript Errors:**
- Always check for optional properties with `?.` or explicit checks
- Run `npm run build` locally before pushing to catch type errors

### 4. Development Best Practices
```bash
# Always test build locally before pushing
npm run build

# Check for TypeScript errors
npx tsc --noEmit

# Test with multiple prompts
# Good: "A serene mountain landscape"
# Bad: "hello" (may trigger content policy)
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15.4.5 with App Router
- **UI**: React 19.1.0 with TypeScript
- **Component Library**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS v4 with PostCSS
- **AI Integration**: Vercel AI SDK with OpenAI provider
- **Image Generation**: DALL-E 3 API
- **Notifications**: Sonner for toast messages

### Project Structure
```
app/
├── api/
│   └── generate-image/
│       └── route.ts        # API endpoint for image generation
├── page.tsx                # Main chat interface
├── layout.tsx              # Root layout with Toaster
└── globals.css             # Global styles with Tailwind

components/
├── chat-container.tsx      # Main chat UI with message list
├── chat-input.tsx          # Input field with send button
├── chat-message.tsx        # Individual message component
└── ui/                     # shadcn/ui components

lib/
├── types.ts                # TypeScript interfaces
└── utils.ts                # Utility functions (cn)
```

### Key Implementation Details

1. **Chat Interface** (`app/page.tsx`):
   - Full chat-based UI with message history
   - Local storage persistence for chat history
   - Real-time message updates with loading states
   - Clear chat functionality

2. **API Route** (`app/api/generate-image/route.ts`):
   - POST endpoint that accepts a prompt
   - Uses `experimental_generateImage` from Vercel AI SDK
   - Configured for DALL-E 3 with HD quality and vivid style
   - Returns base64-encoded image data
   - Enhanced error handling for content policy violations

3. **Message Components**:
   - User/AI message distinction with avatars
   - Inline image display with download functionality
   - Message actions: download, copy prompt, regenerate, delete
   - Loading skeletons and error states

4. **Environment Configuration**:
   - Requires `OPENAI_API_KEY` in `.env.local` and Vercel dashboard
   - TypeScript strict mode enabled
   - Path alias `@/*` configured for project root

## Development Guidelines

### UI Components
- Use shadcn/ui components for consistency
- Follow the established chat message pattern
- Implement proper loading states with Skeleton components
- Always include keyboard navigation support
- Use toast notifications for user feedback

### API Integration
- The app uses Vercel AI SDK's experimental image generation feature
- Image size is fixed at 1024x1024
- Provider options include quality and style settings
- Handle content policy violations gracefully

### State Management
- Chat messages stored in array with TypeScript interfaces
- Local storage for persistence across sessions
- Real-time updates using React state
- No global state management library needed

### Error Handling
- API returns structured error responses
- Client displays user-friendly error messages
- Toast notifications for success/error feedback
- Inline error states in chat messages
- Console logging for debugging in API routes

### TypeScript Configuration
- Strict mode enabled
- Always check optional properties
- Use proper type guards for undefined checks
- Module resolution set to "bundler"
- Next.js plugin configured for enhanced type checking

### Testing Checklist
1. Run `npm run build` before pushing
2. Test with various prompts (descriptive ones work better)
3. Check responsive design on mobile
4. Verify local storage persistence
5. Test error states (bad API key, network errors)
6. Ensure keyboard navigation works (Enter to send)