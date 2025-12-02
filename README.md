# BookMind

AI-enhanced personal bookmark manager. Save, organize, and discover your bookmarks with intelligent summarization and semantic search.

## Features

- **Smart Bookmarking**: Auto-extract metadata, AI-generated summaries
- **Intelligent Organization**: Categories, collections, and tags with AI suggestions
- **Semantic Search**: Find bookmarks by meaning, not just keywords
- **Multi-language**: English and Spanish support
- **Dark/Light Mode**: System preference detection
- **Mobile First**: Responsive design for all devices
- **Export Options**: JSON, HTML (Netscape), and CSV formats

## Tech Stack

- **Frontend**: React 19 + Vite + TypeScript
- **Styling**: TailwindCSS v4 + Shadcn/ui
- **State**: Zustand + TanStack Query
- **Database**: PostgreSQL (Neon) + Drizzle ORM
- **Auth**: Better Auth (Google, GitHub, Email)
- **AI**: Groq (Llama 3.1 70B)
- **Rate Limiting**: Upstash Redis
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL (local Docker or Neon account)
- Groq API key (for AI features)
- Upstash Redis (for rate limiting)
- Google/GitHub OAuth apps (for social login)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/bookmind.git
cd bookmind

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Fill in your environment variables in .env.local (see below)

# Start local PostgreSQL (optional, for local development)
docker-compose up -d postgres

# Run database migrations
pnpm db:push

# Seed the database (optional)
pnpm db:seed

# Start development server
pnpm dev
```

### Environment Variables

Create a `.env.local` file with the following variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_APP_URL` | Yes | Application URL (e.g., `http://localhost:5173`) |
| `VITE_API_URL` | Yes | API URL (e.g., `http://localhost:5173/api`) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Yes | Auth secret (32+ chars, use `openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | Yes | Auth callback URL |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `GITHUB_CLIENT_ID` | No | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | No | GitHub OAuth client secret |
| `GROQ_API_KEY` | Yes | Groq API key for AI features |
| `UPSTASH_REDIS_REST_URL` | Yes | Upstash Redis URL for rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Yes | Upstash Redis token |
| `CSRF_SECRET` | Yes | CSRF secret (32+ chars) |

#### Getting API Keys

- **Neon PostgreSQL**: [console.neon.tech](https://console.neon.tech)
- **Groq**: [console.groq.com/keys](https://console.groq.com/keys)
- **Upstash Redis**: [console.upstash.com](https://console.upstash.com)
- **Google OAuth**: [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
- **GitHub OAuth**: [github.com/settings/developers](https://github.com/settings/developers)

## Development

```bash
# Start dev server (frontend + API)
pnpm dev

# Start frontend only
pnpm dev:frontend

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Type check
pnpm typecheck

# Lint
pnpm lint

# Format code
pnpm format

# Check (lint + format)
pnpm check
```

### Database Commands

```bash
# Generate migration from schema changes
pnpm db:generate

# Push schema changes to database
pnpm db:push

# Open Drizzle Studio (database GUI)
pnpm db:studio

# Seed database with sample data
pnpm db:seed
```

### Running Tests

```bash
# Unit and integration tests
pnpm test

# With coverage report
pnpm test:coverage

# E2E tests (requires running app)
pnpm e2e

# E2E tests in UI mode
pnpm e2e:ui
```

## Project Structure

```
bookmind/
├── src/
│   ├── api/              # API routes (serverless functions)
│   ├── components/       # React components
│   │   ├── ui/           # Shadcn/ui components
│   │   ├── auth/         # Authentication components
│   │   ├── bookmarks/    # Bookmark components
│   │   ├── collections/  # Collection components
│   │   ├── categories/   # Category components
│   │   ├── shared/       # Shared/common components
│   │   └── ...
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and configurations
│   │   ├── db/           # Database schemas and config
│   │   ├── ai/           # AI/Groq integration
│   │   ├── api/          # API utilities
│   │   ├── i18n/         # Internationalization
│   │   └── utils/        # Helper functions
│   ├── pages/            # Page components
│   ├── stores/           # Zustand state stores
│   ├── schemas/          # Zod validation schemas
│   └── styles/           # Global styles
├── tests/
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── e2e/              # E2E tests (Playwright)
├── drizzle/              # Database migrations
└── public/               # Static assets
```

## API Endpoints

### Authentication

- `POST /api/auth/sign-up` - Register new user
- `POST /api/auth/sign-in` - Login with email/password
- `POST /api/auth/sign-out` - Logout
- `GET /api/auth/session` - Get current session
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Bookmarks

- `GET /api/bookmarks` - List user bookmarks
- `POST /api/bookmarks` - Create bookmark
- `GET /api/bookmarks/:id` - Get bookmark by ID
- `PUT /api/bookmarks/:id` - Update bookmark
- `DELETE /api/bookmarks/:id` - Delete bookmark
- `POST /api/bookmarks/:id/archive` - Archive bookmark
- `POST /api/bookmarks/:id/unarchive` - Restore bookmark

### Collections

- `GET /api/collections` - List collections
- `POST /api/collections` - Create collection
- `GET /api/collections/:id` - Get collection
- `PUT /api/collections/:id` - Update collection
- `DELETE /api/collections/:id` - Delete collection
- `POST /api/collections/:id/share` - Share collection
- `POST /api/collections/:id/unshare` - Unshare collection

### Categories & Tags

- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `GET /api/tags` - List tags

### AI Features

- `POST /api/bookmarks/:id/ai/summary` - Generate AI summary
- `POST /api/bookmarks/:id/ai/tags` - Get AI tag suggestions
- `POST /api/bookmarks/:id/ai/category` - Get AI category suggestion

### Export

- `GET /api/export?format=json` - Export as JSON
- `GET /api/export?format=html` - Export as HTML (Netscape)
- `GET /api/export?format=csv` - Export as CSV

### Stats

- `GET /api/stats/overview` - Get overview statistics
- `GET /api/stats/growth` - Get growth statistics

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## License

MIT
