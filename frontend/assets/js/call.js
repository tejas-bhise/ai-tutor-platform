/**
 * Video Call Screen Logic - FINAL WORKING VERSION
 */

// Global state
const callState = {
    tutor: null,
    startTime: null,
    timerInterval: null,
    localStream: null,
    cameraOff: false,
    gameStats: {
        points: 0,
        level: 1,
        streak: 0,
        questionsAsked: 0
    }
};

/**
 * Initialize call screen
 */
async function initializeCallScreen() {
    console.log('🚀 Initializing call screen...');
    
    // Get tutor from sessionStorage
    const tutorData = sessionStorage.getItem('currentTutor');
    
    if (!tutorData) {
        alert('No tutor selected. Redirecting to home...');
        window.location.href = 'index.html';
        return;
    }

    callState.tutor = JSON.parse(tutorData);
    console.log('✅ Tutor loaded:', callState.tutor);
    
    // Set tutor name
    const tutorNameEl = document.getElementById('tutor-name');
    if (tutorNameEl) {
        tutorNameEl.textContent = callState.tutor.name;
    }

    // Initialize components
    avatarController.init();
    avatarController.setTutor(callState.tutor.name);

    // Select voice for speech
    speechService.selectVoice(callState.tutor.name);

    // Request media permissions
    await requestMediaPermissions();

    // Start timer
    callState.startTime = Date.now();
    callState.timerInterval = setInterval(() => {
        UIHelpers.updateTimer(callState.startTime);
    }, 1000);

    // Start speech recognition
    if (speechService.isRecognitionAvailable()) {
        speechService.onResult((transcript) => {
            console.log('🎤 Speech recognized:', transcript);
            UIHelpers.addMessage(transcript, 'user');
            handleUserQuery(transcript);
        });
        
        // Start recognition
        setTimeout(() => {
            speechService.start();
            console.log('✅ Speech recognition started');
        }, 1000);
    } else {
        console.warn('⚠️ Speech recognition not available');
        UIHelpers.addMessage('Voice recognition not available in your browser. You can still type questions!', 'system');
    }

    // Setup event listeners
    setupEventListeners();

    // Welcome message
    setTimeout(() => {
        const welcomeMsg = `Hello! I'm ${callState.tutor.name}, your AI tutor specializing in ${callState.tutor.specialty}. What would you like to learn or understand today?`;
        UIHelpers.addMessage(welcomeMsg, 'tutor');
        
        speechService.speak(
            welcomeMsg,
            () => avatarController.startSpeaking(),
            () => avatarController.stopSpeaking()
        );
    }, 2000);

    // Initialize mode controller
    if (typeof modeController !== 'undefined') {
        console.log('🎮 Initializing mode controller...');
        modeController.init();
    }

    // Initialize captions
    if (typeof captionSystem !== 'undefined') {
        console.log('📝 Initializing caption system...');
        captionSystem.init();
    }

    // Initialize whiteboard - FIXED WITH ULTRA-SIMPLE LOGIC
    if (typeof whiteboardManager !== 'undefined') {
        setTimeout(() => {
            console.log('🎨 Initializing ultra-simple whiteboard...');
            whiteboardManager.init();
        }, 1500);
    }

    // Initialize notes
    if (typeof notesManager !== 'undefined') {
        setTimeout(() => {
            console.log('📓 Initializing notes manager...');
            notesManager.init();
        }, 1500);
    }

    console.log('✅ Call screen initialization complete!');
}

/**
 * Request camera and microphone permissions
 */
