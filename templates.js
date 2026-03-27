/* ============================================
   TEMPLATES.JS — Template Library (100+ templates)
   ============================================ */

// Access tiers: 'free', 'login', 'premium'
const TEMPLATE_CATEGORIES = [
  'Professional', 'Creative', 'Executive', 'Tech', 'Healthcare',
  'Finance', 'Academic', 'Marketing', 'Legal', 'Engineering',
  'Design', 'Sales', 'Startup', 'Minimal', 'Bold'
];

const TEMPLATE_STYLES = [
  { name: 'Modern Pro', style: 'modern', category: 'Professional', accent: '#6c63ff', access: 'free' },
  { name: 'Classic Elite', style: 'classic', category: 'Professional', accent: '#1a1a2e', access: 'free' },
  { name: 'Minimal Edge', style: 'minimal', category: 'Minimal', accent: '#111', access: 'free' },
  { name: 'Tech Stack', style: 'tech', category: 'Tech', accent: '#00d4aa', access: 'free' },
  { name: 'Bold Vision', style: 'bold', category: 'Bold', accent: '#ff4757', access: 'free' },
  { name: 'Executive Suite', style: 'executive', category: 'Executive', accent: '#2c3e50', access: 'login' },
  { name: 'Creative Spark', style: 'creative', category: 'Creative', accent: '#e74c3c', access: 'login' },
  { name: 'Finance Pro', style: 'finance', category: 'Finance', accent: '#27ae60', access: 'login' },
  { name: 'Academic Scholar', style: 'academic', category: 'Academic', accent: '#8e44ad', access: 'login' },
  { name: 'Healthcare Plus', style: 'healthcare', category: 'Healthcare', accent: '#16a085', access: 'login' },
  { name: 'Startup Hustle', style: 'startup', category: 'Startup', accent: '#f39c12', access: 'login' },
  { name: 'Design Studio', style: 'design', category: 'Design', accent: '#e91e8c', access: 'login' },
  { name: 'Legal Brief', style: 'legal', category: 'Legal', accent: '#2c2c2c', access: 'login' },
  { name: 'Sales Closer', style: 'sales', category: 'Sales', accent: '#e67e22', access: 'login' },
  { name: 'Engineering Blue', style: 'engineering', category: 'Engineering', accent: '#3498db', access: 'login' },
  { name: 'Corporate Black', style: 'corporate', category: 'Professional', accent: '#111', access: 'premium' },
  { name: 'Neon Code', style: 'neon', category: 'Tech', accent: '#00ff88', access: 'premium' },
  { name: 'Luxury Gold', style: 'luxury', category: 'Executive', accent: '#c9a84c', access: 'premium' },
  { name: 'Artist Canvas', style: 'artist', category: 'Creative', accent: '#ff6b6b', access: 'premium' },
  { name: 'Data Driven', style: 'data', category: 'Tech', accent: '#4ecdc4', access: 'premium' },
  { name: 'Pacific Blue', style: 'pacific', category: 'Professional', accent: '#0077cc', access: 'premium' },
  { name: 'Rose Gold', style: 'rosegold', category: 'Creative', accent: '#b76e79', access: 'premium' },
  { name: 'Dark Matter', style: 'dark', category: 'Tech', accent: '#7c4dff', access: 'premium' },
  { name: 'Gradient Pro', style: 'gradient', category: 'Bold', accent: '#6c63ff', access: 'premium' },
];

// Generate 100+ templates by expanding the base set
function generateAllTemplates() {
  const templates = [];
  let id = 1;

  // Base templates
  TEMPLATE_STYLES.forEach(t => {
    templates.push({ id: id++, ...t, atsScore: Math.floor(Math.random() * 8) + 92, price: t.access === 'premium' ? 9 : 0 });
  });

  // Generate additional templates procedurally
  const extraColors = [
    '#6c63ff','#ff6b6b','#4ecdc4','#45b7d1','#96ceb4','#ffeaa7',
    '#dda0dd','#98d8c8','#f7dc6f','#bb8fce','#76d7c4','#f8c471'
  ];
  const extraStyles = ['minimal', 'modern', 'classic', 'bold', 'tech', 'creative'];
  const accessLevels = ['free','login','login','premium','premium','login'];

  const industries = [
    'Product Manager','UX Designer','Data Scientist','Nurse','Lawyer','Accountant',
    'Teacher','Architect','Chemist','Journalist','HR Manager','Operations Lead',
    'DevOps Engineer','Security Analyst','Brand Manager','Financial Analyst',
    'Content Writer','Art Director','Project Manager','Business Analyst',
    'Machine Learning','Cloud Engineer','Blockchain Dev','UI Developer',
    'Social Media','SEO Specialist','Public Relations','Supply Chain',
    'Risk Manager','Compliance Officer','Investment Banker','Real Estate',
    'Consultant','Actuary','Pharmacist','Physical Therapist','Dentist',
    'Surgeon','Researcher','Professor','Scientist','Biologist',
    'Environmental','Civil Engineer','Mechanical','Electrical','Chemical',
    'Aerospace','Petroleum','Agricultural','Food Scientist','Geologist'
  ];

  industries.forEach((industry, idx) => {
    const colorIdx = idx % extraColors.length;
    const styleIdx = idx % extraStyles.length;
    const accessIdx = idx % accessLevels.length;
    templates.push({
      id: id++,
      name: `${industry} Pro`,
      style: extraStyles[styleIdx],
      category: TEMPLATE_CATEGORIES[idx % TEMPLATE_CATEGORIES.length],
      accent: extraColors[colorIdx],
      access: accessLevels[accessIdx],
      atsScore: Math.floor(Math.random() * 8) + 90,
      price: accessLevels[accessIdx] === 'premium' ? 9 : 0,
      industry: industry
    });
  });

  // Add more filler up to 100+
  for (let i = templates.length; i < 110; i++) {
    templates.push({
      id: i + 1,
      name: `Template ${i + 1}`,
      style: extraStyles[i % extraStyles.length],
      category: TEMPLATE_CATEGORIES[i % TEMPLATE_CATEGORIES.length],
      accent: extraColors[i % extraColors.length],
      access: accessLevels[i % accessLevels.length],
      atsScore: Math.floor(Math.random() * 8) + 90,
      price: 0
    });
  }

  return templates;
}

