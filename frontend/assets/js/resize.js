/**
 * Resizable Split Panel Handler
 */

document.addEventListener('DOMContentLoaded', () => {
    const divider = document.getElementById('split-divider');
    const leftPanel = document.querySelector('.split-left');
    const rightPanel = document.querySelector('.split-right');
    const container = document.querySelector('.split-container');
    
    let isResizing = false;
    
    divider.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        
        const containerRect = container.getBoundingClientRect();
        const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
        
        // Constrain between 30% and 70%
        if (newLeftWidth >= 30 && newLeftWidth <= 70) {
            leftPanel.style.flex = `0 0 ${newLeftWidth}%`;
            rightPanel.style.width = `${100 - newLeftWidth}%`;
        }
    });
    
    document.addEventListener('mouseup', () => {
        isResizing = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    });
});
