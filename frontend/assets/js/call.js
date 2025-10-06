/**
 * YoLearn.ai v5.1 - Call.js
 * ✅ FIXED: No more scary arm movements!
 * ✅ Natural animations: mouth + subtle head movement ONLY
 */

// ============================================
// ENVIRONMENT DETECTION & API CONFIGURATION
// ============================================

const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname.includes('192.168');

const API_BASE_URL = isDevelopment 
    ? 'http://localhost:5000'
    : 'https://ai-tutor-platform-7vte.onrender.com';

const API_URL = `${API_BASE_URL}/api/chat`;

console.log('🌍 Environment:', isDevelopment ? 'Development' : 'Production');
console.log('🔗 API URL:', API_URL);

// ============================================
// GLOBAL VARIABLES
// ============================================

let scene, camera, renderer, avatar, mixer, clock;
let isListening = false;
let recognition;
let isContinuousListening = true;
let currentTutor = { 
    name: 'Alex', 
    specialty: 'Math, Science & Technology Expert', 
    emoji: '👨‍🏫',
    avatarUrl: 'https://models.readyplayer.me/68e3549ab7446b1aad116ab5.glb',
    voiceGender: 'male',
    voicePitch: 1.0,
    voiceRate: 1.0
};
let currentUtterance = null;
let isSpeaking = false;

// ✅ SIMPLIFIED: Only head for animations
let avatarHead = null;
let morphTargetInfluences = null;

// Webcam
let isCameraOn = true;
let isMicOn = true;
let webcamStream = null;

// Recording
let displayStream = null;
let audioContext = null;
let destination = null;
let mediaRecorder, recordedChunks = [], isRecording = false;

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================
window.addEventListener('DOMContentLoaded', async () => {
    console.log('✅ YoLearn.ai v5.1 initialized!');
    await loadTutorInfo();
    init3DAvatar();
    startWebcam();
    startTimer();
    setupVoiceRecognition();
    initResizer();
    initDraggableWebcam();
});

// ============================================
// LOAD TUTOR INFORMATION
// ============================================
async function loadTutorInfo() {
    const tutor = JSON.parse(sessionStorage.getItem('currentTutor') || '{}');
    const roomId = sessionStorage.getItem('currentRoomId') || 'room_' + Date.now();
    
    if (tutor.name && tutor.id) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/tutors/${tutor.id}`);
            const data = await response.json();
            
            if (data.success && data.tutor) {
                currentTutor = data.tutor;
                console.log('✅ Tutor loaded:', currentTutor.name);
            } else {
                currentTutor = tutor;
            }
        } catch (error) {
            console.error('❌ Error loading tutor:', error);
            currentTutor = tutor;
        }
        
        document.getElementById('tutor-name').textContent = currentTutor.name;
        document.getElementById('tutor-specialty').textContent = currentTutor.specialty;
        document.getElementById('tutor-emoji').textContent = currentTutor.emoji;
        document.getElementById('tutor-emoji-msg').textContent = currentTutor.emoji;
        document.getElementById('welcome-msg').textContent = 
            `Hello! I'm ${currentTutor.name}, specializing in ${currentTutor.specialty}. What would you like to learn?`;
    }
    
    document.getElementById('room-id').textContent = roomId;
}

// ============================================
// RESIZABLE PANELS
// ============================================
function initResizer() {
    const resizer = document.getElementById('resizer');
    const leftPanel = document.getElementById('left-panel');
    
    if (!resizer || !leftPanel) return;
    
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
        
        const minWidth = containerWidth * 0.25;
        const maxWidth = containerWidth * 0.70;
        
        if (newWidth >= minWidth && newWidth <= maxWidth) {
            leftPanel.style.width = `${newWidth}px`;
            
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
// DRAGGABLE WEBCAM
// ============================================
function initDraggableWebcam() {
    const webcamContainer = document.getElementById('webcam-container');
    if (!webcamContainer) return;
    
    let isDragging = false;
    let currentX = 0;
    let currentY = 0;
    let initialX = 0;
    let initialY = 0;
    let xOffset = 0;
    let yOffset = 0;

    webcamContainer.addEventListener('mousedown', dragStart, { passive: false });
    document.addEventListener('mousemove', drag, { passive: false });
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
        if (e.target.classList.contains('webcam-control-btn')) return;
        
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
        isDragging = true;
        webcamContainer.style.cursor = 'grabbing';
        webcamContainer.style.willChange = 'transform';
    }

    function drag(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        
        requestAnimationFrame(() => {
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            xOffset = currentX;
            yOffset = currentY;
            
            webcamContainer.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        });
    }

    function dragEnd() {
        isDragging = false;
        webcamContainer.style.cursor = 'grab';
        webcamContainer.style.willChange = 'auto';
    }
}

// ============================================
// CAMERA & MIC TOGGLES
// ============================================
function toggleCamera() {
    const video = document.getElementById('user-video');
    const cameraBtn = document.getElementById('camera-btn');
    
    if (!video || !webcamStream) return;
    
    isCameraOn = !isCameraOn;
    
    webcamStream.getVideoTracks().forEach(track => {
        track.enabled = isCameraOn;
    });
    
    if (cameraBtn) {
        cameraBtn.innerHTML = isCameraOn 
            ? '<i class="fas fa-video"></i>' 
            : '<i class="fas fa-video-slash"></i>';
        cameraBtn.classList.toggle('off', !isCameraOn);
    }
    
    console.log('📹 Camera:', isCameraOn ? 'ON' : 'OFF');
}

function toggleMic() {
    const micBtn = document.getElementById('mic-btn');
    
    if (!webcamStream) return;
    
    isMicOn = !isMicOn;
    
    webcamStream.getAudioTracks().forEach(track => {
        track.enabled = isMicOn;
    });
    
    if (micBtn) {
        micBtn.innerHTML = isMicOn 
            ? '<i class="fas fa-microphone"></i>' 
            : '<i class="fas fa-microphone-slash"></i>';
        micBtn.classList.toggle('off', !isMicOn);
    }
    
    console.log('🎤 Mic:', isMicOn ? 'ON' : 'OFF');
}

// ============================================
// ✅ FIXED: 3D AVATAR WITH NATURAL ANIMATIONS
// ============================================
function init3DAvatar() {
    const container = document.getElementById('avatar-container');
    if (!container) return;
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1e293b);
    
    camera = new THREE.PerspectiveCamera(
        35, 
        container.clientWidth / container.clientHeight, 
        0.1, 
        1000
    );
    camera.position.set(0, 1.6, 2.5);
    camera.lookAt(0, 1.5, 0);
    
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(2, 3, 2);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    const fillLight = new THREE.DirectionalLight(0x9370DB, 0.4);
    fillLight.position.set(-2, 1, -1);
    scene.add(fillLight);
    
    const loader = new THREE.GLTFLoader();
    const avatarURL = currentTutor.avatarUrl || 'https://models.readyplayer.me/68e3549ab7446b1aad116ab5.glb';
    
    console.log('🔄 Loading avatar from:', avatarURL);
    
    loader.load(
        avatarURL,
        (gltf) => {
            avatar = gltf.scene;
            avatar.position.set(0, 0, 0);
            avatar.scale.set(1, 1, 1);
            scene.add(avatar);
            
            // ✅ ONLY find head and morph targets - NO ARMS!
            avatar.traverse((node) => {
                // Facial expressions only
                if (node.isMesh && node.morphTargetInfluences) {
                    morphTargetInfluences = node.morphTargetInfluences;
                    console.log('✅ Morph targets found:', node.morphTargetInfluences.length);
                }
                
                // Head bone for subtle nods
                if (node.isBone && node.name.toLowerCase().includes('head')) {
                    avatarHead = node;
                    console.log('✅ Head bone found');
                }
            });
            
            if (gltf.animations && gltf.animations.length) {
                mixer = new THREE.AnimationMixer(avatar);
                const action = mixer.clipAction(gltf.animations[0]);
                action.play();
                console.log('✅ Animations loaded');
            }
            
            console.log('✅ Avatar loaded successfully!');
        },
        (progress) => {
            const percent = (progress.loaded / progress.total * 100).toFixed(0);
            console.log(`⏳ Loading: ${percent}%`);
        },
        (error) => {
            console.error('❌ Avatar error:', error);
        }
    );
    
    clock = new THREE.Clock();
    
    // ✅ FIXED RENDER LOOP
    function animate() {
        requestAnimationFrame(animate);
        
        const delta = clock.getDelta();
        
        if (mixer) mixer.update(delta);
        
        // ✅ IDLE: Very subtle breathing only
        if (avatar && !isSpeaking) {
            const time = Date.now() * 0.0002;
            avatar.position.y = Math.sin(time * 2) * 0.005; // Tiny breathing
        }
        
        // ✅ SPEAKING: Mouth + tiny head nod ONLY
        if (isSpeaking) {
            const time = Date.now() * 0.008;
            
            // Mouth animation
            if (morphTargetInfluences && morphTargetInfluences.length > 0) {
                const openAmount = (Math.sin(time * 2) + 1) * 0.25;
                morphTargetInfluences[0] = openAmount;
            }
            
            // Tiny head nod
            if (avatarHead) {
                avatarHead.rotation.x = Math.sin(time * 0.5) * 0.03; // Very small
                avatarHead.rotation.y = Math.sin(time * 0.3) * 0.02; // Very small
            }
        } else {
            // Close mouth when not speaking
            if (morphTargetInfluences && morphTargetInfluences.length > 0) {
                for (let i = 0; i < morphTargetInfluences.length; i++) {
                    morphTargetInfluences[i] *= 0.95; // Smooth fade
                }
            }
            
            // Reset head
            if (avatarHead) {
                avatarHead.rotation.x *= 0.95;
                avatarHead.rotation.y *= 0.95;
            }
        }
        
        renderer.render(scene, camera);
    }
    animate();
    
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
        webcamStream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 200, height: 150 }, 
            audio: true
        });
        
        const video = document.getElementById('user-video');
        if (video) {
            video.srcObject = webcamStream;
        }
        
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
        const timer = document.getElementById('timer');
        if (timer) timer.textContent = `${h}:${m}:${s}`;
    }, 1000);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function copyRoomId() {
    const id = document.getElementById('room-id').textContent;
    navigator.clipboard.writeText(id)
        .then(() => alert('✅ Room ID copied!'))
        .catch(() => alert('❌ Failed to copy'));
}

