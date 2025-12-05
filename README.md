# CodeReadyAI

An AI-powered interview preparation and job application platform that helps candidates practice technical interviews, get personalized resume feedback, and ace their job search.

## ✨ Features

- **📝 Job Application Tracking** - Organize and manage your job applications in one place
- **🤖 AI-Powered Question Generation** - Generate technical interview questions tailored to your target job with difficulty levels (Easy, Medium, Hard)
- **💬 Interactive Practice** - Answer questions and receive instant AI feedback on your responses
- **🎙️ Voice Mock Interviews** - Conduct realistic voice-based mock interviews with AI using Hume AI's empathic voice technology
- **📄 Resume Analysis** - Get comprehensive AI-powered feedback on your resume with ATS optimization, job match scoring, and keyword analysis
- **🎯 Personalized Feedback** - Receive detailed feedback on writing quality, formatting, and alignment with job requirements

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** (App Router with Turbopack)
- **React 19** with React Compiler
- **TypeScript**
- **Tailwind CSS 4**
- **Shadcn UI** components
- **next-themes** for dark/light mode

### Backend & APIs
- **Next.js API Routes**
- **Vercel AI SDK 5.0** for streaming AI responses
- **Google Gemini 2.5 Flash** for text generation and analysis
- **Hume AI** for empathic voice interactions
- **Clerk** for authentication and user management

### Database & ORM
- **PostgreSQL** database
- **Drizzle ORM** for type-safe database queries
- Automatic schema migrations

### Security & Rate Limiting
- **Arcjet** for bot detection, rate limiting, and security
- Server-side validation with **Zod**

### Developer Tools
- **ESLint** for code linting
- **Drizzle Kit** for database management
- **pnpm** for package management

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.x or higher
- **pnpm** 8.x or higher
- **Neon Database** account (free tier available at [neon.tech](https://neon.tech))
- **Git**

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/codereadyai.git
cd codereadyai
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Neon Database
DATABASE_URL=postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/app
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/onboarding

# AI Services
GEMINI_API_KEY=your_gemini_api_key
HUME_API_KEY=your_hume_api_key
HUME_SECRET_KEY=your_hume_secret_key
NEXT_PUBLIC_HUME_CONFIG_ID=your_hume_config_id

# Security
ARCJET_KEY=your_arcjet_key
```

### 4. Set Up Neon Database

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy your connection string from the Neon dashboard
4. Add it to your `.env` file as `DATABASE_URL`

### 5. Push Database Schema

```bash
pnpm db:push
```

This will apply your Drizzle schema to your Neon database.

### 6. Start the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
codereadyai/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── ai/           # AI-powered endpoints
│   │   │   └── webhooks/     # Clerk webhooks
│   │   ├── app/              # Protected application pages
│   │   ├── onboarding/       # New user onboarding
│   │   └── page.tsx          # Landing page
│   ├── components/            # Reusable UI components
│   │   └── ui/               # Shadcn UI components
│   ├── data/                  # Data layer
│   │   └── env/              # Environment variable schemas
│   ├── drizzle/              # Database layer
│   │   ├── schema/           # Database schemas
│   │   └── db.ts             # Database connection
│   ├── features/             # Feature-based modules
│   │   ├── interviews/       # Voice interview feature
│   │   ├── jobInfos/         # Job application tracking
│   │   ├── questions/        # Practice questions feature
│   │   ├── resumeAnalyses/   # Resume analysis feature
│   │   └── users/            # User management
│   ├── lib/                  # Utility functions
│   ├── services/             # External service integrations
│   │   ├── ai/              # AI service configurations
│   │   ├── clerk/           # Clerk authentication
│   │   └── hume/            # Hume AI voice integration
│   └── proxy.ts             # Next.js middleware (Clerk + Arcjet)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── drizzle.config.ts
```

## 🔑 Key Features Explained

### AI Question Generation

Generate technical interview questions tailored to your job description with three difficulty levels:
- Uses Google Gemini 2.5 Flash
- Streams responses in real-time using AI SDK 5.0
- Maintains conversation history for contextual follow-ups

### Voice Mock Interviews

Conduct realistic voice-based interviews with AI:
- Powered by Hume AI's empathic voice technology
- Real-time conversation with emotional understanding
- Automatic transcription and analysis
- Detailed feedback on your performance

### Resume Analysis

Get comprehensive feedback on your resume:
- **ATS Compatibility** - Check layout, formatting, and keyword optimization
- **Job Match Score** - Analyze alignment with job requirements
- **Writing & Formatting** - Review clarity, grammar, and structure
- **Keyword Coverage** - Identify missing or well-used terms
- Generates structured feedback with actionable recommendations

### Security Features

- **Rate Limiting** - Prevents abuse with Arcjet's sliding window algorithm
- **Bot Detection** - Blocks malicious bots while allowing search engines
- **Authentication** - Secure user authentication with Clerk
- **Input Validation** - All inputs validated with Zod schemas

## 🗄️ Database Management

### View Database Schema

```bash
pnpm db:studio
```

This opens Drizzle Studio at `http://localhost:4983` for visual database management.

### Generate Migrations

```bash
pnpm db:generate
```

### Apply Migrations

```bash
pnpm db:migrate
```

## 🧪 Available Scripts

```bash
pnpm dev        # Start development server
pnpm build      # Build for production
pnpm start      # Start production server
pnpm lint       # Run ESLint
pnpm db:push    # Push schema to database
pnpm db:generate # Generate migrations
pnpm db:migrate  # Run migrations
pnpm db:studio   # Open Drizzle Studio
```

## 🔐 Setting Up External Services

### Clerk (Authentication)

1. Sign up at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy your publishable and secret keys
4. Set up webhooks at `/api/webhooks/clerk` for user sync

### Google AI (Gemini)

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add to your `.env` as `GEMINI_API_KEY`

### Hume AI (Voice Interviews)

1. Sign up at [hume.ai](https://www.hume.ai)
2. Create a voice configuration
3. Get your API key, secret key, and config ID

### Arcjet (Security)

1. Sign up at [arcjet.com](https://arcjet.com)
2. Create a site
3. Copy your site key to `ARCJET_KEY`

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository to [Vercel](https://vercel.com)
3. Add all environment variables
4. Deploy!

### Database Hosting

For production, consider:
- **Vercel Postgres**
- **Supabase**
- **Neon**
- **Railway**

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Vercel](https://vercel.com) for Next.js and AI SDK
- [Clerk](https://clerk.com) for authentication
- [Hume AI](https://hume.ai) for empathic voice technology
- [Google](https://ai.google.dev) for Gemini AI
- [Arcjet](https://arcjet.com) for security infrastructure

---

Built with ❤️ by Elena Shatalova using Next.js and AI