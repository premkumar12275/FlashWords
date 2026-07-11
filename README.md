# 🇳🇴 FlashWords (Norwegian Flashcards)

A modern, responsive web application for learning Norwegian Bokmål vocabulary. Built with React, TypeScript, and Tailwind CSS.

## ✨ Features
- **1000+ Curated Words**: Hand-curated dataset (nouns with correct genders, verbs, adjectives, phrases) with real example sentences.
- **User Accounts & Cloud Sync** (optional): Email + password login via Supabase — each user gets their own progress, synced across devices. Without Supabase configured the app runs in guest mode with local-only progress.
- **Spaced Repetition**: A Leitner-box Review mode schedules words at growing intervals; wrong answers come back until you get them right.
- **Progress That Sticks**: Your position, known words, Leitner boxes, and study settings persist across sessions.
- **Known-Word Tracking**: Mark words as known (button or `K` key) and optionally hide them while practicing.
- **Study Modes**:
  - Both directions: Norwegian → English and English → Norwegian.
  - Filter by category (only verbs, only phrases, …).
  - **Shuffle Mode** for randomized practice.
- **Go-To Navigation**: Jump to any card by word (Norwegian or English) or card number; arrow keys + Space keyboard controls.
- **Playful UI**: Category color-coded cards, 3D flip animations, gender chips, difficulty badges.
- **Data Generation**: Python script included to regenerate or expand vocabulary.

## 🛠️ Tech Stack
- **Frontend**: React 18, TypeScript 5, Vite 7
- **Auth & Sync**: Supabase (Auth + Postgres, optional)
- **Styling**: Tailwind CSS 3, Framer Motion
- **Icons**: Lucide React
- **Testing**: Vitest (data-integrity + logic tests — `npm test`)
- **Containerization**: Docker, Nginx

## 👤 Enabling Accounts (Supabase, ~5 minutes)
Accounts are optional — skip this and the app works in guest mode.

1. Create a free project at [supabase.com](https://supabase.com).
2. In the dashboard, open **SQL Editor → New query**, paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql), and run it.
3. (Recommended for personal use) **Authentication → Sign In / Up →
   disable "Confirm email"** so family members can sign up without a
   confirmation round-trip.
4. Copy `.env.example` to `.env` and fill in your **Project URL** and
   **anon public key** (Project Settings → API).
5. Restart `npm run dev`. You'll get a sign-in screen; each account keeps its
   own known words, Leitner boxes, and settings, synced to Supabase.

Any progress made as a guest in a browser is automatically adopted by the
first account that signs in there.

## 🚀 Getting Started

### Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/premkumar12275/FlashWords.git
   cd FlashWords
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

### Docker Support
This application is containerized and ready for deployment.

**Build and Run Locally:**
```bash
docker build -t flashcards-app .
docker run -p 8080:80 flashcards-app
```

## 📦 Deployment
The project includes a production-ready `Dockerfile` and `nginx.conf`, making it easy to deploy on platforms like **Render**, **Railway**, or **AWS App Runner**.

### Deploy to Render.com
1. Create a **New Web Service**.
2. Connect your GitHub repository.
3. Select **Docker** as the Runtime.
4. Deploy!

## 📝 Customizing Vocabulary
The flashcard data is stored in `public/flashcards.json`. You can modify it directly or regenerate it using the included Python script:

```bash
python scripts/generate_vocab.py
```

The script writes `public/flashcards.json` itself and keeps card ids stable across runs. Run `npm test` afterwards to validate the data.

## 📄 License
This project is open source.