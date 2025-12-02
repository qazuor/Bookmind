# Contributing to BookMind

Thank you for your interest in contributing to BookMind! This document provides guidelines and steps for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions. We aim to maintain a welcoming environment for everyone.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/bookmind.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Run tests: `pnpm test`
6. Commit your changes: `git commit -m "feat: add your feature"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Open a Pull Request

## Development Setup

See [README.md](README.md) for detailed setup instructions.

```bash
pnpm install
cp .env.example .env.local
# Configure your .env.local
pnpm dev
```

## Coding Standards

### TypeScript

- Use strict TypeScript - no `any` types
- Use `unknown` with type guards when type is uncertain
- Export named functions and types (no default exports)
- Use Zod schemas for runtime validation
- Infer types from Zod schemas: `type MyType = z.infer<typeof mySchema>`

### React

- Use functional components with hooks
- Use TanStack Query for data fetching
- Use Zustand for global state
- Follow the component structure in `src/components/`

### Styling

- Use Tailwind CSS utility classes
- Use Shadcn/ui components when available
- Follow mobile-first responsive design
- Use CSS custom properties for theming

### Testing

- Write tests for all new features
- Maintain 90%+ code coverage
- Use Vitest for unit/integration tests
- Use Playwright for E2E tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Run specific test file
pnpm test src/lib/utils/url.test.ts
```

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(bookmarks): add bulk delete functionality
fix(auth): resolve session persistence issue
docs(readme): update installation instructions
test(api): add integration tests for categories
```

## Pull Request Process

1. Ensure your code follows the coding standards
2. Update documentation if needed
3. Add tests for new functionality
4. Ensure all tests pass: `pnpm test`
5. Ensure no type errors: `pnpm typecheck`
6. Ensure code is formatted: `pnpm check`
7. Request review from maintainers

### PR Title Format

Use the same format as commit messages:

```
feat(bookmarks): add bulk delete functionality
```

## Project Structure

```
src/
├── api/           # API routes (Vercel serverless)
├── components/    # React components
│   ├── ui/        # Shadcn/ui base components
│   ├── auth/      # Authentication components
│   ├── bookmarks/ # Bookmark-related components
│   └── shared/    # Shared/utility components
├── hooks/         # Custom React hooks
├── lib/           # Utilities
│   ├── db/        # Database (Drizzle)
│   ├── ai/        # AI integration (Groq)
│   └── utils/     # Helper functions
├── pages/         # Page components
├── schemas/       # Zod validation schemas
└── stores/        # Zustand stores
```

## Adding New Features

1. Create schemas in `src/schemas/`
2. Add database schema in `src/lib/db/schema.ts` if needed
3. Create service functions in `src/lib/services/`
4. Add API routes in `src/api/`
5. Create React components in `src/components/`
6. Add pages in `src/pages/`
7. Write tests in `tests/`

## Reporting Issues

When reporting issues, please include:

- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser/OS information
- Screenshots if applicable

## Questions?

Feel free to open an issue for questions or discussions.
