/**
 * YoLearn.ai Backend Server - Production Ready v2.0
 */

// Load environment variables FIRST
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

// Get API key from environment variable
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;

console.log('🔍 Environment Check:');
console.log('   GEMINI_API_KEY length:', GEMINI_API_KEY ? GEMINI_API_KEY.length : 0);
console.log('   First 10 chars:', GEMINI_API_KEY ? GEMINI_API_KEY.substring(0, 10) + '...' : 'NOT SET');

// AI Companions Database - 5 Specialized Tutors (UPDATED WITH READY PLAYER ME AVATARS)
const AI_COMPANIONS = {
    'alex': {
        id: 'alex',
        name: 'Alex',
        specialty: 'Mathematics & Physics',
        description: 'Expert in Advanced Mathematics, Calculus, Statistics, and Physics',
        avatar: '👨‍🏫',
        emoji: '📐',
        avatarUrl: 'https://models.readyplayer.me/68e3549ab7446b1aad116ab5.glb',
        voiceId: 'en-US-Neural2-D',
        subjects: ['Mathematics', 'Calculus', 'Statistics', 'Physics', 'Algebra'],
        personality: 'analytical, patient, methodical',
        bio: 'I help students master mathematical concepts from basic algebra to advanced calculus, with clear step-by-step explanations.',
        available: true,
        color: 'from-blue-500 to-purple-600',
        expertise: 'Mathematics & Physics',
        yearsExperience: '10+ years',
        specialties: ['Problem Solving', 'Exam Preparation', 'Conceptual Understanding']
    },
    'sophia': {
        id: 'sophia',
        name: 'Sophia',
        specialty: 'Computer Science & Programming',
        description: 'Software Development Expert specializing in Python, JavaScript, Web Dev & Algorithms',
        avatar: '👩‍💻',
        emoji: '💻',
        avatarUrl: 'https://models.readyplayer.me/68e3549ab7446b1aad116ab5.glb',
        voiceId: 'en-US-Neural2-F',
        subjects: ['Python', 'JavaScript', 'Web Development', 'Data Structures', 'Algorithms'],
        personality: 'practical, encouraging, detail-oriented',
        bio: 'I teach coding from fundamentals to advanced concepts, helping students become confident developers.',
        available: true,
        color: 'from-green-500 to-teal-600',
        expertise: 'Computer Science & Programming',
        yearsExperience: '8+ years',
        specialties: ['Full-Stack Development', 'Algorithm Design', 'Code Debugging']
    },
    'maya': {
        id: 'maya',
        name: 'Maya',
        specialty: 'Data Science & AI/ML',
        description: 'Machine Learning & Data Analytics Expert with Python, TensorFlow & Statistics',
        avatar: '👩‍🔬',
        emoji: '📊',
        avatarUrl: 'https://models.readyplayer.me/68e3549ab7446b1aad116ab5.glb',
        voiceId: 'en-US-Neural2-G',
        subjects: ['Machine Learning', 'Data Science', 'Python', 'Statistics', 'AI'],
        personality: 'innovative, insightful, research-focused',
        bio: 'I guide students through the exciting world of data science, machine learning, and artificial intelligence.',
        available: true,
        color: 'from-purple-500 to-pink-600',
        expertise: 'Data Science & Machine Learning',
        yearsExperience: '7+ years',
        specialties: ['Neural Networks', 'Data Visualization', 'Predictive Analytics']
    },
    'ryan': {
        id: 'ryan',
        name: 'Ryan',
        specialty: 'Engineering & Design',
        description: 'Mechanical, Electrical & Civil Engineering Expert with CAD and System Design',
        avatar: '👨‍🔧',
        emoji: '⚙️',
        avatarUrl: 'https://models.readyplayer.me/68e3549ab7446b1aad116ab5.glb',
        voiceId: 'en-US-Neural2-J',
        subjects: ['Mechanical Engineering', 'Electrical Engineering', 'CAD', 'Thermodynamics', 'Circuits'],
        personality: 'practical, systematic, problem-solver',
        bio: 'I help engineering students understand complex systems, design principles, and real-world applications.',
        available: true,
        color: 'from-orange-500 to-red-600',
        expertise: 'Engineering & Technical Design',
        yearsExperience: '12+ years',
        specialties: ['System Design', '3D Modeling', 'Project Management']
    },
    'emma': {
        id: 'emma',
        name: 'Emma',
        specialty: 'Business & Economics',
        description: 'Finance, Economics, Accounting & Business Strategy Expert',
        avatar: '👩‍💼',
        emoji: '📈',
        avatarUrl: 'https://models.readyplayer.me/68e3549ab7446b1aad116ab5.glb',
        voiceId: 'en-US-Neural2-H',
        subjects: ['Economics', 'Finance', 'Accounting', 'Business', 'Marketing'],
        personality: 'strategic, articulate, results-driven',
        bio: 'I teach business fundamentals, economic principles, and financial literacy for career success.',
        available: true,
        color: 'from-yellow-500 to-orange-600',
        expertise: 'Business & Economics',
        yearsExperience: '9+ years',
        specialties: ['Financial Analysis', 'Market Research', 'Strategic Planning']
    }
};

