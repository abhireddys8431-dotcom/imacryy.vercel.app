/* ============================================
   AUTH.JS — Authentication & User State
   ============================================ */

// Simulated auth state (in production, replace with real backend/Firebase)
let currentUser = JSON.parse(localStorage.getItem('resumeai_user')) || null;

function initAuth() {
  updateNavUI();
  // Protect dashboard
  if (window.location.pathname.includes('dashboard') && !currentUser) {
    window.location.href = 'index.html';
  }
}

function updateNavUI() {
  const navGuest = document.getElementById('navGuest');
  const navUser = document.getElementById('navUser');
  const navUserName = document.getElementById('navUserName');
  const navAvatar = document.getElementById('navAvatar');

  if (currentUser) {
    if (navGuest) navGuest.classList.add('hidden');
    if (navUser) navUser.classList.remove('hidden');
    if (navUserName) navUserName.textContent = currentUser.name.split(' ')[0];
    if (navAvatar) navAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
  } else {
    if (navGuest) navGuest.classList.remove('hidden');
    if (navUser) navUser.classList.add('hidden');
  }
}

function handleLogin() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    showToast('Please fill in all fields', 'error'); return;
  }
  if (!email.includes('@')) {
    showToast('Please enter a valid email', 'error'); return;
  }

  // Simulate login
  const user = {
    id: 'user_' + Date.now(),
    name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
    email: email,
    plan: 'free',
    joinDate: new Date().toISOString()
  };
  setCurrentUser(user);
  closeModal('authModal');
  showToast('Welcome back! 👋', 'success');
  setTimeout(() => { updateNavUI(); }, 100);
}

function handleSignup() {
  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  if (!name || !email || !password) {
    showToast('Please fill in all fields', 'error'); return;
  }
  if (!email.includes('@')) {
    showToast('Please enter a valid email', 'error'); return;
  }
  if (password.length < 8) {
    showToast('Password must be at least 8 characters', 'error'); return;
  }

  const user = {
    id: 'user_' + Date.now(),
    name: name,
    email: email,
    plan: 'free',
    joinDate: new Date().toISOString()
  };
  setCurrentUser(user);
  closeModal('authModal');
  showToast('Account created! Welcome to ResumeAI 🎉', 'success');
  setTimeout(() => updateNavUI(), 100);
}

function handleGoogleLogin() {
  const user = {
    id: 'user_google_' + Date.now(),
    name: 'Google User',
    email: 'user@gmail.com',
    plan: 'free',
    avatar: 'G',
    joinDate: new Date().toISOString()
  };
  setCurrentUser(user);
  closeModal('authModal');
  showToast('Logged in with Google! 🎉', 'success');
  setTimeout(() => updateNavUI(), 100);
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem('resumeai_user');
  updateNavUI();
  showToast('Logged out successfully', 'info');
  if (window.location.pathname.includes('dashboard')) {
    setTimeout(() => window.location.href = 'index.html', 800);
  }
}

function handleUpgrade(plan) {
  if (!currentUser) {
    closeModal('upgradeModal');
    openModal('authModal');
    showToast('Please login first to upgrade', 'info');
    return;
  }
  // Simulate payment
  showToast('Redirecting to payment... (demo mode)', 'info');
  setTimeout(() => {
    currentUser.plan = 'premium';
    setCurrentUser(currentUser);
    closeModal('upgradeModal');
    showToast('🎉 Welcome to Premium! All templates unlocked!', 'success');
    updateNavUI();
  }, 1500);
}

function setCurrentUser(user) {
  currentUser = user;
  localStorage.setItem('resumeai_user', JSON.stringify(user));
  updateNavUI();
}

function getCurrentUser() { return currentUser; }
function isPremium() { return currentUser && currentUser.plan === 'premium'; }
function isLoggedIn() { return !!currentUser; }

// ---- MODAL HELPERS ----
function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
  document.body.style.overflow = '';
}

function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('signupForm').classList.add('hidden');

  if (tab === 'login') {
    document.getElementById('loginForm').classList.remove('hidden');
    document.querySelectorAll('.auth-tab')[0].classList.add('active');
  } else {
    document.getElementById('signupForm').classList.remove('hidden');
    document.querySelectorAll('.auth-tab')[1].classList.add('active');
  }
}

function toggleUserMenu() {
  const menu = document.getElementById('userMenu');
  menu.classList.toggle('hidden');
}
document.addEventListener('click', (e) => {
  const menu = document.getElementById('userMenu');
  if (menu && !menu.closest('.nav-user')?.contains(e.target)) {
    menu.classList.add('hidden');
  }
});

// ---- TOAST NOTIFICATIONS ----
function showToast(message, type = 'info') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fa ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
    <span>${message}</span>
  `;
  toast.style.cssText = `
    position: fixed; bottom: 24px; right: 24px; z-index: 9999;
    background: ${type === 'success' ? '#1a3a2a' : type === 'error' ? '#3a1a1a' : '#1a1a3a'};
    border: 1px solid ${type === 'success' ? '#4caf82' : type === 'error' ? '#ff6b6b' : '#6c63ff'};
    color: ${type === 'success' ? '#4caf82' : type === 'error' ? '#ff6b6b' : '#a8a4ff'};
    padding: 14px 20px; border-radius: 12px;
    display: flex; align-items: center; gap: 10px;
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    animation: toastIn 0.3s ease;
    max-width: 340px;
  `;
  const style = document.createElement('style');
  style.textContent = `@keyframes toastIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`;
  document.head.appendChild(style);
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ---- NAV HELPERS ----
function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  if (menu) menu.classList.toggle('hidden');
}

// Init on load
document.addEventListener('DOMContentLoaded', initAuth);
