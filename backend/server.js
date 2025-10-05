/**
 * YoLearn.ai Backend Server - Production Ready
 * 
 * DEPLOYMENT INFORMATION:
 * - Production: https://ai-tutor-platform-7vte.onrender.com (Render)
 * - Local: http://localhost:5000
 * - Frontend: https://ai-tutor-platform-lime.vercel.app (Vercel)
 * 
 * API Key from environment variables (set in Render dashboard)
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');

// Rest of your server.js code...


const app = express();
const PORT = process.env.PORT || 5000;

// Get API key from environment variable
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// CORS Configuration
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        
        if (origin.includes('vercel.app') || 
            origin.includes('localhost') || 
            origin.includes('127.0.0.1')) {
            callback(null, true);
        } else {
            callback(null, true);
        }
    },
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
        version: '1.0.0',
        timestamp: new Date().toISOString()
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
        timestamp: new Date().toISOString()
    });
});

/**
 * Generate AI response
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

        console.log('📨 Request:', query.substring(0, 50) + '...');

        // Build system prompt
        const specialty = tutorName === 'Alex' 
            ? 'Mathematics, Physics, Chemistry, Computer Science'
            : 'Language, Arts, History, Literature';

        const systemPrompt = `You are ${tutorName}, an AI Tutor specializing in ${specialty}.

CORE BEHAVIOR:
- Explain clearly with structure and depth
- Use headings, bullet points, and examples
- Adjust depth based on question complexity
- Never use asterisks or special formatting symbols in responses
- Be conversational and follow student commands (stop, continue, repeat)
- Provide step-by-step explanations when needed

Respond to the student's question following these rules.`;

        const fullPrompt = `${systemPrompt}\n\nStudent's question: "${query}"\n\nProvide a clear educational response:`;

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

        console.log('✅ Response generated');

        res.json({
            success: true,
            response: aiResponse,
            cleanedResponse: cleanedResponse,
            tutorName: tutorName
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
        error: 'Endpoint not found'
    });
});

/**
 * Start server
 */
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('🚀 YoLearn.ai Backend Started!');
    console.log('='.repeat(50));
    console.log(`📡 Port: ${PORT}`);
    console.log(`🔑 API Key: ${GEMINI_API_KEY ? '✅ Configured' : '❌ Missing'}`);
    console.log(`⏰ Time: ${new Date().toLocaleString()}`);
    console.log('='.repeat(50));
});
