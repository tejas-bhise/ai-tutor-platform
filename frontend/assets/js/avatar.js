/**
 * Avatar Animation Controller
 */

class AvatarController {
    constructor() {
        this.wrapper = null;
        this.mouth = null;
        this.isSpeaking = false;
    }

    /**
     * Initialize avatar elements
     */
    init() {
        this.wrapper = document.getElementById('avatar-wrapper');
        this.mouth = document.getElementById('avatar-mouth');
    }

    /**
     * Start speaking animation
     */
    startSpeaking() {
        if (!this.wrapper || !this.mouth) return;
        
        this.isSpeaking = true;
        this.wrapper.classList.add('speaking');
        this.mouth.classList.add('speaking');
    }

    /**
     * Stop speaking animation
     */
    stopSpeaking() {
        if (!this.wrapper || !this.mouth) return;
        
        this.isSpeaking = false;
        this.wrapper.classList.remove('speaking');
        this.mouth.classList.remove('speaking');
    }

    /**
     * Change avatar appearance based on tutor
     */
    setTutor(tutorName) {
        // Can customize avatar colors/style based on tutor
        console.log('Avatar set to:', tutorName);
    }
}

// Create global avatar controller instance
const avatarController = new AvatarController();
