/**
 * Rich Text Notes Manager with Quill
 */

class NotesManager {
    constructor() {
        this.quill = null;
        this.notes = '';
    }

    init() {
        if (this.quill) return; // Already initialized

        const editorEl = document.getElementById('notes-editor');
        if (!editorEl) return;

        // Initialize Quill editor
        this.quill = new Quill('#notes-editor', {
            theme: 'snow',
            modules: {
                toolbar: '#notes-toolbar'
            },
            placeholder: 'Start taking notes...'
        });

        // Load saved notes from localStorage
        this.loadNotes();

        // Auto-save every 5 seconds
        setInterval(() => this.autoSave(), 5000);

        this.setupEventListeners();
        console.log('Notes manager initialized');
    }

    setupEventListeners() {
        // Save button
        const saveBtn = document.getElementById('save-notes-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveNotes());
        }

        // Export button
        const exportBtn = document.getElementById('export-notes-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportNotes());
        }

        // Track changes
        if (this.quill) {
            this.quill.on('text-change', () => {
                this.notes = this.quill.root.innerHTML;
            });
        }
    }

    saveNotes() {
        const content = this.quill.root.innerHTML;
        localStorage.setItem('yolearn_notes', content);
        
        // Show success notification
        this.showNotification('Notes saved successfully!');
        console.log('Notes saved to localStorage');
    }

    loadNotes() {
        const savedNotes = localStorage.getItem('yolearn_notes');
        if (savedNotes && this.quill) {
            this.quill.root.innerHTML = savedNotes;
            this.notes = savedNotes;
            console.log('Notes loaded from localStorage');
        }
    }

    autoSave() {
        if (this.notes && this.notes !== '<p><br></p>') {
            localStorage.setItem('yolearn_notes_autosave', this.notes);
        }
    }

    exportNotes() {
        const content = this.quill.getText();
        
        // Create downloadable text file
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.download = `yolearn-notes-${Date.now()}.txt`;
        link.href = url;
        link.click();
        
        URL.revokeObjectURL(url);
        
        this.showNotification('Notes exported successfully!');
        console.log('Notes exported');
    }

    showNotification(message) {
        // Simple notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 15px 25px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.5);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Create global instance
const notesManager = new NotesManager();
window.notesManager = notesManager;
