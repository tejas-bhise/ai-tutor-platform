/**
 * Caption System
 */

class CaptionSystem {
    constructor() {
        this.captionsEnabled = false;
        this.captionOverlay = null;
        this.toggleBtn = null;
    }

    init() {
        this.captionOverlay = document.getElementById('caption-overlay');
        this.toggleBtn = document.getElementById('toggle-captions-btn');
        
        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => this.toggle());
        }
    }

    toggle() {
        this.captionsEnabled = !this.captionsEnabled;
        console.log('Captions:', this.captionsEnabled ? 'ON' : 'OFF');
    }

    showCaption(text, duration = 5000) {
        if (!this.captionsEnabled || !this.captionOverlay) return;
        
        this.captionOverlay.textContent = text;
        this.captionOverlay.classList.add('show');
        
        clearTimeout(this.captionTimeout);
        this.captionTimeout = setTimeout(() => {
            this.captionOverlay.classList.remove('show');
        }, duration);
    }
}

const captionSystem = new CaptionSystem();
window.captionSystem = captionSystem;
