<div align="center">

# 🎓 YoLearn.ai - AI-Powered Interactive Tutoring Platform

### *The Future of Personalized Education with 3D Avatar Technology*

🚀 [Live Demo](https://ai-tutor-platform-lime.vercel.app) | 📹 [Watch Demo](https://drive.google.com/file/d/1V23_WMqq_aOOVyFKcvr_La-mz2LTsual/view?usp=drive_link) | 📖 [View Documentation](https://docs.google.com/presentation/d/1E6upFTihTMPBInp__Kyj6AOPpAJpGmfC/edit?usp=drive_link&ouid=100286719899966317244&rtpof=true&sd=true)

[![Made with Love](https://img.shields.io/badge/Made%20with-❤️-red.svg)](https://github.com/yourusername/yolearn-ai)
[![Node.js](https://img.shields.io/badge/Node.js-18+-43853D.svg?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-4.18+-000000.svg?logo=express&logoColor=white)](https://expressjs.com/)
[![Three.js](https://img.shields.io/badge/Three.js-r128-black.svg?logo=three.js&logoColor=white)](https://threejs.org/)
[![Gemini AI](https://img.shields.io/badge/Google%20Gemini-2.0-4285F4.svg?logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

![YoLearn.ai Banner](https://drive.google.com/uc?export=view&id=1joY7GJWB-5a3Li6-47uSA1HyClKBlkn5)

</div>

---

## 🌟 The Problem We're Solving

In today's education system:
- 📚 **1.2 billion students** struggle with access to quality tutoring
- 💰 Private tutoring costs **$40-100/hour**, making it unaffordable
- ⏰ Students need help **24/7**, but tutors aren't always available
- 🌍 **Language barriers** limit access to quality education
- 📉 Traditional learning methods fail to engage **65% of students**

**YoLearn.ai changes everything.**

---

## 💡 Our Solution

YoLearn.ai is an **AI-powered interactive tutoring platform** featuring:

✅ **3D Avatar Tutor** - Realistic animated teacher with lip-sync  
✅ **Voice-First Learning** - Natural speech conversations with AI  
✅ **Resizable Interface** - Adaptable layout for any screen  
✅ **Instant Stop Control** - Real-time speech interruption  
✅ **24/7 Availability** - Learn anytime, anywhere  
✅ **5 Expert Tutors** - Specialized in different subjects  

---

## ✨ Key Features We Built

### 🤖 **5 Specialized AI Tutors**
- **Alex** - Math, Science & Technology Expert
- **Sophia** - Computer Science & Programming
- **Maya** - Data Science & AI/ML
- **Ryan** - Engineering & Design  
- **Emma** - Business & Economics

### 🎭 **Realistic 3D Avatar**
- **Ready Player Me** integration for lifelike avatars
- **Mouth animation** synchronized with speech using morph targets
- **Idle animations** with gentle sway and breathing motion
- **Three.js rendering** for smooth 60fps performance

### 🎤 **Advanced Voice Controls**
- **Real-time speech-to-text** using Web Speech API
- **High-quality text-to-speech** with natural voices
- **Instant stop button** with triple-cancel mechanism
- **Voice commands** recognition for hands-free learning

### 🖼️ **Intelligent Interface**
- **Resizable panels** - Drag divider to adjust avatar/chat ratio
- **Responsive design** - Works on desktop, tablet, mobile
- **Session recording** - Save learning sessions as WebM
- **Live webcam** - Picture-in-picture student view
- **Dark theme** - Eye-friendly UI for extended learning

### 🧠 **Smart AI Responses**
- **Concise answers** (max 200 words) - No information overload
- **Structured formatting** with bullet points and examples
- **Context awareness** - Remembers conversation history
- **Multi-turn conversations** - Natural dialogue flow
- **Specialized prompts** - Tutor-specific teaching styles

---

## 🛠️ Technology Stack

### Frontend
```
HTML5 | CSS3 (1850+ lines) | Vanilla JavaScript (650+ lines)
Three.js r128 (3D Graphics) | GLTFLoader
Web Speech API (Recognition & Synthesis)
Ready Player Me SDK | WebRTC (MediaRecorder)
Responsive Design | Glassmorphism UI
```

### Backend
```
Node.js 18+ | Express.js 4.18+
RESTful API | Google Gemini 2.0 Flash API
CORS Configuration | Error Handling
JSON Request/Response | Real-time Processing
```

### AI & Graphics
```
Google Gemini 2.0 Flash API (Multi-turn conversations)
Ready Player Me 3D Avatars (.glb format)
Speech Synthesis API (Browser native)
Speech Recognition API (WebkitSpeechRecognition)
Natural Language Processing
```

### DevOps & Deployment
```
Vercel (Frontend hosting)
Local Node.js server (Development)
GitHub (Version control)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Google Gemini API key ([Get it free](https://makersuite.google.com/app/apikey))
- Modern web browser with WebGL support (Chrome, Firefox, Edge)

### Installation

**1. Clone & Setup**
```
git clone https://github.com/yourusername/yolearn-ai.git
cd yolearn-ai
cd backend && npm install
```

**2. Configure API**
Create `backend/config/config.js`:
```
module.exports = {
    geminiApiKey: 'YOUR_GEMINI_API_KEY_HERE',
    port: 5000
};
```

**3. Start Application**
```
# Terminal 1: Start Backend
cd backend
npm start
# Server will run on http://localhost:5000

# Terminal 2: Start Frontend (use Live Server or Python)
cd frontend
python -m http.server 5500
# Or right-click call.html > Open with Live Server
```

**4. Open Browser**
```
http://localhost:5500/frontend/index.html
```

---

## 📸 Screenshots

### 🏠 Homepage - Select Your AI Tutor
<img src="https://drive.google.com/uc?export=view&id=1joY7GJWB-5a3Li6-47uSA1HyClKBlkn5" alt="Homepage" width="800"/>

*Choose from 5 specialized AI tutors, each with unique expertise and teaching style*

---

### 🎭 3D Avatar Learning Session
<img src="https://drive.google.com/uc?export=view&id=1Ps2-ZAl2mHGj3Nx6k3KRNgu1at8_EPDQ" alt="Avatar Session" width="800"/>

*Realistic 3D avatar with lip-sync, resizable panels, live chat, and webcam integration*

---

## 🎥 Demo Video

[![Watch Full Demo](https://img.shields.io/badge/▶️-Watch%20Full%20Demo%20Video-red?style=for-the-badge&logo=google-drive)](https://drive.google.com/file/d/1V23_WMqq_aOOVyFKcvr_La-mz2LTsual/view?usp=drive_link)

> *Complete walkthrough showcasing 3D avatar, voice controls, resizable panels, and AI responses*

---

## 🏗️ Architecture

![YoLearn.ai System Architecture](https://drive.google.com/uc?export=view&id=14ICxpaFMwqDtxizaz9_UMR2kLtvcikqA)


---

## 🏆 Competitive Advantage

| Feature | YoLearn.ai | Khan Academy | Chegg | Coursera |
|---------|-----------|--------------|-------|----------|
| **3D Avatar Tutor** | ✅ | ❌ | ❌ | ❌ |
| **Voice Conversations** | ✅ | ❌ | ❌ | ❌ |
| **Real-time Lip-sync** | ✅ | ❌ | ❌ | ❌ |
| **Instant Speech Stop** | ✅ | ❌ | ❌ | ❌ |
| **Resizable Interface** | ✅ | ❌ | ❌ | ❌ |
| **24/7 AI Availability** | ✅ | ❌ | ⚠️ | ❌ |
| **Session Recording** | ✅ | ❌ | ❌ | ❌ |
| **Cost** | **Free** | Free | $14.95/mo | $49/mo |
| **Personalization** | ✅ | ⚠️ | ⚠️ | ✅ |

---

## 🚀 Future Enhancements

- [ ] **Multi-language support** - Translate tutor responses
- [ ] **Progress tracking** - Database integration for user analytics
- [ ] **Whiteboard feature** - Visual drawing for math/science
- [ ] **Offline mode** - PWA with service workers
- [ ] **Mobile app** - React Native version
- [ ] **Screen sharing** - Collaborative problem-solving
- [ ] **Quiz system** - Gamified assessments
- [ ] **Voice cloning** - Custom tutor voices

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. 🐛 **Report bugs** - Create an issue with reproduction steps
2. 💡 **Suggest features** - Open a discussion with use cases
3. 🔧 **Submit PRs** - Fix bugs or add features (with tests)
4. 📖 **Improve docs** - Help others understand the codebase
5. ⭐ **Star the repo** - Show your support!

**Contribution Guidelines:**
- Follow existing code style
- Add comments for complex logic
- Test your changes thoroughly
- Update README if needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini AI** - For providing free, powerful language models
- **Ready Player Me** - For 3D avatar technology and easy integration
- **Three.js Community** - For excellent 3D graphics library and docs
- **Web Speech API** - For enabling voice recognition in browsers
- **Express.js Team** - For lightweight, fast backend framework

---

## 📞 Contact & Support

- **Email**: [tejasbhise1013@gmail.com](mailto:tejasbhise1013@gmail.com)

---

<div align="center">

### ⭐ Star this repo if you believe in accessible education for all!

**Made with ❤️ for students worldwide | © 2025 YoLearn.ai**

</div>
