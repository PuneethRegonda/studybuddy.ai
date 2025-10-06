# 📚 StudyBuddy.AI — Your Adaptive AI-Powered Study Companion

![Next.js](https://img.shields.io/badge/Next.js-13+-black?logo=nextdotjs)
![Flask](https://img.shields.io/badge/Flask-2.3+-lightgrey?logo=flask)
![Python](https://img.shields.io/badge/Python-3.10-blue?logo=python)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0+-06B6D4?logo=tailwindcss)
![License](https://img.shields.io/badge/license-MIT-green)

> A real-time, focus-aware learning platform that adapts to your attention using AI, computer vision, and adaptive UX design.

---

## 🌟 Inspiration
Traditional study tools are one-size-fits-all — you read text, flip flashcards, and hope your attention doesn’t fade.  
We built a **study companion** that adapts to *you* in real time — summarizing content, tracking attention, and seamlessly switching between learning modes like quizzes, flashcards, mind maps, or audio narration when needed.

---

## 🧠 What It Does

### 📄 Upload & Summarize
Drop in a PDF or document — the backend uses **Google Gemini API** to generate a clean, Markdown-formatted summary.

### 🎯 Real-Time Focus Tracking
Your webcam stream is processed locally via **MediaPipe FaceMesh** to calculate **Eye Aspect Ratio (EAR)** and output a normalized **focus score (0–100)** in real time, streamed via **Flask-SocketIO**.

### ⚡ Adaptive Learning Modes
When focus changes, the app dynamically shifts to keep engagement high:
- 🧩 **Flashcards** for quick recall  
- 🧠 **Quizzes** to test comprehension  
- 🕸️ **Mind-Maps** for visual learning  
- 🎮 **Mini-Games** for micro-engagement  
- 🔊 **Audio Narration** using browser TTS  
- 🕒 **Break Reminders** when fatigue is detected  

---

## 🏗️ How We Built It

**Frontend**
- ⚛️ Next.js + React  
- 🎨 Tailwind CSS  
- ⚡ Socket.IO-client  
- 🗣️ Web Speech API (browser-based TTS)

**Backend**
- 🧩 Flask + Flask-SocketIO  
- 👁️ MediaPipe FaceMesh  
- 🤖 Google Gemini API for summarization & quiz generation  
- 🔉 Google Cloud Text-to-Speech (optional backend route)

**Infra & Tools**
- 🐍 Python 3.10  
- 🧰 Git, dotenv  
- 💻 Works on macOS, Windows, and Linux

---

## 🧩 Challenges We Faced

- 🔐 **Privacy-Preserving Focus Tracking** – All webcam data is processed locally; no cloud uploads.  
- ⚙️ **Cross-Platform Compatibility** – Managed MediaPipe/OpenCV issues across Intel and Apple Silicon.  
- 👁️ **Robust Focus Detection** – Tuned EAR thresholds for varying lighting, face angles, and distances.  
- 🔄 **Real-Time Integration** – Aligned Flask, Eventlet, and Socket.IO for smooth streaming without frame drops.  
- 🧠 **Adaptive UX Logic** – Balanced how and when to prompt learning mode switches.

---

## 🏆 Accomplishments

✅ Reliable Focus Detection Pipeline  
✅ Real-Time Flask-SocketIO Integration  
✅ Modular Flashcards, Quizzes & Mind-Maps  
✅ Audio Narration via Web Speech API  
✅ Intuitive Next.js/Tailwind UI  
✅ Cross-Platform Setup (venv or Docker)

---

## 💡 What We Learned

- Precise dependency management for computer-vision systems.  
- Socket.IO event-driven architecture mastery.  
- Prompt engineering for clean, consistent AI outputs.  
- Browser APIs can drastically simplify pipelines.  
- Adaptive UX must balance intervention timing and tone.

---

## 🔮 What’s Next

- 📊 **Analytics Dashboard** for long-term focus and spaced-repetition trends  
- 👥 **Collaborative Study Rooms** with shared focus metrics  
- 📱 **Offline PWA / Mobile App**  
- 😌 **Emotion & Posture Detection** for richer engagement  
- 🎓 **Personalized Learning Paths** powered by ML

---

## 🧰 Built With

| Category | Technologies |
|-----------|---------------|
| Frontend | Next.js, React, Tailwind CSS, Web Speech API |
| Backend | Flask, Flask-SocketIO, MediaPipe FaceMesh |
| AI & APIs | Google Gemini, Google Cloud TTS |
| Infra | Python 3.10, Git, dotenv |

---

## ⚙️ Getting Started

### 🧩 Prerequisites
Install:
- [Node.js](https://nodejs.org/) (v18+)
- [Python 3.10](https://www.python.org/downloads/)
- `pip` and `virtualenv`

---

### 💻 Frontend Setup (Next.js)

Clone and install dependencies:
```bash
git clone https://github.com/<your-username>/StudyBuddyAI.git
cd StudyBuddyAI
npm install
```

Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open:
- http://localhost:3000

Edit the landing page by modifying `app/page.tsx`. The page auto-updates as you edit.  
> This project uses **next/font** to automatically optimize and load **Geist**, a new Vercel font family.

---

### 🐍 Backend Setup (Flask)

Create and activate a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Run the Flask server:
```bash
python app.py
```

The backend runs at: `http://127.0.0.1:5000` and streams focus data via Socket.IO.

---

### 🔧 Environment Variables

Create a `.env` in the project root:
```
GEMINI_API_KEY=your_google_gemini_api_key
GOOGLE_APPLICATION_CREDENTIALS=path_to_tts_credentials.json
```

---

## 💬 Authors
**Team StudyBuddy.AI** — Built with ❤️ in San Jose, CA.

---

## 🪪 License
This project is licensed under the **MIT License** — see the `LICENSE` file for details.