// CORS Configuration
const corsOptions = {
    origin: '*',  // Allow all origins for testing
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.options('*', cors(corsOptions));

/**
 * Root endpoint
 */
app.get('/', (req, res) => {
    res.json({ 
        success: true,
        message: '🎓 YoLearn.ai Backend is running!',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/api/health',
            companions: '/api/companions',
            tutors: '/api/tutors',
            chat: '/api/chat (POST)',
            generate: '/api/generate (POST)',
            rooms: '/api/video/rooms (POST)',
            webrtc: '/api/webrtc/config'
        },
        tutors: Object.keys(AI_COMPANIONS).length
    });
});

/**
 * Health check
 */
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        backend: 'operational',
        apiKeyConfigured: !!GEMINI_API_KEY,
        tutorsAvailable: Object.keys(AI_COMPANIONS).length,
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/companions - List all AI tutors (LEGACY ENDPOINT)
 */
app.get('/api/companions', (req, res) => {
    const companions = Object.values(AI_COMPANIONS);
    
    res.json({
        success: true,
        companions: companions,
        metadata: {
            total: companions.length,
            available: companions.filter(c => c.available).length,
            timestamp: new Date().toISOString()
        }
    });
});

/**
 * GET /api/tutors - List all AI tutors (NEW ENDPOINT)
 */
app.get('/api/tutors', (req, res) => {
    const tutors = Object.values(AI_COMPANIONS);
    
    res.json({
        success: true,
        count: tutors.length,
        tutors: tutors,
        metadata: {
            total: tutors.length,
            available: tutors.filter(t => t.available).length,
            timestamp: new Date().toISOString()
        }
    });
});

/**
 * GET /api/companions/:id - Get specific tutor (LEGACY)
 */
app.get('/api/companions/:id', (req, res) => {
    const companion = AI_COMPANIONS[req.params.id];
    
    if (companion) {
        res.json({ 
            success: true, 
            companion: companion 
        });
    } else {
        res.status(404).json({ 
            success: false, 
            error: 'Companion not found',
            availableIds: Object.keys(AI_COMPANIONS)
        });
    }
});

/**
 * GET /api/tutors/:id - Get specific tutor (NEW)
 */
app.get('/api/tutors/:id', (req, res) => {
    const tutor = AI_COMPANIONS[req.params.id];
    
    if (tutor) {
        res.json({ 
            success: true, 
            tutor: tutor 
        });
    } else {
        res.status(404).json({ 
            success: false, 
            error: 'Tutor not found',
            availableIds: Object.keys(AI_COMPANIONS)
        });
    }
});

/**
 * POST /api/video/rooms - Create learning room
 */
