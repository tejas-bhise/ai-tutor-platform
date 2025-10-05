/**
 * Main Application Logic for Home Page - FIXED VERSION
 */

// Hardcoded tutor data (no backend dependency)
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
        specialty: 'Arts & Humanities Specialist',
        emoji: '👩‍🏫',
        subjects: ['Literature', 'Arts', 'History']
    }
];

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 YoLearn.ai Loading...');

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
 * Load tutors (using hardcoded data)
 */
async function loadTutors() {
    const tutorsGrid = document.getElementById('tutors-grid');
    
    if (!tutorsGrid) {
        console.log('ℹ️ Tutors grid not found (probably on call.html page)');
        return;
    }

    // Show loading if available
    if (typeof UIHelpers !== 'undefined' && UIHelpers.showLoading) {
        UIHelpers.showLoading();
    }

    try {
        // Display tutors using hardcoded data
        displayTutors(tutorsData);
        console.log('✅ Tutors loaded successfully');
        
        // Hide error if any
        if (typeof UIHelpers !== 'undefined' && UIHelpers.hideError) {
            UIHelpers.hideError();
        }
        
    } catch (error) {
        console.error('❌ Error loading tutors:', error);
        
        if (typeof UIHelpers !== 'undefined' && UIHelpers.showError) {
            UIHelpers.showError('Error loading tutors. Please refresh the page.');
        }
    } finally {
        // Hide loading
        if (typeof UIHelpers !== 'undefined' && UIHelpers.hideLoading) {
            UIHelpers.hideLoading();
        }
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
        'Literature': '236, 72, 153',  // pink
        'Arts': '251, 191, 36',        // yellow
        'History': '239, 68, 68'       // red
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
        'Literature': '📚',
        'Arts': '🎨',
        'History': '🌍'
    };
    return emojis[subject] || '📖';
}

/**
 * Start video call
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
    
    // Navigate to call page
    window.location.href = 'call.html';
}

// Make function globally available
window.startCall = startCall;

console.log('✅ app.js loaded successfully');
