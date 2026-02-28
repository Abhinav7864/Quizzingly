# Frontend-Backend Integration Guide

## Overview
This guide documents the complete integration between the Next.js frontend and Express.js backend for the AI Quiz Platform.

## Architecture
- **Backend**: Express.js server on port 4002 with Socket.IO for real-time features
- **Frontend**: Next.js app on port 3000 with API proxy and Socket.IO client
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for game state and session management

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /protected` - Protected route (requires auth)

### Quizzes
- `GET /quizzes` - Get user's quizzes (requires auth)
- `POST /quizzes` - Create new quiz (requires auth)
- `POST /quizzes/generate-ai` - Generate quiz using AI (requires auth, PDF file, and prompt)
- `GET /quizzes/:id` - Get quiz by ID (requires auth)
- `PUT /quizzes/:id` - Update quiz (requires auth)
- `DELETE /quizzes/:id` - Delete quiz (requires auth)

### Questions
- `GET /questions` - Get questions (various endpoints)

### Players
- `POST /player/join` - Join a game
- `POST /player/:gameCode/answer` - Submit answer

## Socket.IO Events

### Host Events
**Emit:**
- `host:create_game` - Create a new game
- `host:start_game` - Start the game
- `host:next_question` - Move to next question

**Listen:**
- `server:game_created` - Game created successfully
- `server:game_started` - Game started
- `server:question` - New question data
- `server:player_joined` - Player joined game
- `server:leaderboard_update` - Updated leaderboard
- `server:game_ended` - Game finished

### Player Events
**Emit:**
- `player:join_game` - Join a game
- `player:submit_answer` - Submit answer

**Listen:**
- `server:game_joined` - Successfully joined
- `server:answer_result` - Answer result
- `server:leaderboard_update` - Updated leaderboard
- `server:question` - New question
- `server:game_ended` - Game finished

## Frontend Configuration

### API Proxy (next.config.ts)
```typescript
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/api/auth/:path*", destination: "http://localhost:4002/auth/:path*" },
      { source: "/api/quizzes/:path*", destination: "http://localhost:4002/quizzes/:path*" },
      { source: "/api/questions/:path*", destination: "http://localhost:4002/questions/:path*" },
      { source: "/api/player/:path*", destination: "http://localhost:4002/player/:path*" },
    ];
  },
};
```

### Socket.IO Connection
```typescript
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4002';
const socket = io(SOCKET_URL, {
  path: '/socket.io',
  addTrailingSlash: false,
});
```

## Usage Examples

### Authentication
```typescript
import { useAuth } from '@/contexts/AuthContext';

const { login, register, isAuthenticated } = useAuth();

// Login
await login('user@example.com', 'password');

// Register
await register('username', 'user@example.com', 'password');
```

### API Calls
```typescript
import { quizApi } from '@/utils/quizApi';

// Get quizzes
const quizzes = await quizApi.getMyQuizzes();

// Create quiz
const newQuiz = await quizApi.createQuiz({
  title: 'My Quiz',
  questions: [...]
});
```

### Socket.IO Usage
```typescript
import { useGameSocket } from '@/hooks/useGameSocket';

const { createGame, joinGame, isConnected } = useGameSocket({
  onGameCreated: (data) => console.log('Game created:', data.gameCode),
  onGameJoined: (data) => console.log('Joined game:', data.gameCode),
});

// Create game
createGame('quiz-id');

// Join game
joinGame('GAME123', 'PlayerName');
```

## Environment Setup

### Backend (.env)
```
NODE_ENV=development
PORT=4002
DATABASE_URL="postgresql://username:password@localhost:5432/quiz_db"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-jwt-secret"
CORS_ORIGINS="http://localhost:3000"
GEMINI_API_KEY="your-gemini-api-key"
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL="http://localhost:4002"
NEXT_PUBLIC_SOCKET_URL="http://localhost:4002"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Development Workflow

1. **Start Backend**: `npm run dev` (from root directory)
2. **Start Frontend**: `npm run dev` (from Frontend directory)
3. **Database Setup**: Run Prisma migrations
4. **Redis**: Ensure Redis server is running

## Testing

### API Testing
```bash
# Register user
curl -X POST http://localhost:4002/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:4002/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Socket.IO Testing
Open `test-socket.html` in browser to test Socket.IO connection.

## Key Files

### Backend
- `src/index.js` - Server entry point
- `src/app.js` - Express app configuration
- `src/socket/` - Socket.IO handlers
- `src/routes/` - API routes
- `src/controllers/` - Route controllers

### Frontend
- `src/contexts/AuthContext.tsx` - Authentication state
- `src/contexts/SocketContext.tsx` - Socket.IO connection
- `src/utils/api.ts` - API utility functions
- `src/hooks/useGameSocket.ts` - Socket.IO game hook
- `next.config.ts` - Next.js configuration

## Troubleshooting

### Common Issues
1. **CORS Errors**: Check backend CORS configuration
2. **Socket Connection**: Verify ports match (4002)
3. **API 404s**: Check Next.js proxy configuration
4. **Auth Failures**: Verify JWT token handling

### Debug Tips
- Check browser Network tab for API calls
- Use browser console for Socket.IO logs
- Check backend console for request logs
- Verify Redis connection for game state