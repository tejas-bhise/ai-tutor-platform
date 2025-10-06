/**
 * YoLearn.ai v2.0 - Main Application Logic
 * Homepage with 5 specialized AI tutors
 */

// 5 Specialized AI Tutors Data
const tutorsData = [
    {
        id: 'alex',
        name: 'Alex',
        specialty: 'Math, Science & Technology Expert',
        emoji: '👨‍🏫',
        subjects: ['Physics', 'Math', 'Coding']
    },
    {
        id: 'sophia',
        name: 'Sophia',
        specialty: 'Computer Science & Programming',
        emoji: '👩‍💻',
        subjects: ['Python', 'JavaScript', 'Web Dev', 'Algorithms']
    },
    {
        id: 'maya',
        name: 'Maya',
        specialty: 'Data Science & AI/ML Expert',
        emoji: '👩‍🔬',
        subjects: ['Machine Learning', 'Data Science', 'AI']
    },
    {
        id: 'ryan',
        name: 'Ryan',
        specialty: 'Engineering & Design Specialist',
        emoji: '👨‍🔧',
        subjects: ['Mechanical', 'Electrical', 'CAD', 'Circuits']
    },
    {
        id: 'emma',
        name: 'Emma',
        specialty: 'Business & Economics Expert',
        emoji: '👩‍💼',
        subjects: ['Economics', 'Finance', 'Business', 'Marketing']
    }
];

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 YoLearn.ai v2.0 Loading...');

    // Create particles if function exists
    if (typeof UIHelpers !== 'undefined' && UIHelpers.createParticles) {
        UIHelpers.createParticles();
    }

    // Load tutors
    await loadTutors();

    // Check backend status (non-blocking)
    checkBackendConnection();
});

/**
 * Load tutors (using local data)
 */
async function loadTutors() {
    const tutorsGrid = document.getElementById('tutors-grid');
    
    if (!tutorsGrid) {
        console.log('ℹ️ Tutors grid not found (probably on call.html page)');
        return;
    }

    try {
        // Display tutors
        displayTutors(tutorsData);
        console.log('✅ Tutors loaded successfully');
        
    } catch (error) {
        console.error('❌ Error loading tutors:', error);
    }
}

/**
 * Check backend connection (non-blocking)
 */
async function checkBackendConnection() {
    if (typeof api === 'undefined') {
        console.warn('⚠️ API service not loaded');
        return;
    }

    try {
        const health = await api.checkHealth();
        if (health.success) {
            console.log('✅ Backend connected and ready!');
        } else {
            console.warn('⚠️ Backend connection issue (tutors still work!)');
        }
    } catch (error) {
        console.warn('⚠️ Backend check failed (tutors still work!):', error.message);
    }
}

/**
 * Display tutors in grid
 */
function displayTutors(tutors) {
    const tutorsGrid = document.getElementById('tutors-grid');
    
    if (!tutorsGrid) {
        console.error('❌ Tutors grid element not found');
        return;
    }

    tutorsGrid.innerHTML = '';

    tutors.forEach(tutor => {
        const card = document.createElement('div');
        card.className = `tutor-card ${tutor.id}`;
        
        card.innerHTML = `
            <div class="tutor-emoji">${tutor.emoji}</div>
            <h3 class="text-3xl font-bold text-white mb-2">${tutor.name}</h3>
            <p class="text-white/80 mb-4">${tutor.specialty}</p>
            <div class="flex gap-2 justify-center mb-4 flex-wrap">
                ${tutor.subjects.map(subject => 
                    `<span class="subject-tag" style="background: rgba(${getSubjectColorRGB(subject)}, 0.3); padding: 4px 12px; border-radius: 12px; font-size: 14px;">
                        ${getSubjectEmoji(subject)} ${subject}
                    </span>`
                ).join('')}
            </div>
            <button class="start-btn ${tutor.id}" onclick="startCall('${tutor.id}')" style="cursor: pointer;">
                🚀 Start Learning with ${tutor.name}
            </button>
        `;

        tutorsGrid.appendChild(card);
    });

    console.log('✅ Displayed', tutors.length, 'tutors');
}

/**
 * Get subject color RGB
 */
function getSubjectColorRGB(subject) {
    const colors = {
        'Physics': '59, 130, 246',    // blue
        'Math': '34, 197, 94',         // green
        'Coding': '168, 85, 247',      // purple
        'Python': '34, 197, 94',       // green
        'JavaScript': '251, 191, 36',  // yellow
        'Web Dev': '59, 130, 246',     // blue
        'Algorithms': '168, 85, 247',  // purple
        'Machine Learning': '236, 72, 153',  // pink
        'Data Science': '168, 85, 247',      // purple
        'AI': '236, 72, 153',          // pink
        'Mechanical': '251, 146, 60',  // orange
        'Electrical': '234, 179, 8',   // amber
        'CAD': '251, 191, 36',         // yellow
        'Circuits': '251, 146, 60',    // orange
        'Economics': '236, 72, 153',   // pink
        'Finance': '34, 197, 94',      // green
        'Business': '59, 130, 246',    // blue
        'Marketing': '251, 191, 36'    // yellow
    };
    return colors[subject] || '156, 163, 175'; // gray default
}

/**
 * Get subject emoji
 */
function getSubjectEmoji(subject) {
    const emojis = {
        'Physics': '🧪',
        'Math': '🔢',
        'Coding': '💻',
        'Python': '🐍',
        'JavaScript': '⚡',
        'Web Dev': '🌐',
        'Algorithms': '🧮',
        'Machine Learning': '🤖',
        'Data Science': '📊',
        'AI': '🧠',
        'Mechanical': '⚙️',
        'Electrical': '💡',
        'CAD': '📐',
        'Circuits': '🔌',
        'Economics': '💰',
        'Finance': '💵',
        'Business': '📊',
        'Marketing': '📢'
    };
    return emojis[subject] || '📖';
}

/**
 * Start learning session
 */
function startCall(tutorId) {
    // Find tutor by ID
    const tutor = tutorsData.find(t => t.id === tutorId);
    
    if (!tutor) {
        console.error('❌ Tutor not found:', tutorId);
        alert('Tutor not found. Please try again.');
        return;
    }

    console.log('🎓 Starting session with:', tutor.name);

    // Store tutor info in sessionStorage
    sessionStorage.setItem('currentTutor', JSON.stringify(tutor));
    
    // Generate room ID
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    sessionStorage.setItem('currentRoomId', roomId);
    
    // Navigate to call page
    window.location.href = 'call.html';
}

// Make function globally available
window.startCall = startCall;

console.log('✅ app.js v2.0 loaded successfully');
console.log('👥 Available Tutors:', tutorsData.map(t => t.name).join(', '));
