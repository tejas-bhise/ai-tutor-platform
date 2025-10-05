/**
 * Speech Recognition and Synthesis Service
 * Handles voice input and text-to-speech
 */

class SpeechService {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.onResultCallback = null;
        this.selectedVoice = null;
        this.currentUtterance = null;
        
        this.initRecognition();
        this.initVoices();
    }

    /**
     * Initialize speech recognition
     */
    initRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.warn('Speech recognition not supported');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event) => {
            const last = event.results.length - 1;
            const transcript = event.results[last][0].transcript.trim();
            
            console.log('Speech recognized:', transcript);
            
            if (this.onResultCallback) {
                this.onResultCallback(transcript);
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            
            if (event.error === 'no-speech') {
                console.log('No speech detected, continuing to listen...');
            } else if (event.error === 'audio-capture') {
                console.error('No microphone found');
            } else if (event.error === 'not-allowed') {
                console.error('Microphone permission denied');
            }
        };

        this.recognition.onend = () => {
            console.log('Speech recognition ended');
            if (this.isListening) {
                console.log('Restarting recognition...');
                try {
                    this.recognition.start();
                } catch (error) {
                    console.error('Error restarting recognition:', error);
                }
            }
        };

        console.log('Speech recognition initialized');
    }

    /**
     * Initialize available voices
     */
    initVoices() {
        const loadVoices = () => {
            const voices = this.synthesis.getVoices();
            console.log('Available voices:', voices.length);
            
            // Try to select a good English voice
            this.selectedVoice = voices.find(voice => 
                voice.lang.startsWith('en') && 
                (voice.name.includes('Google') || voice.name.includes('Microsoft'))
            ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
            
            if (this.selectedVoice) {
                console.log('Selected voice:', this.selectedVoice.name);
            }
        };

        loadVoices();
        
        if (this.synthesis.onvoiceschanged !== undefined) {
            this.synthesis.onvoiceschanged = loadVoices;
        }
    }

    /**
     * Select voice based on tutor name
     */
    selectVoice(tutorName) {
        const voices = this.synthesis.getVoices();
        
        if (tutorName === 'Alex') {
            // Male voice for Alex
            this.selectedVoice = voices.find(voice => 
                voice.lang.startsWith('en') && 
                (voice.name.includes('Male') || voice.name.includes('David') || voice.name.includes('George'))
            ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
        } else {
            // Female voice for Sophia
            this.selectedVoice = voices.find(voice => 
                voice.lang.startsWith('en') && 
                (voice.name.includes('Female') || voice.name.includes('Samantha') || voice.name.includes('Victoria'))
            ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
        }
        
        console.log('Voice selected for', tutorName, ':', this.selectedVoice?.name);
    }

    /**
     * Start listening to user speech
     */
    start() {
        if (!this.recognition) {
            console.warn('Speech recognition not available');
            return false;
        }

        try {
            this.isListening = true;
            this.recognition.start();
            console.log('Started listening...');
            return true;
        } catch (error) {
            console.error('Error starting recognition:', error);
            return false;
        }
    }

    /**
     * Stop listening to user speech
     */
    stop() {
        if (this.recognition && this.isListening) {
            this.isListening = false;
            this.recognition.stop();
            console.log('Stopped listening');
        }
    }

    /**
     * Set callback for speech results
     */
    onResult(callback) {
        this.onResultCallback = callback;
    }

    /**
     * Check if speech recognition is available
     */
    isRecognitionAvailable() {
        return !!this.recognition;
    }

    /**
     * Check if speech synthesis is available
     */
    isSpeechAvailable() {
        return !!this.synthesis;
    }

    /**
     * Speak text with cleaned output (removes asterisks and special symbols)
     */
    speak(text, onStart = null, onEnd = null) {
        this.stopSpeaking();
        
        if (!this.isSpeechAvailable()) {
            console.warn('Speech synthesis not available');
            if (onEnd) onEnd();
            return;
        }

        // Clean text for natural speech (remove special symbols and formatting)
        const cleanText = text
            .replace(/\*/g, '')  // Remove asterisks
            .replace(/\#/g, '')  // Remove hashtags
            .replace(/\_/g, '')  // Remove underscores
            .replace(/\~/g, '')  // Remove tildes
            .replace(/\`/g, '')  // Remove backticks
            .replace(/\[/g, '')  // Remove square brackets
            .replace(/\]/g, '')
            .replace(/\(/g, '')  // Remove parentheses
            .replace(/\)/g, '')
            .replace(/\{/g, '')  // Remove curly braces
            .replace(/\}/g, '')
            .replace(/\|/g, '')  // Remove pipes
            .replace(/\>/g, '')  // Remove greater than
            .replace(/\</g, '')  // Remove less than
            .replace(/\•/g, '')  // Remove bullets
            .replace(/\-\-+/g, ' ')  // Remove multiple dashes
            .replace(/\n{3,}/g, '\n\n')  // Remove excessive line breaks
            .replace(/\s{2,}/g, ' ')  // Remove excessive spaces
            .replace(/\:\:/g, ':')  // Remove double colons
            .trim();

        console.log('Speaking (cleaned):', cleanText.substring(0, 100) + '...');

        const utterance = new SpeechSynthesisUtterance(cleanText);
        
        if (this.selectedVoice) {
            utterance.voice = this.selectedVoice;
        }
        
        utterance.rate = 0.95;  // Slightly slower for clarity
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => {
            console.log('Speaking started');
            if (onStart) onStart();
        };

        utterance.onend = () => {
            console.log('Speaking ended');
            this.currentUtterance = null;
            if (onEnd) onEnd();
        };

        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            this.currentUtterance = null;
            if (onEnd) onEnd();
        };

        this.synthesis.speak(utterance);
        this.currentUtterance = utterance;
    }

    /**
     * Stop current speech
     */
    stopSpeaking() {
        if (this.synthesis && this.synthesis.speaking) {
            this.synthesis.cancel();
            this.currentUtterance = null;
            console.log('Speech stopped');
        }
    }

    /**
     * Check if currently speaking
     */
    isSpeaking() {
        return this.synthesis && this.synthesis.speaking;
    }

    /**
     * Pause current speech
     */
    pause() {
        if (this.synthesis && this.synthesis.speaking) {
            this.synthesis.pause();
            console.log('Speech paused');
        }
    }

    /**
     * Resume paused speech
     */
    resume() {
        if (this.synthesis && this.synthesis.paused) {
            this.synthesis.resume();
            console.log('Speech resumed');
        }
    }
}

// Create global instance
const speechService = new SpeechService();
window.speechService = speechService;

console.log('Speech service initialized');
