/**
 * Main Application Logic for Home Page
 */

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Create particles
    UIHelpers.createParticles();

    // Load tutors
    await loadTutors();
});

/**
 * Load tutors from backend
 */
async function loadTutors() {
    const tutorsGrid = document.getElementById('tutors-grid');
    
    UIHelpers.showLoading();
    UIHelpers.hideError();

    try {
        // Check backend health first
        await api.checkHealth();

        // Fetch tutors
        const response = await api.getTutors();
        
        if (!response.success || !response.tutors) {
            throw new Error('Invalid response from server');
        }

        // Display tutors
        displayTutors(response.tutors);
        
    } catch (error) {
        console.error('Error loading tutors:', error);
        UIHelpers.showError(
            'Unable to connect to the server. Please make sure the backend is running on http://localhost:5000'
        );
    } finally {
        UIHelpers.hideLoading();
    }
}

/**
 * Display tutors in grid
 */
function displayTutors(tutors) {
    const tutorsGrid = document.getElementById('tutors-grid');
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
                    `<span class="subject-tag bg-${getSubjectColor(subject)}/30">${getSubjectEmoji(subject)} ${subject}</span>`
                ).join('')}
            </div>
            <button class="start-btn ${tutor.id}" data-tutor="${tutor.id}" data-name="${tutor.name}">
                🚀 Start Learning with ${tutor.name}
            </button>
        `;

        tutorsGrid.appendChild(card);

        // Add click event
        const startBtn = card.querySelector('.start-btn');
        startBtn.addEventListener('click', () => startCall(tutor));
    });
}

/**
 * Get subject color
 */
function getSubjectColor(subject) {
    const colors = {
        'Physics': 'blue-500',
        'Math': 'green-500',
        'Coding': 'purple-500',
        'Literature': 'pink-500',
        'Arts': 'yellow-500',
        'History': 'red-500'
    };
    return colors[subject] || 'gray-500';
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
function startCall(tutor) {
    // Store tutor info in sessionStorage
    sessionStorage.setItem('currentTutor', JSON.stringify(tutor));
    
    // Navigate to call page
    window.location.href = 'call.html';
}