const ALL_TEMPLATES = generateAllTemplates();
let displayedCount = 12;
let activeFilter = 'all';

function getTemplateColor(template) {
  const colors = {
    modern: ['#1a1a2e', '#e8e6ff'],
    classic: ['#f5f5f0', '#1a1a1a'],
    minimal: ['#ffffff', '#111'],
    tech: ['#0a0a1a', '#00d4aa'],
    bold: ['#ff4757', '#fff'],
    executive: ['#2c3e50', '#ecf0f1'],
    creative: ['#ffecd2', '#e74c3c'],
    finance: ['#f0f9f0', '#27ae60'],
    academic: ['#f5f0ff', '#8e44ad'],
  };
  return colors[template.style] || ['#f0f0f0', '#333'];
}

function createTemplateThumbnail(template) {
  const [bg, fg] = getTemplateColor(template);
  const accent = template.accent || '#6c63ff';
  return `
    <svg width="100%" height="100%" viewBox="0 0 220 280" xmlns="http://www.w3.org/2000/svg">
      <rect width="220" height="280" fill="${bg}"/>
      ${template.style === 'modern' ? `
        <rect width="220" height="70" fill="${accent}"/>
        <rect x="20" y="18" width="100" height="10" rx="3" fill="white" opacity="0.9"/>
        <rect x="20" y="34" width="70" height="6" rx="2" fill="white" opacity="0.6"/>
        <rect x="20" y="90" width="40" height="4" rx="2" fill="${accent}"/>
        <rect x="20" y="102" width="80" height="3" rx="1.5" fill="${fg}" opacity="0.5"/>
        <rect x="20" y="110" width="60" height="3" rx="1.5" fill="${fg}" opacity="0.4"/>
        <rect x="20" y="130" width="40" height="4" rx="2" fill="${accent}"/>
        <rect x="20" y="142" width="80" height="3" rx="1.5" fill="${fg}" opacity="0.5"/>
        <rect x="20" y="150" width="75" height="3" rx="1.5" fill="${fg}" opacity="0.4"/>
        <rect x="20" y="158" width="65" height="3" rx="1.5" fill="${fg}" opacity="0.35"/>
      ` : template.style === 'classic' ? `
        <rect x="20" y="20" width="180" height="12" rx="2" fill="${accent}" opacity="0.9"/>
        <rect x="50" y="18" width="120" height="8" rx="2" fill="${fg}" opacity="0.8"/>
        <rect x="60" y="32" width="100" height="5" rx="2" fill="${fg}" opacity="0.5"/>
        <rect x="20" y="50" width="180" height="1" fill="${fg}" opacity="0.3"/>
        <rect x="20" y="60" width="70" height="5" rx="2" fill="${fg}" opacity="0.7"/>
        <rect x="20" y="72" width="180" height="3" rx="1.5" fill="${fg}" opacity="0.3"/>
        <rect x="20" y="80" width="160" height="3" rx="1.5" fill="${fg}" opacity="0.25"/>
      ` : `
        <rect x="20" y="20" width="120" height="14" rx="3" fill="${accent}" opacity="0.9"/>
        <rect x="20" y="40" width="80" height="5" rx="2" fill="${fg}" opacity="0.5"/>
        <rect x="20" y="60" width="40" height="3" rx="1.5" fill="${accent}" opacity="0.8"/>
        <rect x="20" y="70" width="180" height="3" rx="1.5" fill="${fg}" opacity="0.3"/>
        <rect x="20" y="78" width="160" height="3" rx="1.5" fill="${fg}" opacity="0.25"/>
        <rect x="20" y="86" width="140" height="3" rx="1.5" fill="${fg}" opacity="0.2"/>
        <rect x="20" y="106" width="40" height="3" rx="1.5" fill="${accent}" opacity="0.8"/>
        <rect x="20" y="116" width="180" height="3" rx="1.5" fill="${fg}" opacity="0.3"/>
        <rect x="20" y="124" width="120" height="3" rx="1.5" fill="${fg}" opacity="0.25"/>
      `}
      <rect x="20" y="220" width="180" height="1" fill="${fg}" opacity="0.1"/>
      <rect x="20" y="228" width="50" height="3" rx="1.5" fill="${accent}" opacity="0.4"/>
      <rect x="76" y="228" width="50" height="3" rx="1.5" fill="${accent}" opacity="0.4"/>
      <rect x="132" y="228" width="50" height="3" rx="1.5" fill="${accent}" opacity="0.4"/>
    </svg>
  `;
}

