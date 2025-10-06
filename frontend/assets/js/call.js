/**
 * YoLearn.ai v2.0 - Call.js
 * Complete JavaScript for Learning Session
 * Features: 3D Avatar, Voice Control, Resizable Panels, Animations
 */

const AVATAR_URL = 'https://models.readyplayer.me/68e3549ab7446b1aad116ab5.glb';
const API_URL = 'http://localhost:5000';

// Global variables
let scene, camera, renderer, avatar, mixer, clock;
let isListening = false;
let recognition;
let currentTutor = { name: 'Alex', specialty: 'Math, Science & Technology Expert', emoji: '👨‍🏫' };
let currentUtterance = null; // For speech control
let isSpeaking = false;
let avatarHead = null; // For mouth animation
let morphTargetInfluences = null;

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================
window.addEventListener('DOMContentLoaded', () => {
    loadTutorInfo();
    init3DAvatar();
    startWebcam();
    startTimer();
    setupVoiceRecognition();
    initResizer(); // NEW: Resizable panels
});

// ============================================
// LOAD TUTOR INFORMATION
// ============================================
function loadTutorInfo() {
    const tutor = JSON.parse(sessionStorage.getItem('currentTutor') || '{}');
    const roomId = sessionStorage.getItem('currentRoomId') || 'room_' + Date.now();
    
    if (tutor.name) {
        currentTutor = tutor;
        document.getElementById('tutor-name').textContent = tutor.name;
        document.getElementById('tutor-specialty').textContent = tutor.specialty;
        document.getElementById('tutor-emoji').textContent = tutor.emoji;
        document.getElementById('tutor-emoji-msg').textContent = tutor.emoji;
        document.getElementById('welcome-msg').textContent = 
            `Hello! I'm ${tutor.name}, specializing in ${tutor.specialty}. What would you like to learn?`;
    }
    document.getElementById('room-id').textContent = roomId;
    console.log('✅ Tutor info loaded:', currentTutor.name);
}

// ============================================
// RESIZABLE PANELS (NEW FEATURE!)
// ============================================
function initResizer() {
    const resizer = document.getElementById('resizer');
    const leftPanel = document.getElementById('left-panel');
    let isResizing = false;
    let startX = 0;
    let startWidth = 0;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startWidth = leftPanel.offsetWidth;
        resizer.classList.add('resizing');
        document.body.style.cursor = 'ew-resize';
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        
        const deltaX = e.clientX - startX;
        const newWidth = startWidth + deltaX;
        const containerWidth = window.innerWidth;
        
        // Limit width between 25% and 70%
        const minWidth = containerWidth * 0.25;
        const maxWidth = containerWidth * 0.70;
        
        if (newWidth >= minWidth && newWidth <= maxWidth) {
            leftPanel.style.width = `${newWidth}px`;
            
            // Update renderer size
            if (renderer && camera) {
                const container = document.getElementById('avatar-container');
                camera.aspect = container.clientWidth / container.clientHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(container.clientWidth, container.clientHeight);
            }
        }
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            resizer.classList.remove('resizing');
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    });
}

