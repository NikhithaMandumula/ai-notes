# AI Notes

An AI-powered note-taking application with real-time collaboration, smart autocomplete, AI-generated summaries, and a modern UI.

## Features

- **Rich Text Editor** -- TipTap-based editor with bold, italic, underline, headings, lists, links, and image embedding
- **AI Autocomplete** -- Real-time ghost text suggestions while typing, accepted with Tab (Groq / Llama 3.1)
- **AI Summaries** -- One-click note summarization
- **AI Chat** -- Conversational assistant with streaming responses and note context awareness
- **Resource Import** -- Generate notes from uploaded files (PDF, DOCX, PPTX, TXT) or YouTube videos
- **Real-Time Sharing** -- Share notes by email with instant Socket.IO notifications
- **Organization** -- Folders, tags, pinning, favorites, trash/restore
- **Analytics Dashboard** -- Charts and stats for notes created over time, category distribution, word counts
- **Authentication** -- JWT-based signup/login, password reset via email OTP, Google OAuth
- **Dark / Light Theme**

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS 4, Framer Motion |
| Editor | TipTap (ProseMirror) |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| AI | Vercel AI SDK, Groq (Llama 3.1 8B) |
| Real-Time | Socket.IO |
| Email | Nodemailer |

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB instance (local or Atlas)
- Groq API key -- [console.groq.com](https://console.groq.com)
- (Optional) Gmail App Password for email features
- (Optional) Google OAuth Client ID for Google sign-in

## Setup

```bash
git clone <repo-url>
cd ai-notes
npm install
cp .env.example .env
# Fill in the environment variables (see below)
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: `5000`) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for signing JWTs |
| `GROQ_API_KEY` | Yes | Groq API key for AI features |
| `CORS_ORIGIN` | No | Frontend origin for CORS (default: `http://localhost:5173`) |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `SMTP_SERVICE` | No | Email service (default: `gmail`) |
| `SMTP_USER` | No | SMTP username / email |
| `SMTP_PASS` | No | SMTP password or app password |
| `SMTP_FROM` | No | Sender email address |

## Running

Start both frontend and backend in development mode:

```bash
npm run dev
```

- **Frontend** (Vite): http://localhost:5173
- **Backend** (Express): http://localhost:5002

The Vite dev server proxies `/api`, `/socket.io`, and `/uploads` to the backend.

### Individual commands

```bash
npm run dev:frontend   # Vite dev server only
npm run dev:backend    # Express server only (nodemon)
npm run build          # Production build
npm run preview        # Preview production build
npm run lint           # ESLint
```

## Project Structure

```
ai-notes/
  src/
    components/    # Reusable UI components
    pages/         # Application pages
    services/      # API client functions
    context/       # React context providers (Auth, Theme, Socket)
    hooks/         # Custom hooks (useAutocomplete, useVoiceRecording)
    extensions/    # TipTap editor extensions
    utils/         # Helper functions
  server/
    routes/        # Express route handlers
    models/        # Mongoose schemas
    middleware/    # Auth and validation middleware
    utils/         # Email, Groq, cookie helpers
    uploads/       # Uploaded files (gitignored)
  public/          # Static assets
```