app.post('/api/video/rooms', (req, res) => {
    const { userId, companionId } = req.body;
    
    // Validate companion
    const companion = AI_COMPANIONS[companionId];
    if (!companion) {
        return res.status(400).json({
            success: false,
            error: 'Invalid companion ID',
            availableIds: Object.keys(AI_COMPANIONS)
        });
    }
    
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    res.json({
        success: true,
        room: {
            id: roomId,
            userId: userId || 'anonymous',
            companionId: companionId,
            companionName: companion.name,
            createdAt: new Date().toISOString(),
            status: 'active',
            features: {
                chat: true,
                voice: true,
                whiteboard: true,
                notes: true,
                video: true,
                recording: true
            },
            webrtcConfig: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' }
                ]
            }
        }
    });
});

/**
 * GET /api/video/rooms/:roomId - Get room info
 */
app.get('/api/video/rooms/:roomId', (req, res) => {
    const { roomId } = req.params;
    
    res.json({
        success: true,
        room: {
            id: roomId,
            status: 'active',
            participants: ['user', 'ai-tutor'],
            createdAt: new Date().toISOString(),
            duration: Math.floor(Math.random() * 3600),
            features: {
                chat: true,
                voice: true,
                whiteboard: true,
                notes: true,
                video: true,
                recording: true
            }
        }
    });
});

/**
 * GET /api/webrtc/config - WebRTC configuration
 */
app.get('/api/webrtc/config', (req, res) => {
    res.json({
        success: true,
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' }
            ],
            iceCandidatePoolSize: 10,
            sdpSemantics: 'unified-plan',
            bundlePolicy: 'max-bundle'
        },
        timestamp: new Date().toISOString()
    });
});

/**
 * POST /api/chat - NEW Chat endpoint (connects to frontend)
 */
