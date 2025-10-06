const express = require('express');
const router = express.Router();
const geminiService = require('../utils/geminiService');

// Chat endpoint - MAIN ENDPOINT
router.post('/chat', async (req, res) => {
    try {
        const { message, tutor_name } = req.body;
        
        if (!message) {
            return res.status(400).json({ 
                success: false,
                error: 'Message is required' 
            });
        }
        
        const tutorName = tutor_name || 'Alex';
        
        console.log(`📩 Received chat request from ${tutorName}: ${message.substring(0, 50)}...`);
        
        // Generate AI response using Gemini
        const result = await geminiService.generateResponse(message, tutorName);
        
        res.json({
            success: true,
            response: result.response,
            cleanedResponse: result.cleanedResponse,
            tutor: result.tutorName,
            specialty: result.tutorSpecialty,
            audio_url: null // Can add TTS later
        });
        
    } catch (error) {
        console.error('❌ Chat error:', error.message);
        res.status(500).json({
            success: false,
            response: 'I understand your question. Let me help you with that...',
            tutor: req.body.tutor_name || 'Alex',
            audio_url: null,
            error: error.message
        });
    }
});

// Get all tutors
router.get('/tutors', (req, res) => {
    const tutors = [
        {
            id: 'alex',
            name: 'Alex',
            emoji: '👨‍🏫',
            specialty: 'Math, Science & Technology Expert',
            subjects: ['Physics', 'Math', 'Coding'],
            color: 'blue'
        },
        {
            id: 'sophia',
            name: 'Sophia',
            emoji: '👩‍💻',
            specialty: 'Computer Science & Programming',
            subjects: ['Python', 'JavaScript', 'Web Dev', 'Algorithms'],
            color: 'green'
        },
        {
            id: 'maya',
            name: 'Maya',
            emoji: '👩‍🔬',
            specialty: 'Data Science & AI/ML Expert',
            subjects: ['Machine Learning', 'Statistics', 'Python', 'Data Analysis'],
            color: 'purple'
        },
        {
            id: 'ryan',
            name: 'Ryan',
            emoji: '👨‍🔧',
            specialty: 'Engineering & Design Expert',
            subjects: ['CAD', 'Circuits', 'Mechanics', '3D Design'],
            color: 'orange'
        },
        {
            id: 'emma',
            name: 'Emma',
            emoji: '👩‍💼',
            specialty: 'Business & Economics Expert',
            subjects: ['Finance', 'Marketing', 'Economics', 'Management'],
            color: 'pink'
        }
    ];
    
    res.json({
        success: true,
        count: tutors.length,
        tutors: tutors
    });
});

// Health check
router.get('/health', async (req, res) => {
    try {
        const health = await geminiService.healthCheck();
        res.json({
            success: true,
            service: 'YoLearn.ai Backend',
            ...health
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
