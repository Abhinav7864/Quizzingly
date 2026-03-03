### **Game Hosting Overview**

The page at `https://quizzingly-frontend.onrender.com/host/XRY2W4` serves as the **Live Host Engine**. It manages the real-time state of the game session identified by the code `XRY2W4`.

### **Host Lifecycle & Components**

The host interface transitions through four distinct views based on the game's progress:

#### **1. Game Lobby**

* **Purpose**: This is the initial state where the host waits for players to join.
* **Key Features**:
* **Join Code**: Displays the unique `XRY2W4` code in a large, bold format for players to see.
* **Player List**: A real-time grid that updates as players join the session.
* **Start Game Button**: The host can trigger the start of the game once at least one player has joined.



#### **2. Question View**

* **Purpose**: Displays the active question being answered by players.
* **Key Features**:
* **Live Status**: Shows an animated "Question Live" indicator.
* **Response Tracker**: Displays a progress bar and counter showing how many players have submitted answers (e.g., "3 / 5").
* **Question Content**: Shows the question text and all possible options (A, B, C, D).



#### **3. Leaderboard View**

* **Purpose**: Displays the current rankings between questions.
* **Key Features**:
* **Live Standings**: Ranks players by their current score, highlighted with a trophy icon for the leader.
* **Next Question**: A button for the host to manually progress the game to the next question.



#### **4. Game Over View**

* **Purpose**: Summarizes the final results of the session.
* **Key Features**:
* **Final Podium**: Lists the top 5 players and their final scores.
* **Actions**: The host can return to the **Dashboard** or choose to **Host Again** (which reloads the session).



### **Technical Integration**

* **Socket.IO**: The page uses a WebSocket connection to handle real-time events such as `onPlayerListUpdate`, `onNewQuestion`, and `onAnswerSubmitted`.
* **State Management**: It utilizes a `GameContext` (Zustand) to maintain the list of players and the current question state across the application.
* **Navigation Security**: If the socket connection fails or is not initialized, the host is automatically redirected back to the `/dashboard`.
