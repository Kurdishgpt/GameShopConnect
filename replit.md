# Gaming Social Platform - Project Documentation

## Overview
Comprehensive gaming social platform with real-time messaging, player discovery, marketplace, Story Games, notifications, and role-based access control.

## Current Status - ORGANIZED FOR ONLINE DEPLOYMENT
✅ Server code reorganized into modular API routes  
✅ Online setup file created (server/online.ts)  
✅ Build and run scripts configured  
✅ Database connection established  
✅ Vercel configuration ready

## Project Structure

### Frontend (client/src)
- `pages/` - All page components (home, account, messages, stories, etc.)
- `components/` - Reusable UI components (sidebar, forms, cards, etc.)
- `lib/` - Utilities (auth, API requests, query client)
- `hooks/` - Custom React hooks

### Backend (server)
- `api/` - **NEW** Modular API route handlers
  - `auth.ts` - Authentication endpoints
  - `profile.ts` - Profile management
  - `shop.ts` - Shopping/marketplace
  - `messages.ts` - Messaging system
  - `stories.ts` - Video stories
  - `play-requests.ts` - Play requests
  - `notifications.ts` - Notifications
  - `middleware.ts` - Shared middleware
- `online.ts` - **NEW** Main online setup for serverless
- `index-online.ts` - **NEW** Production entry point
- `routes.ts` - Original combined routes (kept for Replit)
- `storage.ts` - Database operations layer
- `auth.ts` - Authentication middleware
- `db.ts` - Database connection

## Deployment Configuration

### Local Development (Replit)
```bash
npm run dev  # Uses server/index-dev.ts
```

### Online Deployment (Vercel)
```bash
npm run build
npm run start
```

### Build Configuration (vercel.json)
- Uses `npm run build` for building
- Environment variables: DATABASE_URL, SESSION_SECRET
- Frontend rewrites for SPA routing

## Database
- PostgreSQL (Replit or Neon for online)
- Drizzle ORM for type-safe queries
- Auto-normalizes gaming platform values (lowercase)

## API Endpoints

### Auth
- POST `/api/auth/signup` - User registration
- POST `/api/auth/login` - User login
- GET `/api/auth/user` - Get current user
- GET `/api/logout` - Logout

### Profile
- PATCH `/api/profile` - Update profile
- PATCH `/api/profile/role` - Change role

### Shop
- GET `/api/shop-items` - Get all items
- POST `/api/shop-items` - Create item
- DELETE `/api/shop-items/:id` - Delete item
- POST `/api/shop-requests` - Make purchase request
- GET `/api/shop-requests` - Get user requests

### Messages
- GET `/api/conversations` - Get message conversations
- GET `/api/messages/:otherUserId` - Get messages with user
- POST `/api/messages` - Send message
- DELETE `/api/messages/:id` - Delete message

### Stories
- GET `/api/stories` - Get all stories
- GET `/api/stories/:id` - Get specific story
- POST `/api/stories` - Create story
- DELETE `/api/stories/:id` - Delete story
- POST `/api/stories/:id/like` - Like story

### Play Requests
- POST `/api/play-requests` - Create play request
- GET `/api/play-requests` - Get user's play requests
- PATCH `/api/play-requests/:id` - Update request status

### Notifications
- GET `/api/notifications` - Get user notifications
- POST `/api/notifications/:id/read` - Mark as read
- DELETE `/api/notifications/:id` - Delete notification

## Features
- **Authentication**: Local + Google OAuth
- **Real-time**: WebSocket typing indicators, 30-second heartbeat
- **Roles**: Owner, Admin, Media, Developer, Player, Seller
- **Marketplace**: Multi-currency (USD, IQD), shopping requests
- **Messaging**: Snapchat-style, typing indicators, read status
- **Stories**: Video upload (5GB limit), likes
- **Player Discovery**: Browse and connect with gamers
- **Notifications**: Activity updates
- **Account Management**: Profile editing, role selection
- **Data Centre**: Developer-only user management

## Security
- Password hashing with bcryptjs
- Session-based authentication
- Role-based access control
- Protected API endpoints

## User Preferences
- Gaming platform enum values normalized to lowercase
- 30-second heartbeat for online status
- Session TTL: 7 days

## Next Steps for Vercel Deployment
1. Deploy to Vercel with environment variables
2. Connect PostgreSQL database (Neon or external)
3. Test all API endpoints
4. Monitor performance and errors
