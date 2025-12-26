# 🇳🇴 FlashWords (Norwegian Flashcards)

A modern, responsive web application for learning Norwegian Bokmål vocabulary. Built with React, TypeScript, and Tailwind CSS.

## ✨ Features
- **1000+ Words**: Comprehensive dataset covering nouns, verbs, adjectives, and phrases.
- **Interactive UI**: Smooth 3D flip animations and glassmorphism design.
- **Study Modes**: 
  - Standard navigation to learn sequentially.
  - **Shuffle Mode** for randomizing practice.
- **Mobile First**: Fully responsive design for learning on the go.
- **Data Generation**: Python scripts included to regenerate or expand vocabulary.

## 🛠️ Tech Stack
- **Frontend**: React 17, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion
- **Icons**: Lucide React
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
python3 scripts/generate_vocab.py > public/flashcards.json
```

## 📄 License
This project is open source.