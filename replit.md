# Gaming Community Platform

## Overview

This is a full-stack gaming community platform built with React, Express, and PostgreSQL. The application connects gamers through player discovery, shopping for gaming gear, messaging, and video story sharing. It features role-based access control (owner, admin, media, developer, player) and supports multiple gaming platforms (PlayStation, Xbox, PC, Switch, Mobile).

The platform emphasizes a vibrant, gaming-first design with dark mode aesthetics, colorful accents inspired by candy ball imagery, and a mobile-responsive interface optimized for extended gaming sessions.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Features Added

**Role Management System (Latest)**
- Role selection buttons in sidebar with password protection (password: `client_look`)
- Owners can manage and assign roles to other players via "Manage Players" page
- Owner-only sidebar menu with "Manage Players" link
- Test player account created: `testplayer` / `test123`
- Backend endpoint `/api/admin/assign-role` for owner role assignment

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**UI Component Library**: Radix UI primitives with shadcn/ui styling system
- Comprehensive component library including dialogs, dropdowns, forms, cards, and navigation elements
- Tailwind CSS for styling with custom design tokens
- CSS variables for theming with light/dark mode support

**State Management**: 
- TanStack Query (React Query) for server state management and data fetching
- React Hook Form with Zod validation for form handling
- wouter for lightweight client-side routing

**Design System**:
- Typography: Inter (body), Montserrat (headings)
- Color scheme: Dark base with vibrant accent colors (primary: purple/magenta, charts with distinct colors)
- Spacing system: Tailwind spacing units (2, 4, 6, 8, 12, 16, 20, 24)
- Layout: Responsive sidebar navigation (16rem desktop, collapsible mobile)
- Grid patterns: Responsive breakpoints for player cards, shopping items, and stories

### Backend Architecture

**Framework**: Express.js with TypeScript (ESM modules)

**API Design**: RESTful endpoints organized by feature domain
- `/api/auth/*` - Authentication and user session management
- `/api/profile` - User profile updates
- `/api/players` - Player discovery and listing
- `/api/shop/*` - Shopping items and requests
- `/api/play-requests/*` - Game session requests between players
- `/api/messages/*` - Direct messaging and conversations
- `/api/stories` - Video story sharing

**Authentication**: Replit Auth (OpenID Connect)
- Passport.js strategy for OIDC integration
- Session-based authentication with PostgreSQL session store (connect-pg-simple)
- Protected routes using `isAuthenticated` middleware
- Session TTL: 7 days with secure, httpOnly cookies

**Data Layer**: 
- Drizzle ORM for type-safe database operations
- Schema-driven development with Zod validation
- Database operations abstracted through storage interface pattern

**Development/Production Split**:
- Development: Vite dev server with HMR middleware integration
- Production: Static file serving from pre-built dist directory
- Environment-specific entry points (index-dev.ts, index-prod.ts)

### Data Storage

**Database**: PostgreSQL (via Neon serverless)
- WebSocket-based connection pooling for serverless compatibility
- Connection string configured via `DATABASE_URL` environment variable

**Schema Design**:

1. **Users Table**: Core user profiles with gaming-specific fields
   - Standard auth fields (id, email, name, profile image)
   - Gaming fields (username, age, selectedPlatform, bio, favoriteGames)
   - Role-based access (userRole enum: owner, admin, media, developer, player)
   - Online status tracking (isOnline boolean)

2. **Sessions Table**: Server-side session storage
   - Required for Replit Auth integration
   - Automatic expiration handling

3. **Shop Items Table**: Gaming gear and products
   - Product details (name, description, price, image)
   - Category and availability tracking

4. **Shop Requests Table**: Purchase/inquiry requests
   - Links users to shop items
   - Includes custom messages
   - Status tracking (pending, accepted, rejected)

5. **Play Requests Table**: Gaming session invitations
   - From/to user relationships
   - Game specification and custom messages
   - Status workflow (pending → accepted/rejected)

6. **Messages Table**: Direct messaging between users
   - Bidirectional user relationships
   - Message content and read status
   - Timestamp tracking

7. **Video Stories Table**: Shareable gaming moments
   - User-generated content with title, description
   - Video URL and thumbnail URL
   - Like counter for engagement

**Data Relationships**:
- One-to-many: User → ShopRequests, PlayRequests, Messages, VideoStories
- Many-to-many implied: Users ↔ Messages (conversation threads)
- Enum constraints: userRole, platform, requestStatus

### External Dependencies

**Authentication Service**: Replit Auth (OpenID Connect)
- Discovery URL: `https://replit.com/oidc` (configurable via ISSUER_URL)
- Requires REPL_ID for client identification
- Token management: access_token, refresh_token with automatic refresh

**Database Provider**: Neon (Serverless PostgreSQL)
- WebSocket-based connection via @neondatabase/serverless
- Requires DATABASE_URL environment variable
- Connection pooling for optimal performance

**Session Storage**: PostgreSQL-backed sessions
- Uses connect-pg-simple for Express session store
- Persists to main database (sessions table)
- Automatic cleanup of expired sessions

**Asset Management**: 
- Static assets served from attached_assets directory
- Vite alias configuration for @assets imports
- Google Fonts: Inter, Montserrat, Architects Daughter, DM Sans, Fira Code, Geist Mono

**Development Tools**:
- Replit-specific plugins: cartographer, dev-banner, runtime-error-modal
- Hot Module Replacement (HMR) via Vite
- TypeScript strict mode for type safety

**Environment Variables Required**:
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `ISSUER_URL`: OIDC provider URL (defaults to Replit)
- `REPL_ID`: Replit application identifier
- `NODE_ENV`: development/production flag