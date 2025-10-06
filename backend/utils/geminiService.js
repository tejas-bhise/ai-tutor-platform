/**
 * YoLearn.ai v2.0 - Gemini Service
 * Specialized AI service supporting 5 expert tutors
 * OPTIMIZED FOR CONCISE, STRUCTURED RESPONSES
 */

const axios = require('axios');
const config = require('../config/config');

// 5 Specialized Tutor Profiles - ENHANCED
const TUTOR_PROFILES = {
    'alex': {
        name: 'Alex',
        specialty: 'Mathematics & Physics',
        expertise: [
            'Advanced Mathematics',
            'Calculus (Differential & Integral)',
            'Linear Algebra',
            'Statistics & Probability',
            'Physics (Classical & Modern)',
            'Mathematical Proofs',
            'Problem Solving Techniques'
        ],
        personality: 'analytical, methodical, patient',
        teachingStyle: 'Step-by-step logical reasoning with concise explanations',
        strengths: 'Breaking down complex formulas, proving theorems, solving equations systematically'
    },
    'sophia': {
        name: 'Sophia',
        specialty: 'Computer Science & Programming',
        expertise: [
            'Python Programming',
            'JavaScript & TypeScript',
            'Web Development (Frontend & Backend)',
            'Data Structures & Algorithms',
            'Object-Oriented Programming',
            'Database Design',
            'Software Engineering Best Practices'
        ],
        personality: 'practical, encouraging, detail-oriented',
        teachingStyle: 'Hands-on coding examples with clean, concise code',
        strengths: 'Code optimization, algorithm design, debugging techniques, clean code principles'
    },
    'maya': {
        name: 'Maya',
        specialty: 'Data Science & AI/ML',
        expertise: [
            'Machine Learning Algorithms',
            'Deep Learning & Neural Networks',
            'Data Analysis & Visualization',
            'Python for Data Science (Pandas, NumPy)',
            'TensorFlow & PyTorch',
            'Statistical Modeling',
            'Natural Language Processing'
        ],
        personality: 'innovative, insightful, research-focused',
        teachingStyle: 'Data-driven explanations with practical ML projects',
        strengths: 'Model selection, feature engineering, hyperparameter tuning, data preprocessing'
    },
    'ryan': {
        name: 'Ryan',
        specialty: 'Engineering & Design',
        expertise: [
            'Mechanical Engineering Principles',
            'Electrical Circuit Analysis',
            'Thermodynamics & Fluid Mechanics',
            'CAD Design & 3D Modeling',
            'Control Systems',
            'Materials Science',
            'Engineering Problem Solving'
        ],
        personality: 'practical, systematic, problem-solver',
        teachingStyle: 'Real-world engineering case studies with design thinking',
        strengths: 'System design, technical drawing, failure analysis, optimization techniques'
    },
    'emma': {
        name: 'Emma',
        specialty: 'Business & Economics',
        expertise: [
            'Microeconomics & Macroeconomics',
            'Financial Analysis & Accounting',
            'Business Strategy & Management',
            'Marketing Principles',
            'Investment & Portfolio Management',
            'Entrepreneurship',
            'Economic Policy Analysis'
        ],
        personality: 'strategic, articulate, results-driven',
        teachingStyle: 'Case-based learning with real business scenarios',
        strengths: 'Financial statement analysis, market research, strategic planning, business models'
    }
};

class GeminiService {
    constructor() {
        this.apiKey = config.geminiApiKey;
    }

    getTutorProfile(tutorName) {
        const normalizedName = tutorName.toLowerCase();
        return TUTOR_PROFILES[normalizedName] || TUTOR_PROFILES['alex'];
    }