app.post('/api/chat', async (req, res) => {
    try {
        const { message, tutor_name } = req.body;
        
        if (!message || message.trim() === '') {
            return res.status(400).json({ 
                success: false, 
                error: 'Message is required' 
            });
        }

        if (!GEMINI_API_KEY) {
            return res.status(500).json({ 
                success: false, 
                error: 'API key not configured. Please add GEMINI_API_KEY environment variable.' 
            });
        }

        console.log('📨 Chat request from', tutor_name || 'Alex', ':', message.substring(0, 50) + '...');

        // Find tutor
        const tutor = Object.values(AI_COMPANIONS).find(
            c => c.name.toLowerCase() === (tutor_name || 'alex').toLowerCase()
        ) || AI_COMPANIONS['alex'];

        // Build system prompt
        const systemPrompt = `You are ${tutor.name}, an AI Tutor specializing in ${tutor.specialty}.

YOUR EXPERTISE:
${tutor.subjects.map(s => `- ${s}`).join('\n')}

PERSONALITY: ${tutor.personality}

YOUR BIO: ${tutor.bio}

TEACHING STYLE:
- Explain clearly with structure and depth
- Use headings, bullet points, and examples
- Adjust complexity based on student level
- Never use asterisks or special formatting symbols
- Be conversational and encouraging
- Provide step-by-step explanations when needed
- Use real-world examples relevant to ${tutor.specialty}
- Break down complex topics into digestible parts

Respond to the student's question following these guidelines.`;

        const fullPrompt = `${systemPrompt}\n\nStudent's question: "${message}"\n\nProvide a clear, educational response:`;

        // Call Gemini API
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;

        const response = await axios.post(apiUrl, {
            contents: [{
                parts: [{ text: fullPrompt }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.9,
                maxOutputTokens: 1500
            }
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
        });

        const aiResponse = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiResponse) {
            throw new Error('No response from AI');
        }

        // Clean response for TTS
        const cleanedResponse = aiResponse
            .replace(/\*/g, '')
            .replace(/\#/g, '')
            .replace(/\_/g, '')
            .replace(/\~/g, '')
            .replace(/\`/g, '')
            .trim();

        console.log('✅ Response generated by', tutor.name);

        res.json({
            success: true,
            response: aiResponse,
            cleanedResponse: cleanedResponse,
            tutor: tutor.name,
            specialty: tutor.specialty,
            audio_url: null,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Chat Error:', error.message);
        
        res.status(500).json({ 
            success: false, 
            error: 'Failed to generate response',
            response: 'I understand your question. Let me help you with that...',
            tutor: req.body.tutor_name || 'Alex',
            audio_url: null,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * POST /api/generate - LEGACY Generate AI response endpoint
 */
app.post('/api/generate', async (req, res) => {
    try {
        const { query, tutorName, context } = req.body;
        
        if (!query || query.trim() === '') {
            return res.status(400).json({ 
                success: false, 
                error: 'Query is required' 
            });
        }

        if (!GEMINI_API_KEY) {
            return res.status(500).json({ 
                success: false, 
                error: 'API key not configured. Please add GEMINI_API_KEY environment variable.' 
            });
        }

        console.log('📨 Request from', tutorName, ':', query.substring(0, 50) + '...');

        // Find tutor by name
        const tutor = Object.values(AI_COMPANIONS).find(
            c => c.name.toLowerCase() === tutorName.toLowerCase()
        ) || AI_COMPANIONS['alex'];

        // Build specialized system prompt
        const systemPrompt = `You are ${tutor.name}, an AI Tutor specializing in ${tutor.specialty}.

YOUR EXPERTISE:
${tutor.subjects.map(s => `- ${s}`).join('\n')}

PERSONALITY: ${tutor.personality}

YOUR BIO: ${tutor.bio}

TEACHING STYLE:
- Explain clearly with structure and depth
- Use headings, bullet points, and examples
- Adjust complexity based on student level
- Never use asterisks or special formatting symbols
- Be conversational and encouraging
- Provide step-by-step explanations when needed
- Use real-world examples relevant to ${tutor.specialty}
- Break down complex topics into digestible parts

Respond to the student's question following these guidelines.`;

        const fullPrompt = `${systemPrompt}\n\nStudent's question: "${query}"\n\nProvide a clear, educational response:`;

        // Call Gemini API
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;

        const response = await axios.post(apiUrl, {
            contents: [{
                parts: [{ text: fullPrompt }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.9,
                maxOutputTokens: 1500
            }
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
        });

        const aiResponse = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiResponse) {
            throw new Error('No response from AI');
        }

        // Clean response for TTS
        const cleanedResponse = aiResponse
            .replace(/\*/g, '')
            .replace(/\#/g, '')
            .replace(/\_/g, '')
            .replace(/\~/g, '')
            .replace(/\`/g, '')
            .trim();

        console.log('✅ Response generated by', tutor.name);

        res.json({
            success: true,
            response: aiResponse,
            cleanedResponse: cleanedResponse,
            tutorName: tutor.name,
            tutorSpecialty: tutor.specialty,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error:', error.message);
        
        res.status(500).json({ 
            success: false, 
            error: 'Failed to generate response',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * 404 handler
 */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        availableEndpoints: {
            health: 'GET /api/health',
            companions: 'GET /api/companions',
            tutors: 'GET /api/tutors',
            companionById: 'GET /api/companions/:id',
            tutorById: 'GET /api/tutors/:id',
            chat: 'POST /api/chat',
            generate: 'POST /api/generate',
            createRoom: 'POST /api/video/rooms',
            getRoom: 'GET /api/video/rooms/:roomId',
            webrtcConfig: 'GET /api/webrtc/config'
        }
    });
});

/**
 * Global error handler
 */
app.use((error, req, res, next) => {
    console.error('❌ Server error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

/**
 * Start server
 */
app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🚀 YoLearn.ai Backend Server v2.0 Started!');
    console.log('='.repeat(60));
    console.log(`📡 Port: ${PORT}`);
    console.log(`🔑 API Key: ${GEMINI_API_KEY ? '✅ Configured' : '❌ Missing'}`);
    console.log(`👥 AI Tutors: ${Object.keys(AI_COMPANIONS).length}`);
    console.log(`⏰ Time: ${new Date().toLocaleString()}`);
    console.log('\n📚 Available Tutors:');
    Object.values(AI_COMPANIONS).forEach(tutor => {
        console.log(`   ${tutor.emoji} ${tutor.name} - ${tutor.specialty}`);
    });
    console.log('='.repeat(60));
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('👋 SIGINT received, shutting down gracefully...');
    process.exit(0);
});
