# YoLearn.ai - AI-Powered Learning Platform

Your personal AI tutor with voice interaction, gamification, and rich media support!

## 🏗️ Project Structure

yolearn-ai/
├── backend/ # Node.js/Express API
└── frontend/ # HTML/CSS/JS Client

text

## ⚡ Quick Start

### Backend Setup

1. Navigate to backend folder:
cd backend

text

2. Install dependencies:
npm install

text

3. Create `.env` file and add your Gemini API key:
GEMINI_API_KEY=your_key_here
PORT=5000

text

4. Start server:
npm start

text

Server will run on http://localhost:5000

### Frontend Setup

1. Navigate to frontend folder:
cd frontend

text

2. Open with Live Server (VS Code extension) or any static server

3. Open http://localhost:5500 (or your server port)

## 🎯 Features

✅ Real-time AI tutoring with Gemini API
✅ Voice recognition & speech synthesis
✅ Animated 3D-style avatar
✅ Gamification (points, levels, achievements)
✅ YouTube video embedding
✅ Code syntax highlighting
✅ Rich message formatting
✅ Multiple tutor personalities

## 🔧 Configuration

Edit `frontend/assets/js/api.js` to change backend URL:
const API_CONFIG = {
BASE_URL: 'http://localhost:5000/api'
};

text

## 📝 License

MIT
🎉 You're All Set!
Now you have a professional, modular, production-ready structure!

To Run:
Backend:

bash
cd backend
npm install
# Add your API key to .env
npm start
Frontend:

bash
cd frontend
# Open with Live Server or any static server
This separation makes it much easier to:

