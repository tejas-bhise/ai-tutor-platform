/**
 * YoLearn.ai Whiteboard v2.0
 * ✅ Opens in RIGHT PANEL (not full screen)
 * ✅ All tools functional (pen, eraser, shapes)
 * ✅ Undo/Redo with history
 * ✅ Touch & mouse support
 * ✅ Professional toolbar
 */

class WhiteboardManager {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.isDrawing = false;
    this.lastX = 0;
    this.lastY = 0;
    this.currentColor = '#000000';
    this.currentWidth = 3;
    this.currentTool = 'pen';
    this.pointerId = null;
    this.initialized = false;
    
    this.startX = 0;
    this.startY = 0;
    this.snapshot = null;
    
    this.history = [];
    this.historyStep = -1;
    this.maxHistory = 20;
  }

  init() {
    if (this.initialized && this.canvas) {
      console.log('✅ Whiteboard already initialized');
      return;
    }
    this.initialized = true;

    this.canvas = document.getElementById('whiteboard-canvas');
    if (!this.canvas) {
      console.error('❌ Whiteboard canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d', { alpha: false });
    const container = document.getElementById('whiteboard-container');
    const cssW = container.clientWidth || 1200;
    const cssH = container.clientHeight - 60 || 700;
    const dpr = window.devicePixelRatio || 1;
    
    this.canvas.width = Math.round(cssW * dpr);
    this.canvas.height = Math.round(cssH * dpr);
    this.canvas.style.width = cssW + 'px';
    this.canvas.style.height = cssH + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';

    this.clearCanvas();
    this.saveState();
    this.setupTools();
    this.setupDrawing();
    
    console.log('✅ Whiteboard initialized');
  }

  clearCanvas() {
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
  }

  setupTools() {
    document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setTool(btn.dataset.tool);
        document.querySelectorAll('.tool-btn[data-tool]').forEach(b => 
          b.classList.remove('active')
        );
        btn.classList.add('active');
      });
    });

    const colorPicker = document.getElementById('pen-color');
    if (colorPicker) {
      colorPicker.addEventListener('input', (e) => {
        this.currentColor = e.target.value;
        const indicator = document.getElementById('color-indicator');
        if (indicator) indicator.style.backgroundColor = this.currentColor;
      });
    }

    const widthSlider = document.getElementById('pen-width');
    if (widthSlider) {
      widthSlider.addEventListener('input', (e) => {
        this.currentWidth = parseInt(e.target.value, 10) || 3;
        const display = document.getElementById('width-display');
        if (display) display.textContent = this.currentWidth + 'px';
      });
    }

    const clearBtn = document.getElementById('clear-canvas');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Clear entire whiteboard?')) {
          this.clearCanvas();
          this.saveState();
        }
      });
    }

    const undoBtn = document.getElementById('undo-btn');
    if (undoBtn) undoBtn.addEventListener('click', () => this.undo());

    const redoBtn = document.getElementById('redo-btn');
    if (redoBtn) redoBtn.addEventListener('click', () => this.redo());

    const downloadBtn = document.getElementById('download-canvas');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = `whiteboard-${Date.now()}.png`;
        link.href = this.canvas.toDataURL('image/png');
        link.click();
      });
    }
  }

  setTool(tool) {
    this.currentTool = tool;
    console.log('🛠️ Tool:', tool);
    
    if (tool === 'eraser') {
      this.ctx.globalCompositeOperation = 'destination-out';
    } else {
      this.ctx.globalCompositeOperation = 'source-over';
    }
  }

  setupDrawing() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      return { 
        x: e.clientX - rect.left, 
        y: e.clientY - rect.top 
      };
    };

    this.canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.canvas.setPointerCapture(e.pointerId);
      this.pointerId = e.pointerId;
      this.isDrawing = true;
      
      const p = getPos(e);
      this.startX = p.x;
      this.startY = p.y;
      this.lastX = p.x;
      this.lastY = p.y;
      
      if (['rectangle', 'circle', 'line'].includes(this.currentTool)) {
        this.snapshot = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      }
    });

    this.canvas.addEventListener('pointermove', (e) => {
      if (!this.isDrawing || e.pointerId !== this.pointerId) return;
      e.preventDefault();
      
      const p = getPos(e);
      
      if (this.currentTool === 'pen' || this.currentTool === 'eraser') {
        this.drawLine(this.lastX, this.lastY, p.x, p.y);
        this.lastX = p.x;
        this.lastY = p.y;
      } else if (this.currentTool === 'rectangle') {
        this.drawRectangle(this.startX, this.startY, p.x, p.y);
      } else if (this.currentTool === 'circle') {
        this.drawCircle(this.startX, this.startY, p.x, p.y);
      } else if (this.currentTool === 'line') {
        this.drawStraightLine(this.startX, this.startY, p.x, p.y);
      }
    });

    const endPointer = (e) => {
      if (e && e.pointerId && e.pointerId !== this.pointerId) return;
      
      if (this.isDrawing) {
        this.isDrawing = false;
        this.saveState();
      }
      
      try { 
        this.canvas.releasePointerCapture(this.pointerId); 
      } catch (_) {}
      this.pointerId = null;
      this.snapshot = null;
    };

    this.canvas.addEventListener('pointerup', endPointer);
    this.canvas.addEventListener('pointercancel', endPointer);
    this.canvas.addEventListener('pointerleave', endPointer);
    this.canvas.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
    this.canvas.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
  }

  drawLine(x1, y1, x2, y2) {
    this.ctx.save();
    
    if (this.currentTool === 'eraser') {
      this.ctx.globalCompositeOperation = 'destination-out';
      this.ctx.lineWidth = this.currentWidth * 3;
    } else {
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.strokeStyle = this.currentColor;
      this.ctx.lineWidth = this.currentWidth;
    }
    
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawRectangle(startX, startY, currentX, currentY) {
    if (this.snapshot) {
      this.ctx.putImageData(this.snapshot, 0, 0);
    }
    
    this.ctx.save();
    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = this.currentWidth;
    this.ctx.globalCompositeOperation = 'source-over';
    
    const width = currentX - startX;
    const height = currentY - startY;
    
    this.ctx.strokeRect(startX, startY, width, height);
    this.ctx.restore();
  }

  drawCircle(startX, startY, currentX, currentY) {
    if (this.snapshot) {
      this.ctx.putImageData(this.snapshot, 0, 0);
    }
    
    this.ctx.save();
    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = this.currentWidth;
    this.ctx.globalCompositeOperation = 'source-over';
    
    const radius = Math.sqrt(
      Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2)
    );
    
    this.ctx.beginPath();
    this.ctx.arc(startX, startY, radius, 0, Math.PI * 2);
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawStraightLine(startX, startY, currentX, currentY) {
    if (this.snapshot) {
      this.ctx.putImageData(this.snapshot, 0, 0);
    }
    
    this.ctx.save();
    this.ctx.strokeStyle = this.currentColor;
    this.ctx.lineWidth = this.currentWidth;
    this.ctx.globalCompositeOperation = 'source-over';
    
    this.ctx.beginPath();
    this.ctx.moveTo(startX, startY);
    this.ctx.lineTo(currentX, currentY);
    this.ctx.stroke();
    this.ctx.restore();
  }

  saveState() {
    if (this.historyStep < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyStep + 1);
    }
    
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this.history.push(imageData);
    this.historyStep++;
    
    if (this.history.length > this.maxHistory) {
      this.history.shift();
      this.historyStep--;
    }
  }

  undo() {
    if (this.historyStep > 0) {
      this.historyStep--;
      const imageData = this.history[this.historyStep];
      this.ctx.putImageData(imageData, 0, 0);
      console.log('↩️ Undo');
    }
  }

  redo() {
    if (this.historyStep < this.history.length - 1) {
      this.historyStep++;
      const imageData = this.history[this.historyStep];
      this.ctx.putImageData(imageData, 0, 0);
      console.log('↪️ Redo');
    }
  }

  destroy() {
    this.initialized = false;
    this.canvas = null;
    this.ctx = null;
    this.history = [];
    this.historyStep = -1;
  }
}

const whiteboardManager = new WhiteboardManager();
window.whiteboardManager = whiteboardManager;

function initWhiteboard() {
  setTimeout(() => {
    whiteboardManager.init();
  }, 100);
}

window.initWhiteboard = initWhiteboard;
console.log('✅ Whiteboard module loaded');