    async generateResponse(userQuery, tutorName = 'Alex', context = {}) {
        if (!this.apiKey || this.apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
            throw new Error('Gemini API key is not configured');
        }

        const tutorProfile = this.getTutorProfile(tutorName);
        const systemPrompt = this.buildOptimizedSystemPrompt(tutorProfile, userQuery);
        
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${this.apiKey}`;

        const payload = {
            contents: [{
                parts: [{
                    text: systemPrompt
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.9,
                maxOutputTokens: 500,  // REDUCED for concise responses
            }
        };

        try {
            console.log(`✅ Calling Gemini API for ${tutorProfile.name}:`, userQuery.substring(0, 50) + '...');
            
            const response = await axios.post(apiUrl, payload, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            });

            const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (!text) {
                throw new Error('No response generated');
            }

            const cleanedText = this.cleanTextForTTS(text);

            console.log(`✅ SUCCESS! Response from ${tutorProfile.name} (${text.length} chars)`);
            
            return {
                success: true,
                response: text.trim(),
                cleanedResponse: cleanedText,
                tutorName: tutorProfile.name,
                tutorSpecialty: tutorProfile.specialty
            };

        } catch (error) {
            console.error(`❌ Gemini API Error for ${tutorName}:`, error.response?.data || error.message);
            throw new Error(
                error.response?.data?.error?.message || 
                'Failed to generate AI response'
            );
        }
    }

    cleanTextForTTS(text) {
        return text
            .replace(/\*/g, '')
            .replace(/\#/g, '')
            .replace(/\_/g, '')
            .replace(/\~/g, '')
            .replace(/\`/g, '')
            .replace(/\[/g, '')
            .replace(/\]/g, '')
            .replace(/\(/g, ' ')
            .replace(/\)/g, ' ')
            .replace(/\{/g, '')
            .replace(/\}/g, '')
            .replace(/\|/g, '')
            .replace(/\>/g, '')
            .replace(/\</g, '')
            .replace(/\•/g, '')
            .replace(/\-\-/g, '')
            .replace(/\n{3,}/g, '\n\n')
            .replace(/\s{2,}/g, ' ')
            .trim();
    }

    buildOptimizedSystemPrompt(tutorProfile, userQuery) {
        // Detect query type
        const isGreeting = /^(hi|hello|hey|hlo|hola|greetings)/i.test(userQuery.trim());
        const isCommand = /^(stop|pause|wait|continue|explain again|repeat|slower|faster)/i.test(userQuery.trim());
        
        if (isGreeting) {
            return `You are ${tutorProfile.name}, an AI tutor specializing in ${tutorProfile.specialty}.

Student said: "${userQuery}"

Respond with a SHORT greeting (max 20 words):
- Greet warmly
- Mention your specialty
- Ask how you can help

NO extra text. Just the greeting.`;
        }
        
        if (isCommand) {
            return `You are ${tutorProfile.name}. Student said: "${userQuery}"

Respond naturally in 10-15 words acknowledging their command.`;
        }

        // For academic questions
        return `You are ${tutorProfile.name}, an expert AI tutor in ${tutorProfile.specialty}.

CRITICAL RULES:
1. MAXIMUM 200 WORDS total response
2. Be DIRECT and CONCISE
3. NO unnecessary introductions
4. Use bullet points for lists
5. Use numbered steps for procedures
6. NO repetition or filler

YOUR EXPERTISE:
${tutorProfile.expertise.slice(0, 4).map(e => `- ${e}`).join('\n')}

RESPONSE FORMAT:

For definitions/concepts:
- Start with 1-sentence definition
- Add 2-3 key points
- Give 1 brief example
- End with 1-sentence summary

For formulas/calculations:
- State the formula directly
- Show 1 simple example
- Explain when to use it

For code questions:
- Provide working code snippet
- Add 2-3 line explanation
- No lengthy commentary

For procedures:
- List numbered steps (max 5)
- Keep each step to 1 line
- No elaboration

Student's question: "${userQuery}"

Respond in 200 words or less. Be precise, structured, and educational.`;
    }

    async healthCheck() {
        return {
            status: 'operational',
            apiKeyConfigured: !!(this.apiKey && this.apiKey !== 'YOUR_GEMINI_API_KEY_HERE'),
            availableTutors: Object.keys(TUTOR_PROFILES).length
        };
    }
}

module.exports = new GeminiService();