function toggleMenu() {
    const menu = document.getElementById('dropdown-menu');
    if (menu) menu.classList.toggle('active');
}

// ============================================
// WHITEBOARD & NOTES
// ============================================
function openWhiteboard() {
    const notesPanel = document.getElementById('notes-panel');
    if (notesPanel) notesPanel.classList.remove('active');
    
    const whiteboardPanel = document.getElementById('whiteboard-panel');
    if (whiteboardPanel) {
        whiteboardPanel.classList.add('active');
        if (typeof initWhiteboard === 'function') initWhiteboard();
    }
    toggleMenu();
}

function closeWhiteboard() {
    const whiteboardPanel = document.getElementById('whiteboard-panel');
    if (whiteboardPanel) whiteboardPanel.classList.remove('active');
}

function openNotes() {
    const whiteboardPanel = document.getElementById('whiteboard-panel');
    if (whiteboardPanel) whiteboardPanel.classList.remove('active');
    
    const notesPanel = document.getElementById('notes-panel');
    if (notesPanel) {
        notesPanel.classList.add('active');
        if (typeof initNotes === 'function') initNotes();
    }
    toggleMenu();
}

function closeNotes() {
    const notesPanel = document.getElementById('notes-panel');
    if (notesPanel) notesPanel.classList.remove('active');
}

