import './ui.css';

export function showToast(message, type = 'error') {
  const container = document.getElementById('toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `custom-toast toast-${type}`;
  
  const icon = type === 'error' ? '⚠️' : '✅';
  
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-msg">${message}</span>
  `;
  
  container.appendChild(toast);
  
  // Trigger reflow for animation
  void toast.offsetWidth;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => {
      toast.remove();
    });
  }, 3000);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  document.body.appendChild(container);
  return container;
}

export function showConfirm(title, message, confirmText = 'Confirm', confirmClass = 'btn-delete', icon = '🗑️') {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'custom-confirm-overlay';
    
    const modal = document.createElement('div');
    modal.className = 'custom-confirm-modal glass-panel';
    
    modal.innerHTML = `
      <div class="confirm-icon">${icon}</div>
      <h3>${title}</h3>
      <p>${message}</p>
      <div class="confirm-actions">
        <button class="btn-secondary cancel-btn">Cancel</button>
        <button class="${confirmClass} confirm-btn">${confirmText}</button>
      </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Trigger animation
    requestAnimationFrame(() => {
      overlay.classList.add('show');
      modal.classList.add('show');
    });
    
    const cleanup = () => {
      overlay.classList.remove('show');
      modal.classList.remove('show');
      setTimeout(() => overlay.remove(), 250);
    };
    
    modal.querySelector('.cancel-btn').addEventListener('click', () => {
      cleanup();
      resolve(false);
    });
    
    modal.querySelector('.confirm-btn').addEventListener('click', () => {
      cleanup();
      resolve(true);
    });
  });
}
