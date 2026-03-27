/* ============================================
   DASHBOARD.JS — User Dashboard
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser ? getCurrentUser() : null;

  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  // Welcome
  const welcome = document.getElementById('dashWelcome');
  if (welcome) welcome.textContent = `Welcome back, ${user.name.split(' ')[0]}! 👋`;

  // Plan badge
  const planEl = document.getElementById('dashPlan');
  if (planEl && user.plan === 'premium') {
    planEl.innerHTML = `
      <div class="plan-label" style="color:var(--accent2);">👑 Premium Plan</div>
      <p style="color:var(--text2);">All templates & features unlocked</p>
    `;
  }

  // Load drafts
  loadDrafts(user);
  updateStats();
});

function loadDrafts(user) {
  const grid = document.getElementById('resumesGrid');
  if (!grid) return;

  const drafts = JSON.parse(localStorage.getItem('resumeai_drafts') || '[]');

  // Clear and add "new" card
  grid.innerHTML = `
    <div class="resume-card new-card" onclick="window.location.href='builder.html'">
      <i class="fa fa-plus-circle"></i>
      <span>Create New Resume</span>
    </div>
  `;

  drafts.forEach(draft => {
    const card = document.createElement('div');
    card.className = 'resume-card';
    card.style.cssText = 'overflow:hidden;';
    card.innerHTML = `
      <div style="height:160px;background:${draft.template?.accent || '#6c63ff'};display:flex;align-items:center;justify-content:center;">
        <i class="fa fa-file-alt" style="font-size:36px;color:rgba(255,255,255,0.5);"></i>
      </div>
      <div style="padding:14px;">
        <div style="font-family:var(--font-head);font-size:14px;font-weight:700;margin-bottom:4px;">${draft.name}</div>
        <div style="font-size:12px;color:var(--text3);margin-bottom:12px;">${formatDate(draft.savedAt)}</div>
        <div style="display:flex;gap:8px;">
          <button class="btn-primary sm" onclick="editDraft('${draft.id}')" style="flex:1;justify-content:center;">Edit</button>
          <button class="btn-ghost sm" onclick="deleteDraft('${draft.id}', this)" style="color:var(--accent);">
            <i class="fa fa-trash"></i>
          </button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function updateStats() {
  const drafts = JSON.parse(localStorage.getItem('resumeai_drafts') || '[]');
  const statResumes = document.getElementById('statResumes');
  const statDownloads = document.getElementById('statDownloads');
  const statViews = document.getElementById('statViews');

  if (statResumes) statResumes.textContent = drafts.length;
  if (statDownloads) statDownloads.textContent = Math.floor(drafts.length * 1.5);
  if (statViews) statViews.textContent = Math.floor(drafts.length * 3.2);
}

function editDraft(id) {
  showToast('Loading resume...', 'info');
  setTimeout(() => window.location.href = 'builder.html', 500);
}

function deleteDraft(id, btn) {
  let drafts = JSON.parse(localStorage.getItem('resumeai_drafts') || '[]');
  drafts = drafts.filter(d => String(d.id) !== String(id));
  localStorage.setItem('resumeai_drafts', JSON.stringify(drafts));
  btn.closest('.resume-card').remove();
  updateStats();
  showToast('Resume deleted', 'info');
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
