# 🇳🇴 FlashWords (Norwegian Flashcards)

A modern, responsive web application for learning Norwegian Bokmål vocabulary. Built with React, TypeScript, and Tailwind CSS.

## ✨ Features
- **1000+ Curated Words**: Hand-curated dataset (nouns with correct genders, verbs, adjectives, phrases) with real example sentences.
- **Progress That Sticks**: Your position, known words, and study settings persist across sessions (localStorage).
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
- **Styling**: Tailwind CSS 3, Framer Motion
- **Icons**: Lucide React
- **Testing**: Vitest (data-integrity smoke tests — `npm test`)
- **Containerization**: Docker, Nginx

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