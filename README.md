# BookMind

AI-enhanced personal bookmark manager. Save, organize, and discover your bookmarks with intelligent summarization and semantic search.

## Features

- **Smart Bookmarking**: Auto-extract metadata, AI-generated summaries
- **Intelligent Organization**: Categories, collections, and tags with AI suggestions
- **Semantic Search**: Find bookmarks by meaning, not just keywords
- **Multi-language**: English and Spanish support
- **Dark/Light Mode**: System preference detection
- **Mobile First**: Responsive design for all devices

## Tech Stack

- **Frontend**: React 19 + Vite + TypeScript
- **Styling**: TailwindCSS v4 + Shadcn/ui
- **State**: Zustand + TanStack Query
- **Database**: PostgreSQL (Neon) + Drizzle ORM
- **Auth**: Better Auth (Google, GitHub, Email)
- **AI**: Groq (Llama 3.1 70B)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Neon account (database)
- Groq API key
- Upstash Redis (rate limiting)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/bookmind.git
cd bookmind

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Fill in your environment variables in .env.local

# Run database migrations
pnpm db:push

# Start development server
pnpm dev
```

### Environment Variables

See `.env.example` for all required variables.

## Development

```bash
# Start dev server
pnpm dev

# Run tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Type check
pnpm typecheck

# Lint and format
pnpm check

# Generate database migration
pnpm db:generate

# Push schema changes
pnpm db:push

# Open Drizzle Studio
pnpm db:studio
```

## Project Structure

```
bookmind/
├── src/
│   ├── api/           # API routes (serverless)
│   ├── components/    # React components
│   │   ├── ui/        # Shadcn components
│   │   └── ...        # Feature components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utilities and configs
│   │   ├── db/        # Drizzle schemas
│   │   ├── ai/        # Groq integration
│   │   └── utils/     # Helper functions
│   ├── pages/         # Route pages
│   ├── stores/        # Zustand stores
│   ├── i18n/          # Translations
│   └── styles/        # Global styles
├── tests/             # Test files
├── drizzle/           # Database migrations
└── public/            # Static assets
```

## License

MIT