function toggleChat() { 
    alert('💬 Chat is already active!'); 
    toggleMenu(); 
}

// ============================================
// SEND MESSAGE
// ============================================
async function sendMessage() {
    const input = document.getElementById('message-input');
    if (!input) return;
    
    const message = input.value.trim();
    if (!message) return;
    
    addMessage(message, 'user');
    input.value = '';
    
    const typingDiv = showTypingIndicator();
    
    try {
        const response = await fetch(API_URL, {
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
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        typingDiv.remove();
        
        if (data.success) {
            addMessage(data.response, 'tutor');
            speak(data.cleanedResponse || data.response, {
                gender: data.voiceGender || currentTutor.voiceGender,
                pitch: data.voicePitch || currentTutor.voicePitch,
                rate: data.voiceRate || currentTutor.voiceRate
            });
        } else {
            addMessage('Sorry, I encountered an error.', 'tutor');
        }
    } catch (error) {
        console.error('❌ API Error:', error);
        typingDiv.remove();
        addMessage('Connection error. Please try again.', 'tutor');
    }
}

// ============================================
// ADD MESSAGE
// ============================================
function addMessage(text, type) {
    const messagesDiv = document.getElementById('messages');
    if (!messagesDiv) return;
    
    const wrapper = document.createElement('div');
    wrapper.className = `message-wrapper ${type}`;
    
    const formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
    
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
// TEXT-TO-SPEECH
// ============================================
function speak(text, voiceSettings = {}) {
    if (!('speechSynthesis' in window)) return;
    
    if (currentUtterance || speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }
    
    setTimeout(() => {
        currentUtterance = new SpeechSynthesisUtterance(text);
        
        const voices = speechSynthesis.getVoices();
        const gender = voiceSettings.gender || 'male';
        
        let selectedVoice;
        if (gender === 'female') {
            selectedVoice = voices.find(v => 
                v.name.includes('Female') || 
                v.name.includes('Samantha')
            );
        } else {
            selectedVoice = voices.find(v => 
                v.name.includes('Male') || 
                v.name.includes('Daniel')
            );
        }
        
        if (selectedVoice) currentUtterance.voice = selectedVoice;
        
        currentUtterance.rate = voiceSettings.rate || 1.0;
        currentUtterance.pitch = voiceSettings.pitch || 1.0;
        currentUtterance.volume = 1.0;
        currentUtterance.lang = 'en-US';
        
        const stopBtn = document.getElementById('stop-btn');
        if (stopBtn) stopBtn.classList.add('active');
        
        currentUtterance.onstart = () => {
            isSpeaking = true;
        };
        
        currentUtterance.onend = () => {
            isSpeaking = false;
            currentUtterance = null;
            if (stopBtn) stopBtn.classList.remove('active');
        };
        
        currentUtterance.onerror = () => {
            isSpeaking = false;
            currentUtterance = null;
            if (stopBtn) stopBtn.classList.remove('active');
        };
        
        speechSynthesis.speak(currentUtterance);
    }, 100);
}

// ============================================
// STOP SPEAKING
// ============================================
function stopSpeaking() {
    if (speechSynthesis.speaking) speechSynthesis.cancel();
    isSpeaking = false;
    currentUtterance = null;
    
    const stopBtn = document.getElementById('stop-btn');
    if (stopBtn) stopBtn.classList.remove('active');
}

// ============================================
// VOICE RECOGNITION
// ============================================
function setupVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event) => {
        const lastResult = event.results[event.results.length - 1];
        
        if (lastResult.isFinal) {
            const transcript = lastResult[0].transcript.trim();
            
            if (transcript.length > 0) {
                const input = document.getElementById('message-input');
                if (input) {
                    input.value = transcript;
                    input.style.color = 'white';
                    sendMessage();
                }
            }
        } else {
            const transcript = lastResult[0].transcript;
            const input = document.getElementById('message-input');
            if (input && transcript.length > 0) {
                input.value = transcript;
                input.style.color = '#9ca3af';
            }
        }
    };
    
    recognition.onerror = (event) => {
        if (event.error !== 'aborted' && event.error !== 'no-speech') {
            setTimeout(() => {
                if (isContinuousListening) {
                    try { recognition.start(); } catch (e) {}
                }
            }, 1000);
        }
    };
    
    recognition.onend = () => {
        if (isContinuousListening) {
            setTimeout(() => {
                try { recognition.start(); } catch (e) {}
            }, 500);
        }
    };
    
    try {
        recognition.start();
        isListening = true;
        console.log('🎤 Voice recognition started');
    } catch (error) {
        console.error('❌ Voice error:', error);
    }
}

// ============================================
// RECORDING
// ============================================
function toggleRecording() {
    if (!isRecording) {
        startRecording();
    } else {
        stopRecording();
    }
}

async function startRecording() {
    try {
        displayStream = await navigator.mediaDevices.getDisplayMedia({
            video: { width: 1920, height: 1080, frameRate: 30 },
            audio: true
        });
        
        const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        destination = audioContext.createMediaStreamDestination();
        
        if (displayStream.getAudioTracks().length > 0) {
            const screenAudio = audioContext.createMediaStreamSource(displayStream);
            screenAudio.connect(destination);
        }
        
        const micAudio = audioContext.createMediaStreamSource(micStream);
        micAudio.connect(destination);
        
        const combinedStream = new MediaStream([
            ...displayStream.getVideoTracks(),
            ...destination.stream.getAudioTracks()
        ]);
        
        mediaRecorder = new MediaRecorder(combinedStream, {
            mimeType: 'video/webm;codecs=vp9,opus'
        });
        
        recordedChunks = [];
        
        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) recordedChunks.push(e.data);
        };
        
        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `yolearn-${Date.now()}.webm`;
            a.click();
            URL.revokeObjectURL(url);
        };
        
        mediaRecorder.start();
        isRecording = true;
        
        const recordText = document.getElementById('record-text');
        const recordBtn = document.getElementById('record-btn');
        if (recordText) recordText.textContent = 'Stop';
        if (recordBtn) recordBtn.classList.add('recording');
        
        console.log('🔴 Recording started');
    } catch (error) {
        console.error('❌ Recording error:', error);
        alert('Recording failed');
    }
}

