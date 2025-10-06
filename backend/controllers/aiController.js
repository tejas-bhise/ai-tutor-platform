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

        console.log(`📩 Processing query for ${tutorName || 'Alex'}: ${query.substring(0, 50)}...`);

        // Generate response using Gemini
        const result = await geminiService.generateResponse(
            query,
            tutorName || 'Alex',
            context || {}
        );

        res.json(result);

    } catch (error) {
        console.error('❌ Controller error:', error.message);
        next(error);
    }
};

// Health Check
exports.healthCheck = async (req, res) => {
    try {
        const health = await geminiService.healthCheck();
        res.json({
            success: true,
            service: 'YoLearn.ai API v2.0',
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

// Get All Available Tutors (Updated with 5 tutors)
exports.getTutors = (req, res) => {
    res.json({
        success: true,
        count: 5,
        tutors: [
            {
                id: 'alex',
                name: 'Alex',
                emoji: '👨‍🏫',
                specialty: 'Math, Science & Technology Expert',
                subjects: ['Physics', 'Mathematics', 'Calculus', 'Statistics', 'Coding'],
                personality: 'analytical, methodical, patient',
                color: 'blue',
                avatar: 'https://models.readyplayer.me/68e3549ab7446b1aad116ab5.glb'
            },
            {
                id: 'sophia',
                name: 'Sophia',
                emoji: '👩‍💻',
                specialty: 'Computer Science & Programming',
                subjects: ['Python', 'JavaScript', 'Web Development', 'Algorithms', 'Data Structures'],
                personality: 'practical, encouraging, detail-oriented',
                color: 'green',
                avatar: 'https://models.readyplayer.me/68e3549ab7446b1aad116ab5.glb'
            },
            {
                id: 'maya',
                name: 'Maya',
                emoji: '👩‍🔬',
                specialty: 'Data Science & AI/ML Expert',
                subjects: ['Machine Learning', 'Deep Learning', 'Data Analysis', 'Python', 'TensorFlow'],
                personality: 'innovative, insightful, research-focused',
                color: 'purple',
                avatar: 'https://models.readyplayer.me/68e3549ab7446b1aad116ab5.glb'
            },
            {
                id: 'ryan',
                name: 'Ryan',
                emoji: '👨‍🔧',
                specialty: 'Engineering & Design Expert',
                subjects: ['Mechanical Engineering', 'Electrical Circuits', 'CAD Design', 'Thermodynamics'],
                personality: 'practical, systematic, problem-solver',
                color: 'orange',
                avatar: 'https://models.readyplayer.me/68e3549ab7446b1aad116ab5.glb'
            },
            {
                id: 'emma',
                name: 'Emma',
                emoji: '👩‍💼',
                specialty: 'Business & Economics Expert',
                subjects: ['Economics', 'Finance', 'Marketing', 'Business Strategy', 'Accounting'],
                personality: 'strategic, articulate, results-driven',
                color: 'pink',
                avatar: 'https://models.readyplayer.me/68e3549ab7446b1aad116ab5.glb'
            }
        ]
    });
};

// Get Single Tutor by ID
exports.getTutorById = (req, res) => {
    const tutorId = req.params.id;
    
    const tutors = {
        'alex': {
            id: 'alex',
            name: 'Alex',
            emoji: '👨‍🏫',
            specialty: 'Math, Science & Technology Expert',
            subjects: ['Physics', 'Mathematics', 'Calculus', 'Statistics', 'Coding'],
            personality: 'analytical, methodical, patient',
            color: 'blue',
            avatar: 'https://models.readyplayer.me/68e3549ab7446b1aad116ab5.glb'
        },
        'sophia': {
            id: 'sophia',
            name: 'Sophia',
            emoji: '👩‍💻',
            specialty: 'Computer Science & Programming',
            subjects: ['Python', 'JavaScript', 'Web Development', 'Algorithms', 'Data Structures'],
            personality: 'practical, encouraging, detail-oriented',
            color: 'green',
            avatar: 'https://models.readyplayer.me/68e3549ab7446b1aad116ab5.glb'
        },
        'maya': {
            id: 'maya',
            name: 'Maya',
            emoji: '👩‍🔬',
            specialty: 'Data Science & AI/ML Expert',
            subjects: ['Machine Learning', 'Deep Learning', 'Data Analysis', 'Python', 'TensorFlow'],
            personality: 'innovative, insightful, research-focused',
            color: 'purple',
            avatar: 'https://models.readyplayer.me/68e3549ab7446b1aad116ab5.glb'
        },
        'ryan': {
            id: 'ryan',
            name: 'Ryan',
            emoji: '👨‍🔧',
            specialty: 'Engineering & Design Expert',
            subjects: ['Mechanical Engineering', 'Electrical Circuits', 'CAD Design', 'Thermodynamics'],
            personality: 'practical, systematic, problem-solver',
            color: 'orange',
            avatar: 'https://models.readyplayer.me/68e3549ab7446b1aad116ab5.glb'
        },
        'emma': {
            id: 'emma',
            name: 'Emma',
            emoji: '👩‍💼',
            specialty: 'Business & Economics Expert',
            subjects: ['Economics', 'Finance', 'Marketing', 'Business Strategy', 'Accounting'],
            personality: 'strategic, articulate, results-driven',
            color: 'pink',
            avatar: 'https://models.readyplayer.me/68e3549ab7446b1aad116ab5.glb'
        }
    };
    
    const tutor = tutors[tutorId.toLowerCase()];
    
    if (!tutor) {
        return res.status(404).json({
            success: false,
            error: `Tutor '${tutorId}' not found`
        });
    }
    
    res.json({
        success: true,
        tutor: tutor
    });
};