// ============================================
// 3D AVATAR WITH THREE.JS + ANIMATIONS
// ============================================
function init3DAvatar() {
    const container = document.getElementById('avatar-container');
    
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e293b);
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(
        35, 
        container.clientWidth / container.clientHeight, 
        0.1, 
        1000
    );
    camera.position.set(0, 1.6, 2.5);
    camera.lookAt(0, 1.5, 0);
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(2, 3, 2);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    const fillLight = new THREE.DirectionalLight(0x9370DB, 0.4);
    fillLight.position.set(-2, 1, -1);
    scene.add(fillLight);
    
    // Load avatar
    const loader = new THREE.GLTFLoader();
    console.log('🔄 Loading avatar from:', AVATAR_URL);
    
    loader.load(
        AVATAR_URL,
        (gltf) => {
            avatar = gltf.scene;
            avatar.position.set(0, 0, 0);
            avatar.scale.set(1, 1, 1);
            scene.add(avatar);
            
            // Find head for mouth animation
            avatar.traverse((node) => {
                if (node.isMesh && node.morphTargetInfluences) {
                    avatarHead = node;
                    morphTargetInfluences = node.morphTargetInfluences;
                    console.log('✅ Found morph targets:', node.morphTargetDictionary);
                }
            });
            
            // Setup animations
            if (gltf.animations && gltf.animations.length) {
                mixer = new THREE.AnimationMixer(avatar);
                const action = mixer.clipAction(gltf.animations[0]);
                action.play();
                console.log('✅ Animations loaded:', gltf.animations.length);
            }
            
            console.log('✅ Avatar loaded successfully!');
        },
        (progress) => {
            const percent = (progress.loaded / progress.total * 100).toFixed(0);
            console.log(`⏳ Loading avatar: ${percent}%`);
        },
        (error) => {
            console.error('❌ Avatar loading error:', error);
        }
    );
    
    // Animation clock
    clock = new THREE.Clock();
    
    // Render loop
    function animate() {
        requestAnimationFrame(animate);
        
        const delta = clock.getDelta();
        
        // Update mixer
        if (mixer) mixer.update(delta);
        
        // Idle animation (gentle sway)
        if (avatar && !isSpeaking) {
            const time = Date.now() * 0.0005;
            avatar.rotation.y = Math.sin(time) * 0.05;
            avatar.position.y = Math.sin(time * 2) * 0.01;
        }
        
        // Mouth animation while speaking
        if (isSpeaking && morphTargetInfluences) {
            const time = Date.now() * 0.01;
            const openAmount = (Math.sin(time) + 1) * 0.3; // 0 to 0.6
            
            // Animate mouth open morph target (usually index 0)
            if (morphTargetInfluences.length > 0) {
                morphTargetInfluences[0] = openAmount;
            }
        } else if (morphTargetInfluences && morphTargetInfluences.length > 0) {
            // Close mouth when not speaking
            morphTargetInfluences[0] = 0;
        }
        
        renderer.render(scene, camera);
    }
    animate();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
    });
}

// ============================================
// WEBCAM SETUP
// ============================================
async function startWebcam() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 200, height: 150 }, 
            audio: false 
        });
        document.getElementById('user-video').srcObject = stream;
        console.log('✅ Webcam started');
    } catch(error) {
        console.error('❌ Webcam error:', error);
    }
}

