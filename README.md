# Quizzingly - Live AI Quiz Platform

Quizzingly is a real-time, interactive web application designed for live multiplayer quizzes with AI-assisted content creation. The system allows creators to generate quizzes from text or PDFs and host live sessions where players compete in real-time.

---

## 🚀 Core Modules

### 1. Creator Hub
* **AI Quiz Generation**: Effortlessly generate quiz content from PDFs or raw text using integrated AI endpoints.
* **Manual Review & Editor**: A dedicated UI allows hosts to review, edit, and refine AI-generated questions before persisting them to the database.

### 2. Live Host Engine
The Host Engine serves as the live control center for a game session, managing the real-time state via a unique join code. The interface transitions through a four-stage lifecycle:

* **Game Lobby**: The initial state where the host displays the join code and monitors the real-time player list as participants join.
* **Question View**: Displays the active question, all possible options, and a "Response Tracker" that shows how many players have submitted their answers.
* **Leaderboard View**: Shows live standings between questions, ranking players by their current score and highlighting the leader with a trophy icon.
* **Game Over View**: Summarizes the final results with a podium for the top 5 players and provides options to host again or return to the dashboard.

### 3. Player Controller
* **Mobile-First Design**: A responsive interface optimized for players to join rooms, view questions, and submit answers on any device.
* **Speed-Based Scoring**: Points are calculated based on both accuracy and the speed of the response.

---

## 🛠️ Technical Stack & Integration

### Frontend
* **Framework**: Next.js 16.1.6 and React 19.2.3.
* **Styling**: Tailwind CSS for responsive design and Framer Motion for smooth UI transitions.
* **State Management**: Utilizes a **GameContext (Zustand)** to maintain the live player list and current question state across the application.

### Backend
* **Environment**: Node.js with Express 5.2.1.
* **Real-Time Communication**: Built with **Socket.IO** to handle critical live events like `onPlayerListUpdate`, `onNewQuestion`, and `onAnswerSubmitted`.
* **Database**: PostgreSQL managed via **Prisma ORM**.
* **AI Integration**: Powered by the Gemini API and Groq SDK for content generation.
* **Authentication**: Secure user access via JWT and Bcrypt.

---

## 📊 Database Schema

The platform uses a relational PostgreSQL schema to manage complex game states:
* **User**: Stores creator profiles and links to their quizzes and game results.
* **Quiz & Question**: Manages the quiz structure, including time limits and multiple-choice options.
* **Game**: Tracks active session status (lobby, active, finished), join codes, and timing.
* **Player**: Manages individual participant sessions, scores, and real-time socket connections.
* **PlayerGameResult**: Persists final session data, including player ranks and accuracy metrics.

---

## 💻 Installation & Setup

1.  **Clone the repository.**
2.  **Backend Configuration**:
    * Install dependencies: `npm install`.
    * Set up your `.env` file with `DATABASE_URL`, `JWT_SECRET`, and AI API keys.
    * Generate the Prisma client: `npx prisma generate`.
3.  **Frontend Configuration**:
    * Navigate to `/frontend` and install dependencies: `npm install`.
4.  **Running the Application**:
    * Start the backend: `npm run dev`.
    * Start the frontend: `npm run dev`.

## 🌐 Deployment
* **Frontend**: Hosted on Vercel.
* **Backend & Sockets**: Deployed on Render or Railway to support persistent WebSocket connections.
* **Database**: Managed through Supabase or MongoDB Atlas.
