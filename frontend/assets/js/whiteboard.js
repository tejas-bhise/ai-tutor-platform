/**
 * Ultra-Simple Student-Friendly Whiteboard
 * - Pen and eraser, color/width, clear/download.
 * - Works with mouse and touch (pointer events).
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
  }

  init() {
    // Prevent double-init (switching modes)
    if (this.initialized && this.canvas) return;
    this.initialized = true;

    this.canvas = document.getElementById('whiteboard-canvas');
    if (!this.canvas) {
      console.error('Whiteboard canvas not found');
      return;
    }

    // 2d context: no alpha (background always white)
    this.ctx = this.canvas.getContext('2d', { alpha: false });
    const cssW = 1200, cssH = 700, dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.round(cssW * dpr);
    this.canvas.height = Math.round(cssH * dpr);
    this.canvas.style.width = cssW + 'px';
    this.canvas.style.height = cssH + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';

    // White background
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'source-over';
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(0, 0, cssW, cssH);
    this.ctx.restore();

    this.setupTools();
    this.setupDrawing();
  }

  setupTools() {
    // Tool buttons
    document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentTool = btn.dataset.tool;
        document.querySelectorAll('.tool-btn[data-tool]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (this.currentTool === 'eraser') this.ctx.globalCompositeOperation = 'destination-out';
        else this.ctx.globalCompositeOperation = 'source-over';
      });
    });

    // Color
    document.getElementById('pen-color')?.addEventListener('input', (e) => {
      this.currentColor = e.target.value;
    });

    // Width
    document.getElementById('pen-width')?.addEventListener('input', (e) => {
      this.currentWidth = parseInt(e.target.value, 10) || 1;
    });

    // Clear
    document.getElementById('clear-canvas')?.addEventListener('click', () => {
      this.ctx.save();
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.fillStyle = '#fff';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.restore();
    });

    // Download
    document.getElementById('download-canvas')?.addEventListener('click', () => {
      const link = document.createElement('a');
      link.download = 'whiteboard.png';
      link.href = this.canvas.toDataURL('image/png');
      link.click();
    });
  }

  setupDrawing() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    this.canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.canvas.setPointerCapture(e.pointerId);
      this.pointerId = e.pointerId;
      this.isDrawing = true;
      const p = getPos(e);
      this.lastX = p.x; this.lastY = p.y;
    });

    this.canvas.addEventListener('pointermove', (e) => {
      if (!this.isDrawing || e.pointerId !== this.pointerId) return;
      e.preventDefault();
      const p = getPos(e);
      this.drawLine(this.lastX, this.lastY, p.x, p.y);
      this.lastX = p.x; this.lastY = p.y;
    });

    const endPointer = (e) => {
      if (e && e.pointerId && e.pointerId !== this.pointerId) return;
      this.isDrawing = false;
      try { this.canvas.releasePointerCapture(this.pointerId); } catch (_) {}
      this.pointerId = null;
    };

    this.canvas.addEventListener('pointerup', endPointer);
    this.canvas.addEventListener('pointercancel', endPointer);
    this.canvas.addEventListener('pointerleave', endPointer);
    this.canvas.addEventListener('touchstart', e => e.preventDefault(), { passive: false });
  }

  drawLine(x1, y1, x2, y2) {
    if (this.currentTool === 'eraser') {
      this.ctx.globalCompositeOperation = 'destination-out';
    } else {
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.strokeStyle = this.currentColor;
    }
    this.ctx.lineWidth = this.currentWidth;
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }
}

const whiteboardManager = new WhiteboardManager();
window.whiteboardManager = whiteboardManager;