function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        
        if (displayStream) {
            displayStream.getTracks().forEach(track => track.stop());
        }
        
        if (audioContext) audioContext.close();
        
        isRecording = false;
        
        const recordText = document.getElementById('record-text');
        const recordBtn = document.getElementById('record-btn');
        if (recordText) recordText.textContent = 'Record';
        if (recordBtn) recordBtn.classList.remove('recording');
        
        console.log('⏹️ Recording stopped');
    }
}

// ============================================
// END SESSION
// ============================================
function endSession() {
    if (confirm('End learning session?')) {
        if (speechSynthesis.speaking) speechSynthesis.cancel();
        if (isRecording) stopRecording();
        if (recognition) {
            isContinuousListening = false;
            recognition.stop();
        }
        window.location.href = 'index.html';
    }
}

// ============================================
// EVENT LISTENERS
// ============================================
document.addEventListener('click', (e) => {
    const menu = document.getElementById('dropdown-menu');
    const btn = document.querySelector('.menu-btn');
    
    if (menu && !menu.contains(e.target) && e.target !== btn) {
        menu.classList.remove('active');
    }
});

document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') sendMessage();
    if (e.key === 'Escape' && isSpeaking) stopSpeaking();
});

console.log('✅ YoLearn.ai v5.1 ready! 🎓');