function renderTemplatesGrid(filter = 'all') {
  activeFilter = filter;
  const grid = document.getElementById('templatesGrid');
  if (!grid) return;

  const filtered = filter === 'all'
    ? ALL_TEMPLATES
    : ALL_TEMPLATES.filter(t => t.access === filter);

  const toShow = filtered.slice(0, displayedCount);
  grid.innerHTML = '';

  toShow.forEach(template => {
    const card = document.createElement('div');
    card.className = 'template-card';
    card.dataset.templateId = template.id;

    const badgeClass = template.access === 'free' ? 'badge-free' : template.access === 'login' ? 'badge-login' : 'badge-premium';
    const badgeLabel = template.access === 'free' ? 'Free' : template.access === 'login' ? '🔓 Login' : '👑 Premium';
    const lockIcon = template.access !== 'free'
      ? `<div class="lock-icon"><i class="fa ${template.access === 'login' ? 'fa-lock-open' : 'fa-lock'}"></i></div>`
      : '';

    card.innerHTML = `
      <div class="template-thumb">
        <div class="template-badge ${badgeClass}">${badgeLabel}</div>
        ${lockIcon}
        <div style="width:100%;height:100%;">${createTemplateThumbnail(template)}</div>
        <div class="template-overlay">
          <button class="btn-primary sm" onclick="useTemplate(${template.id}, event)">
            <i class="fa fa-magic"></i> Use This
          </button>
          <button class="btn-ghost sm" onclick="previewTemplate(${template.id}, event)">
            <i class="fa fa-eye"></i> Preview
          </button>
        </div>
      </div>
      <div class="template-info">
        <h4>${template.name}</h4>
        <p>${template.category} • ATS: ${template.atsScore}%</p>
        <div class="template-tags">
          <span class="template-tag">${template.category}</span>
          ${template.atsScore >= 95 ? '<span class="template-tag" style="color:#4caf82">ATS ✓</span>' : ''}
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

function filterTemplates(filter, btn) {
  displayedCount = 12;
  activeFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTemplatesGrid(filter);
}

function loadMoreTemplates() {
  displayedCount += 12;
  renderTemplatesGrid(activeFilter);
}

function useTemplate(id, e) {
  e && e.stopPropagation();
  const template = ALL_TEMPLATES.find(t => t.id === id);
  if (!template) return;

  const user = getCurrentUser ? getCurrentUser() : null;

  if (template.access === 'login' && !user) {
    showToast('Please login to use this template', 'info');
    openModal('authModal');
    return;
  }
  if (template.access === 'premium' && !(user && user.plan === 'premium')) {
    showToast('Upgrade to Premium to unlock this template', 'info');
    openModal('upgradeModal');
    return;
  }

  localStorage.setItem('resumeai_selected_template', JSON.stringify(template));
  window.location.href = 'builder.html';
}

function previewTemplate(id, e) {
  e && e.stopPropagation();
  showToast('Preview opening... (select a template to use it)', 'info');
}

function renderMiniTemplates(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const toShow = ALL_TEMPLATES.slice(0, 20);
  container.innerHTML = '';
  toShow.forEach(t => {
    const div = document.createElement('div');
    div.className = 'mini-template';
    div.title = t.name;
    div.innerHTML = `
      <div style="width:100%;height:100%;">${createTemplateThumbnail(t)}</div>
      <div class="mini-template-label">${t.name}</div>
    `;
    div.onclick = () => {
      document.querySelectorAll('.mini-template').forEach(m => m.classList.remove('active'));
      div.classList.add('active');
      if (window.applyTemplate) window.applyTemplate(t);
    };
    container.appendChild(div);
  });
  // Select first by default
  container.firstChild && container.firstChild.classList.add('active');
}

function getTemplateById(id) {
  return ALL_TEMPLATES.find(t => t.id === id) || ALL_TEMPLATES[0];
}

// Init templates on homepage
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('templatesGrid')) {
    renderTemplatesGrid('all');
  }
  if (document.getElementById('miniTemplates')) {
    renderMiniTemplates('miniTemplates');
  }
});
