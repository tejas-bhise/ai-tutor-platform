/**
 * YoLearn.ai Notes Manager v2.0
 * ✅ Opens in RIGHT PANEL (not full screen)
 * ✅ Rich text editor WITHOUT Quill (no external dependency)
 * ✅ Auto-save, export, markdown support
 * ✅ Session-specific notes with AI summary
 */

class NotesManager {
  constructor() {
    this.editor = null;
    this.notes = '';
    this.initialized = false;
    this.autoSaveInterval = null;
    this.sessionId = sessionStorage.getItem('currentRoomId') || 'default';
  }

  init() {
    if (this.initialized && this.editor) {
      console.log('✅ Notes already initialized');
      return;
    }
    this.initialized = true;

    this.editor = document.getElementById('notes-editor');
    if (!this.editor) {
      console.error('❌ Notes editor not found');
      return;
    }

    // Make editor editable
    this.editor.contentEditable = true;
    this.editor.focus();

    // Load saved notes
    this.loadNotes();

    // Setup toolbar
    this.setupToolbar();

    // Auto-save every 10 seconds
    this.autoSaveInterval = setInterval(() => this.autoSave(), 10000);

    // Track changes
    this.editor.addEventListener('input', () => {
      this.notes = this.editor.innerHTML;
    });

    // Keyboard shortcuts
    this.editor.addEventListener('keydown', (e) => {
      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.saveNotes();
      }
      // Ctrl+B for bold
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        document.execCommand('bold');
      }
      // Ctrl+I for italic
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        document.execCommand('italic');
      }
      // Ctrl+U for underline
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        document.execCommand('underline');
      }
    });

    console.log('✅ Notes editor initialized');
  }

  setupToolbar() {
    // Bold button
    const boldBtn = document.getElementById('bold-btn');
    if (boldBtn) {
      boldBtn.addEventListener('click', () => {
        document.execCommand('bold');
        this.editor.focus();
      });
    }

    // Italic button
    const italicBtn = document.getElementById('italic-btn');
    if (italicBtn) {
      italicBtn.addEventListener('click', () => {
        document.execCommand('italic');
        this.editor.focus();
      });
    }

    // Underline button
    const underlineBtn = document.getElementById('underline-btn');
    if (underlineBtn) {
      underlineBtn.addEventListener('click', () => {
        document.execCommand('underline');
        this.editor.focus();
      });
    }

    // Bulleted list
    const bulletBtn = document.getElementById('bullet-btn');
    if (bulletBtn) {
      bulletBtn.addEventListener('click', () => {
        document.execCommand('insertUnorderedList');
        this.editor.focus();
      });
    }

    // Numbered list
    const numberBtn = document.getElementById('number-btn');
    if (numberBtn) {
      numberBtn.addEventListener('click', () => {
        document.execCommand('insertOrderedList');
        this.editor.focus();
      });
    }

    // Heading
    const headingBtn = document.getElementById('heading-btn');
    if (headingBtn) {
      headingBtn.addEventListener('click', () => {
        document.execCommand('formatBlock', false, '<h3>');
        this.editor.focus();
      });
    }

    // Clear formatting
    const clearBtn = document.getElementById('clear-format-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        document.execCommand('removeFormat');
        this.editor.focus();
      });
    }

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

    // Clear all button
    const clearAllBtn = document.getElementById('clear-notes-btn');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', () => {
        if (confirm('Clear all notes? This cannot be undone.')) {
          this.editor.innerHTML = '';
          this.notes = '';
          this.saveNotes();
        }
      });
    }

    // AI Summary button
    const summaryBtn = document.getElementById('ai-summary-btn');
    if (summaryBtn) {
      summaryBtn.addEventListener('click', () => this.generateAISummary());
    }
  }

  saveNotes() {
    const content = this.editor.innerHTML;
    const storageKey = `yolearn_notes_${this.sessionId}`;
    
    localStorage.setItem(storageKey, content);
    localStorage.setItem('yolearn_notes_last_saved', new Date().toISOString());
    
    this.showNotification('✅ Notes saved successfully!', 'success');
    console.log('💾 Notes saved');
  }

  loadNotes() {
    const storageKey = `yolearn_notes_${this.sessionId}`;
    const savedNotes = localStorage.getItem(storageKey);
    
    if (savedNotes && this.editor) {
      this.editor.innerHTML = savedNotes;
      this.notes = savedNotes;
      console.log('📖 Notes loaded');
      
      // Show last saved time
      const lastSaved = localStorage.getItem('yolearn_notes_last_saved');
      if (lastSaved) {
        const date = new Date(lastSaved);
        const timeAgo = this.getTimeAgo(date);
        this.showNotification(`Last saved ${timeAgo}`, 'info');
      }
    }
  }

  autoSave() {
    if (this.notes && this.notes.trim() !== '') {
      this.saveNotes();
      console.log('💾 Auto-saved');
    }
  }

  exportNotes() {
    const content = this.editor.innerText || this.editor.textContent;
    
    if (!content.trim()) {
      this.showNotification('⚠️ No notes to export', 'warning');
      return;
    }
    
    // Create downloadable text file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().split('T')[0];
    link.download = `yolearn-notes-${timestamp}.txt`;
    link.href = url;
    link.click();
    
    URL.revokeObjectURL(url);
    
    this.showNotification('✅ Notes exported successfully!', 'success');
    console.log('📥 Notes exported');
  }

  async generateAISummary() {
    const content = this.editor.innerText || this.editor.textContent;
    
    if (!content.trim()) {
      this.showNotification('⚠️ No notes to summarize', 'warning');
      return;
    }

    this.showNotification('🤖 Generating AI summary...', 'info');

    try {
      const response = await fetch(`${API_BASE_URL}/api/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: content })
      });

      const data = await response.json();

      if (data.success) {
        // Insert summary at the beginning
        const summaryHTML = `
          <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 15px; margin-bottom: 20px; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0; color: #1e40af;">📝 AI Summary</h3>
            <p style="margin: 0; color: #374151;">${data.summary}</p>
          </div>
        `;
        this.editor.innerHTML = summaryHTML + this.editor.innerHTML;
        this.saveNotes();
        this.showNotification('✅ AI summary generated!', 'success');
      } else {
        this.showNotification('❌ Failed to generate summary', 'error');
      }
    } catch (error) {
      console.error('AI Summary error:', error);
      this.showNotification('❌ AI summary unavailable', 'error');
    }
  }

  showNotification(message, type = 'info') {
    const colors = {
      success: 'linear-gradient(135deg, #10b981, #059669)',
      error: 'linear-gradient(135deg, #ef4444, #dc2626)',
      warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
      info: 'linear-gradient(135deg, #3b82f6, #2563eb)'
    };

    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type]};
      color: white;
      padding: 15px 25px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      animation: slideInRight 0.3s ease-out;
      max-width: 300px;
      font-size: 14px;
      font-weight: 500;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  destroy() {
    this.initialized = false;
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    this.editor = null;
    this.notes = '';
    console.log('🗑️ Notes manager destroyed');
  }
}

// Global instance
const notesManager = new NotesManager();
window.notesManager = notesManager;

// Initialize when openNotes is called
function initNotes() {
  setTimeout(() => {
    notesManager.init();
  }, 100);
}

window.initNotes = initNotes;
console.log('✅ Notes module loaded');

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideOutRight {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100px);
    }
  }
`;
document.head.appendChild(style);
