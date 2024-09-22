# Mental Health Chatbot

An AI-powered, empathetic virtual assistant designed to support users experiencing emotional distress. The chatbot provides a safe, non-judgmental space for users to express their feelings, leveraging natural language processing (NLP) and customizable conversation flows.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Conversation Flows](#conversation-flows)
  - [Defining Flows with YAML](#defining-flows-with-yaml)
  - [Matching Engines](#matching-engines)
  - [Branching and Flow Control](#branching-and-flow-control)

---

## Features

- **Customizable Flows**: Define conversation flows using YAML files.
- **Multiple Matching Engines**:
  - **Basic**: Simple keyword matching.
  - **NLP**: Enhanced matching using natural language processing.
  - **AI**: Advanced responses and classifications using OpenAI's GPT models.
- **Real-Time Communication**: Utilizes WebSockets for instant messaging.
- **User State Management**: Maintains conversation context for personalized interactions.
- **Error Handling**: Gracefully manages disconnections and reconnections.

---

## Tech Stack

- **Frontend**: Vue.js 3, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL (via Prisma ORM)
- **Real-Time Communication**: Socket.IO
- **AI Integration**: OpenAI API (GPT-3.5-Turbo)
- **Containerization**: Docker, Docker Compose
- **Deployment**: GitHub Actions CI/CD Pipeline, SSH to VPS
- **Other**: YAML for conversation flow definitions, Webpack/Vite for module bundling

---

## Getting Started

### Prerequisites

- **Node.js** v22.x
- **npm** v8.x
- **PostgreSQL** v14.x
- **Docker** (for containerization and deployment)
- **OpenAI API Key**

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/yourusername/mental-health-chatbot.git
   cd mental-health-chatbot
   ```

2. **Install backend dependencies**:

   ```bash
   cd backend
   yarn install
   ```

3. **Install frontend dependencies**:

   ```bash
   cd ../frontend
   yarn install
   ```

4. **Set up the database**:

   - Ensure PostgreSQL is running.
   - Create a database (e.g., `mydb`).

5. **Configure environment variables**:

   - Create a `.env` file in both `backend` and `frontend` directories.
   - See [Environment Variables](#environment-variables) for required variables.

6. **Run database migrations**:

   ```bash
   cd ../backend
   npx prisma migrate dev
   ```

7. **Start the development servers**:

   - **Backend**:

     ```bash
     yarn dev
     ```

   - **Frontend**:

     ```bash
     cd ../frontend
     yarn dev
     ```

8. **Access the application**:

   - Open your browser and navigate to `http://localhost:5173`

---

## Environment Variables

### Backend (`backend/.env`)

```dotenv
DATABASE_URL=postgresql://user:password@localhost:5432/mydb?schema=public
SESSION_SECRET=your-session-secret
COOKIE_SECRET=your-cookie-secret
OPENAI_API_KEY=your-openai-api-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://127.0.0.1:5173
```

- **`DATABASE_URL`**: Connection string for PostgreSQL.
- **`SESSION_SECRET`**: Secret key for session management.
- **`COOKIE_SECRET`**: Secret key for signing cookies.
- **`OPENAI_API_KEY`**: Your OpenAI API key for AI integration.
- **`GOOGLE_CLIENT_ID`**: Google Client ID for Google authentication.
- **`GOOGLE_CLIENT_SECRET`**: Google Client Secret for Google authentication.
- **`GOOGLE_CALLBACK_URL`**: URL to the backend callback for Google authentication.

### Frontend (`frontend/.env`)

```dotenv
VITE_APP_API_URL=http://localhost:3000
```

- **`VITE_APP_API_URL`**: Backend API URL.

---

## Conversation Flows

The chatbot uses YAML files to define conversation flows, allowing for easy customization and extension.

### Defining Flows with YAML

**Example Flow (`flows/feeling_flow.yaml`):**

```yaml
id: feeling_flow
trigger_keywords:
  - feel
  - feeling
steps:
  - id: start
    engine: basic
    bot: "How are you feeling today?"
    user_response_required: true
    branches:
      - condition:
          engine: basic
          expected_user_keywords:
            - good
            - great
            - fine
        next_step_id: positive_response
      - condition:
          engine: basic
          expected_user_keywords:
            - bad
            - sad
            - not good
        next_step_id: negative_response
      - condition:
          default: true
        next_step_id: neutral_response

  - id: positive_response
    engine: basic
    bot: "That's wonderful to hear! Keep up the positive vibes!"
    user_response_required: false

  - id: negative_response
    engine: ai
    ai_prompt: "Provide an empathetic response to someone feeling down."
    user_response_required: false

  - id: neutral_response
    engine: basic
    bot: "I see. Would you like to talk more about it?"
    user_response_required: true
    branches:
      - condition:
          engine: basic
          expected_user_keywords:
            - yes
            - sure
        next_step_id: ask_more
      - condition:
          default: true
        next_step_id: end_conversation

  - id: ask_more
    engine: ai
    ai_prompt: "Encourage the user to share more about their feelings."
    user_response_required: true
    next_step_id: end_conversation

  - id: end_conversation
    engine: basic
    bot: "Thank you for sharing with me. I'm here if you need anything else."
    user_response_required: false
```

### Matching Engines

- **Basic**: Simple keyword matching.
- **NLP**: Enhanced matching using natural language processing techniques.
- **AI**: Uses OpenAI's GPT models to generate responses and classify text based on prompts specified in the YAML files.

### Branching and Flow Control

- **Branches**: Define different paths based on user responses.
- **Conditions**: Specify the matching engine and criteria to determine the next step.
- **User State Management**: Keeps track of where the user is within a flow.