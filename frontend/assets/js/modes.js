/**
 * Multi-Mode Interface Controller - FIXED VERSION
 */

class ModeController {
    constructor() {
        this.currentMode = 'chat';
        this.menuBtn = null;
        this.dropdown = null;
        this.modeOptions = [];
        this.modePanels = {};
    }

    init() {
        console.log('Initializing mode controller...');
        
        // Wait a bit for DOM to be fully ready
        setTimeout(() => {
            this.menuBtn = document.getElementById('mode-menu-btn');
            this.dropdown = document.getElementById('mode-dropdown');
            this.modeOptions = document.querySelectorAll('.mode-option');
            
            // Get all mode panels
            this.modePanels = {
                chat: document.getElementById('chat-mode'),
                whiteboard: document.getElementById('whiteboard-mode'),
                notes: document.getElementById('notes-mode')
            };

            if (this.menuBtn) {
                console.log('Mode menu button found, setting up listeners...');
                this.setupEventListeners();
            } else {
                console.error('Mode menu button not found!');
            }
        }, 500);
    }

    setupEventListeners() {
        // Toggle dropdown menu - FIXED with stopPropagation
        if (this.menuBtn) {
            this.menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                console.log('Menu button clicked!');
                this.toggleDropdown();
            });
            console.log('Menu button listener added');
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (this.dropdown && !this.dropdown.classList.contains('hidden')) {
                const isInsideDropdown = this.dropdown.contains(e.target);
                const isMenuBtn = this.menuBtn && this.menuBtn.contains(e.target);
                
                if (!isInsideDropdown && !isMenuBtn) {
                    this.closeDropdown();
                }
            }
        });

        // Mode option clicks
        this.modeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const mode = option.dataset.mode;
                console.log('Switching to mode:', mode);
                this.switchMode(mode);
                this.closeDropdown();
            });
        });

        console.log('All mode event listeners set up');
    }

    toggleDropdown() {
        if (!this.dropdown) return;
        
        const isHidden = this.dropdown.classList.contains('hidden');
        
        if (isHidden) {
            this.dropdown.classList.remove('hidden');
            console.log('Dropdown opened');
        } else {
            this.dropdown.classList.add('hidden');
            console.log('Dropdown closed');
        }
    }

    closeDropdown() {
        if (this.dropdown) {
            this.dropdown.classList.add('hidden');
        }
    }

    switchMode(mode) {
    if (this.currentMode === mode) return;

    console.log('Switching from', this.currentMode, 'to', mode);

    // Update active states
    this.modeOptions.forEach(option => {
        if (option.dataset.mode === mode) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });

    // Hide all panels
    Object.values(this.modePanels).forEach(panel => {
        if (panel) {
            panel.classList.remove('active');
            panel.classList.add('hidden');
        }
    });

    // Show selected panel
    if (this.modePanels[mode]) {
        this.modePanels[mode].classList.add('active');
        this.modePanels[mode].classList.remove('hidden');
    }

    // Update header
    this.updateHeader(mode);

    // Initialize mode-specific features
    if (mode === 'whiteboard' && window.whiteboardManager) {
        setTimeout(() => {
            console.log('🎨 FORCING WHITEBOARD INIT...');
            whiteboardManager.init();
        }, 500);
    } else if (mode === 'notes' && window.notesManager) {
        setTimeout(() => notesManager.init(), 100);
    }

    this.currentMode = mode;
}


    updateHeader(mode) {
        const titleEl = document.getElementById('mode-title');
        const subtitleEl = document.getElementById('mode-subtitle');

        const headers = {
            chat: {
                title: 'Live Chat',
                subtitle: 'Ask anything, get instant answers'
            },
            whiteboard: {
                title: 'Whiteboard',
                subtitle: 'Draw, sketch, and collaborate'
            },
            notes: {
                title: 'Notes',
                subtitle: 'Take notes during your session'
            }
        };

        if (titleEl && headers[mode]) {
            titleEl.textContent = headers[mode].title;
        }
        if (subtitleEl && headers[mode]) {
            subtitleEl.textContent = headers[mode].subtitle;
        }
    }
}

// Create global instance
const modeController = new ModeController();
window.modeController = modeController;

// Don't auto-initialize - let call.js do it
console.log('modes.js loaded successfully');