async function requestMediaPermissions() {
    const localVideo = document.getElementById('local-video');
    const videoPlaceholder = document.getElementById('video-placeholder');

    try {
        console.log('📷 Requesting media permissions...');
        callState.localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });

        console.log('✅ Media permissions granted');
        localVideo.srcObject = callState.localStream;
        if (videoPlaceholder) {
            videoPlaceholder.style.display = 'none';
        }
    } catch (error) {
        console.error('❌ Media access error:', error);
        UIHelpers.addMessage(
            'Could not access camera/microphone. You can still type questions!',
            'system'
        );
    }
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    console.log('🔧 Setting up event listeners...');
    
    // Chat form submit
    const chatForm = document.getElementById('chat-form');
    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = document.getElementById('chat-input');
            const question = input.value.trim();
            
            if (question) {
                console.log('💬 User typed:', question);
                UIHelpers.addMessage(question, 'user');
                handleUserQuery(question);
                input.value = '';
            }
        });
        console.log('✅ Chat form listener added');
    }

    // Stop speaking button
    const stopSpeakingBtn = document.getElementById('stop-speaking-btn');
    if (stopSpeakingBtn) {
        stopSpeakingBtn.addEventListener('click', () => {
            console.log('🔇 Stop speaking clicked');
            speechService.stopSpeaking();
            avatarController.stopSpeaking();
        });
    }

    // Toggle camera button
    const toggleCameraBtn = document.getElementById('toggle-camera-btn');
    if (toggleCameraBtn) {
        toggleCameraBtn.addEventListener('click', toggleCamera);
    }

    // Toggle captions button
    const toggleCaptionsBtn = document.getElementById('toggle-captions-btn');
    if (toggleCaptionsBtn) {
        toggleCaptionsBtn.addEventListener('click', () => {
            if (typeof captionSystem !== 'undefined') {
                captionSystem.toggle();
            }
        });
    }

    // End call button
    const endCallBtn = document.getElementById('end-call-btn');
    if (endCallBtn) {
        endCallBtn.addEventListener('click', endCall);
    }
    
    console.log('✅ All event listeners set up');
}

/**
 * Handle user query
 */
async function handleUserQuery(query) {
    console.log('🤔 Handling user query:', query);
    UIHelpers.addMessage('', 'tutor', true);

    // Show user query in captions
    if (typeof captionSystem !== 'undefined' && captionSystem.captionsEnabled) {
        captionSystem.showCaption(`You: ${query}`, 3000);
    }

    // Update game stats
    callState.gameStats.questionsAsked++;
    callState.gameStats.points += 10;

    if (callState.gameStats.questionsAsked % 5 === 0) {
        callState.gameStats.level++;
        UIHelpers.showAchievement(`Level Up! You're now Level ${callState.gameStats.level}!`);
    }

    UIHelpers.updateStats(callState.gameStats);

    try {
        console.log('📡 Calling backend API...');
        // Call backend API
        const response = await api.generateResponse(
            query,
            callState.tutor.name,
            callState.gameStats
        );

        console.log('✅ API response received:', response);

        if (response.success && response.response) {
            UIHelpers.updateLastMessage(response.response);
            
            // Show AI response in captions
            if (typeof captionSystem !== 'undefined' && captionSystem.captionsEnabled) {
                captionSystem.showCaption(response.response, 8000);
            }
            
            // Speak response (cleaned automatically in speech.js)
            speechService.speak(
                response.response,
                () => avatarController.startSpeaking(),
                () => avatarController.stopSpeaking()
            );
        } else {
            throw new Error('Invalid response from server');
        }

    } catch (error) {
        console.error('❌ Error getting AI response:', error);
        const errorMsg = "I had trouble getting that answer. Please check the backend server and try again!";
        UIHelpers.updateLastMessage(errorMsg);
        speechService.speak(
            errorMsg,
            () => avatarController.startSpeaking(),
            () => avatarController.stopSpeaking()
        );
    }
}

/**
 * Toggle camera
 */
function toggleCamera() {
    if (!callState.localStream) return;

    callState.cameraOff = !callState.cameraOff;
    
    callState.localStream.getVideoTracks().forEach(track => {
        track.enabled = !callState.cameraOff;
    });

    const videoPlaceholder = document.getElementById('video-placeholder');
    if (videoPlaceholder) {
        videoPlaceholder.style.display = callState.cameraOff ? 'flex' : 'none';
    }

    const toggleBtn = document.getElementById('toggle-camera-btn');
    if (toggleBtn && typeof lucide !== 'undefined') {
        toggleBtn.innerHTML = callState.cameraOff 
            ? '<i data-lucide="video-off" class="w-6 h-6"></i>'
            : '<i data-lucide="video" class="w-6 h-6"></i>';
        lucide.createIcons();
    }
}

/**
 * End call and return to home
 */
function endCall() {
    console.log('👋 Ending call...');
    
    // Stop speech
    speechService.stopSpeaking();
    speechService.stop();

    // Stop camera
    if (callState.localStream) {
        callState.localStream.getTracks().forEach(track => track.stop());
    }

    // Clear timer
    if (callState.timerInterval) {
        clearInterval(callState.timerInterval);
    }

    // Redirect to home
    window.location.href = 'index.html';
}

// Make function available globally
window.initializeCallScreen = initializeCallScreen;

console.log('✅ call.js loaded - ultra-simple whiteboard ready!');