// ============================================
// SESSION TIMER
// ============================================
let seconds = 0;
function startTimer() {
    setInterval(() => {
        seconds++;
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        document.getElementById('timer').textContent = `${h}:${m}:${s}`;
    }, 1000);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function copyRoomId() {
    const id = document.getElementById('room-id').textContent;
    navigator.clipboard.writeText(id)
        .then(() => alert('✅ Room ID copied to clipboard!'))
        .catch(() => alert('❌ Failed to copy'));
}

function toggleMenu() {
    const menu = document.getElementById('dropdown-menu');
    menu.classList.toggle('active');
}

function openWhiteboard() { 
    alert('📝 Whiteboard feature coming soon!'); 
    toggleMenu(); 
}

function openNotes() { 
    alert('📄 Notes feature coming soon!'); 
    toggleMenu(); 
}

function toggleChat() { 
    alert('💬 Chat is already active!'); 
    toggleMenu(); 
}

// ============================================
// SEND MESSAGE TO BACKEND
// ============================================
async function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addMessage(message, 'user');
    input.value = '';
    
    // Show typing indicator
    const typingDiv = showTypingIndicator();
    
    try {
        console.log('📤 Sending message:', message);
        
        const response = await fetch(`${API_URL}/api/chat`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                tutor_name: currentTutor.name
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📥 Response received:', data);
        
        // Remove typing indicator
        typingDiv.remove();
        
        if (data.success) {
            addMessage(data.response, 'tutor');
            speak(data.cleanedResponse || data.response);
        } else {
            addMessage('Sorry, I encountered an error. Please try again.', 'tutor');
        }
    } catch (error) {
        console.error('❌ API Error:', error);
        typingDiv.remove();
        addMessage(
            'Connection error. Make sure the backend is running on http://localhost:5000', 
            'tutor'
        );
    }
}

// ============================================
// ADD MESSAGE TO CHAT
// ============================================
function addMessage(text, type) {
    const messagesDiv = document.getElementById('messages');
    const wrapper = document.createElement('div');
    wrapper.className = `message-wrapper ${type}`;
    
    // Format text (preserve line breaks and bullet points)
    const formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\n/g, '<br>'); // Line breaks
    
    if (type === 'user') {
        wrapper.innerHTML = `
            <div class="message-avatar">👤</div>
            <div class="message-bubble">${formattedText}</div>
        `;
    } else {
        wrapper.innerHTML = `
            <div class="message-avatar">${currentTutor.emoji}</div>
            <div class="message-bubble">${formattedText}</div>
        `;
    }
    
    messagesDiv.appendChild(wrapper);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// ============================================
// TYPING INDICATOR
// ============================================
function showTypingIndicator() {
    const messagesDiv = document.getElementById('messages');
    const wrapper = document.createElement('div');
    wrapper.className = 'message-wrapper';
    wrapper.innerHTML = `
        <div class="message-avatar">${currentTutor.emoji}</div>
        <div class="typing-indicator active">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    messagesDiv.appendChild(wrapper);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    return wrapper;
}

// ============================================
// TEXT-TO-SPEECH WITH ANIMATIONS
// ============================================
function speak(text) {
    if (!('speechSynthesis' in window)) {
        console.warn('⚠️ Text-to-speech not supported');
        return;
    }
    
    // FORCE STOP any existing speech first
    if (currentUtterance || speechSynthesis.speaking) {
        speechSynthesis.cancel();
        speechSynthesis.pause();
        setTimeout(() => speechSynthesis.cancel(), 0);
    }
    
    // Small delay to ensure previous speech is fully stopped
    setTimeout(() => {
        currentUtterance = new SpeechSynthesisUtterance(text);
        currentUtterance.rate = 1.0;
        currentUtterance.pitch = 1.0;
        currentUtterance.volume = 1.0;
        currentUtterance.lang = 'en-US';
        
        // Show stop button
        const stopBtn = document.getElementById('stop-btn');
        stopBtn.classList.add('active');
        
        // Start speaking animation
        currentUtterance.onstart = () => {
            isSpeaking = true;
            console.log('🗣️ Avatar started speaking');
        };
        
        // Stop speaking animation
        currentUtterance.onend = () => {
            isSpeaking = false;
            currentUtterance = null;
            stopBtn.classList.remove('active');
            
            // Close mouth
            if (morphTargetInfluences && morphTargetInfluences.length > 0) {
                morphTargetInfluences[0] = 0;
            }
            
            console.log('✅ Avatar finished speaking');
        };
        
        currentUtterance.onerror = (event) => {
            console.error('❌ Speech error:', event.error);
            isSpeaking = false;
            currentUtterance = null;
            stopBtn.classList.remove('active');
            
            // Close mouth
            if (morphTargetInfluences && morphTargetInfluences.length > 0) {
                morphTargetInfluences[0] = 0;
            }
        };
        
        // Start speaking
        speechSynthesis.speak(currentUtterance);
        
    }, 100); // 100ms delay ensures clean stop
}

// ============================================
// STOP SPEAKING (NEW FEATURE!)
// ============================================
function stopSpeaking() {
    // FORCE STOP - Multiple methods for instant termination
    if (speechSynthesis.speaking || speechSynthesis.pending) {
        // Method 1: Cancel immediately
        speechSynthesis.cancel();
        
        // Method 2: Pause first, then cancel (Chrome fix)
        speechSynthesis.pause();
        
        // Method 3: Clear the queue completely
        setTimeout(() => {
            speechSynthesis.cancel();
        }, 0);
    }
    
    // Reset all states
    isSpeaking = false;
    currentUtterance = null;
    
    // Hide stop button
    const stopBtn = document.getElementById('stop-btn');
    stopBtn.classList.remove('active');
    
    // Close avatar mouth immediately
    if (morphTargetInfluences && morphTargetInfluences.length > 0) {
        morphTargetInfluences[0] = 0;
    }
    
    console.log('🛑 Speech stopped INSTANTLY by user');
}

// ============================================
// VOICE RECOGNITION
// ============================================
function setupVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        console.warn('⚠️ Voice recognition not supported');
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('🎤 Voice input:', transcript);
        document.getElementById('message-input').value = transcript;
        sendMessage();
    };
    
    recognition.onerror = (event) => {
        console.error('❌ Voice recognition error:', event.error);
        isListening = false;
        document.getElementById('voice-btn').classList.remove('active');
    };
    
    recognition.onend = () => {
        isListening = false;
        document.getElementById('voice-btn').classList.remove('active');
    };
}

function toggleVoice() {
    if (!recognition) {
        alert('⚠️ Voice recognition not supported in your browser');
        return;
    }
    
    const voiceBtn = document.getElementById('voice-btn');
    
    if (isListening) {
        recognition.stop();
        isListening = false;
        voiceBtn.classList.remove('active');
        console.log('🎤 Voice input stopped');
    } else {
        try {
            recognition.start();
            isListening = true;
            voiceBtn.classList.add('active');
            console.log('🎤 Voice input started');
        } catch (error) {
            console.error('❌ Voice start error:', error);
        }
    }
}

// ============================================
// SCREEN RECORDING
// ============================================
let mediaRecorder, recordedChunks = [], isRecording = false;

function toggleRecording() {
    if (!isRecording) {
        startRecording();
    } else {
        stopRecording();
    }
}

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: true 
        });
        
        mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp9'
        });
        recordedChunks = [];
        
        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                recordedChunks.push(e.data);
            }
        };
        
        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `yolearn-session-${Date.now()}.webm`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            console.log('✅ Recording saved');
        };
        
        mediaRecorder.start();
        isRecording = true;
        
        document.getElementById('record-text').textContent = 'Stop Recording';
        document.getElementById('record-btn').classList.add('recording');
        
        console.log('🔴 Recording started');
    } catch (error) {
        console.error('❌ Recording error:', error);
        alert('Could not start recording. Please allow camera and microphone access.');
    }
}

function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        
        isRecording = false;
        document.getElementById('record-text').textContent = 'Start Recording';
        document.getElementById('record-btn').classList.remove('recording');
        
        console.log('⏹️ Recording stopped');
    }
}

// ============================================
// END SESSION
// ============================================
function endSession() {
    if (confirm('Are you sure you want to end this learning session?')) {
        // Stop any ongoing speech
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }
        
        // Stop any ongoing recording
        if (isRecording) {
            stopRecording();
        }
        
        // Redirect to home
        window.location.href = 'index.html';
    }
}

// ============================================
// CLOSE DROPDOWN MENU ON OUTSIDE CLICK
// ============================================
document.addEventListener('click', (e) => {
    const menu = document.getElementById('dropdown-menu');
    const btn = document.querySelector('.menu-btn');
    
    if (!menu.contains(e.target) && e.target !== btn) {
        menu.classList.remove('active');
    }
});

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to send message
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        sendMessage();
    }
    
    // Escape to stop speaking
    if (e.key === 'Escape' && isSpeaking) {
        stopSpeaking();
    }
});

console.log('✅ YoLearn.ai initialized successfully!');
