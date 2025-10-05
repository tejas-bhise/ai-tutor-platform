const geminiService = require('../utils/geminiService');

// Generate AI Response
exports.generateResponse = async (req, res, next) => {
    try {
        const { query, tutorName, context } = req.body;

        // Validation
        if (!query || typeof query !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Query is required and must be a string'
            });
        }

        if (query.length > 2000) {
            return res.status(400).json({
                success: false,
                error: 'Query is too long. Maximum 2000 characters.'
            });
        }

        // Generate response
        const result = await geminiService.generateResponse(
            query,
            tutorName || 'Alex',
            context || {}
        );

        res.json(result);

    } catch (error) {
        next(error);
    }
};

// Health Check
exports.healthCheck = async (req, res) => {
    try {
        const health = await geminiService.healthCheck();
        res.json({
            success: true,
            service: 'YoLearn.ai API',
            ...health,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Health check failed',
            timestamp: new Date().toISOString()
        });
    }
};

// Get Available Tutors
exports.getTutors = (req, res) => {
    res.json({
        success: true,
        tutors: [
            {
                id: 'alex',
                name: 'Alex',
                emoji: '👨‍🏫',
                specialty: 'Science & Math Expert',
                subjects: ['Physics', 'Math', 'Coding'],
                personality: 'analytical, problem-solver, patient'
            },
            {
                id: 'sophia',
                name: 'Sophia',
                emoji: '👩‍🏫',
                specialty: 'Language & Arts Specialist',
                subjects: ['Literature', 'Arts', 'History'],
                personality: 'creative, articulate, inspiring'
            }
        ]
    });
};
