/* ============================================
   BUILDER.JS — AI Resume Builder Core
   Uses Claude API via fetch for AI Q&A flow
   ============================================ */

// ---- STATE ----
let resumeData = {
  personalInfo: {},
  experience: [],
  education: [],
  skills: [],
  languages: [],
  certifications: [],
  summary: '',
  links: {}
};

let conversationHistory = [];
let currentStep = 0;
let selectedTemplate = null;
let zoomScale = 1;
let isTyping = false;

// Steps: 0=personal, 1=experience, 2=education, 3=skills, 4=template, 5=done
const STEPS = ['personal', 'experience', 'education', 'skills', 'template', 'done'];

// ---- SYSTEM PROMPT FOR AI ----
const SYSTEM_PROMPT = `You are ResumeAI, a professional resume building assistant. Your job is to gather information from the user to build a complete, HR-optimized resume.

You follow a structured flow:
1. **Personal Info**: Ask for full name, email, phone, location, job title/role, LinkedIn, portfolio (mark as NOT REQUIRED), GitHub (NOT REQUIRED unless tech role)
2. **Work Experience**: Ask for company, role, dates, key responsibilities/achievements (focus on quantified results). Ask for up to 3 positions. Mark older/extra positions as OPTIONAL.
3. **Education**: Degree, institution, graduation year, GPA (NOT REQUIRED), relevant coursework (NOT REQUIRED)
4. **Skills**: Technical skills, soft skills, tools. Suggest relevant skills based on their role.
5. **Optional Sections**: Languages (NOT REQUIRED), Certifications (NOT REQUIRED), Projects (NOT REQUIRED)
6. **AI Summary**: Generate a compelling professional summary based on the information gathered.

Important rules:
- Ask ONE thing at a time (max 2 related questions together)
- Clearly mark optional fields: say "(not required - skip if you prefer)"
- Be conversational and encouraging
- When user says "skip", "no", "none" - move on graciously
- After each section, confirm what you captured and ask if they want to add/change anything
- Give smart suggestions based on their role (e.g., suggest Python for data science roles)
- Be concise - no long paragraphs
- When you have all info, say "RESUME_COMPLETE" and provide a JSON summary

Always respond in JSON format like:
{
  "message": "Your conversational response here",
  "field": "which field you're asking about",
  "required": true/false,
  "quickReplies": ["option1", "option2"],
  "updateData": { optional partial resume data to update },
  "step": "personal/experience/education/skills/template/done"
}`;

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  // Load saved template if any
  const savedTemplate = localStorage.getItem('resumeai_selected_template');
  if (savedTemplate) {
    selectedTemplate = JSON.parse(savedTemplate);
    localStorage.removeItem('resumeai_selected_template');
  } else {
    selectedTemplate = { id: 1, name: 'Modern Pro', style: 'modern', accent: '#6c63ff' };
  }

  renderMiniTemplates('miniTemplates');
  updateProgress(0);
  startConversation();
});

// ---- CONVERSATION START ----
async function startConversation() {
  await delay(600);
  const greeting = {
    message: "Hi! I'm your ResumeAI assistant 👋 I'll help you build a professional resume that gets past ATS systems and impresses HR managers.\n\nLet's start with the basics. **What's your full name?**",
    field: "name",
    required: true,
    quickReplies: [],
    step: "personal"
  };
  displayAIMessage(greeting);
}

// ---- SEND MESSAGE ----
async function sendMessage() {
  const input = document.getElementById('userInput');
  const text = input.value.trim();
  if (!text || isTyping) return;

  input.value = '';
  input.style.height = 'auto';
  displayUserMessage(text);

  conversationHistory.push({ role: 'user', content: text });
  await getAIResponse(text);
}

function handleEnter(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

// ---- GET AI RESPONSE ----
async function getAIResponse(userMessage) {
  isTyping = true;
  showTypingIndicator();

  try {
    // Build context message
    const contextMsg = `Current resume data collected so far: ${JSON.stringify(resumeData)}
User message: ${userMessage}
Current step: ${STEPS[currentStep]}

Respond with valid JSON only. No markdown, no backticks.`;

    const messages = [
      ...conversationHistory.slice(-8), // Keep last 8 messages for context
      { role: 'user', content: contextMsg }
    ];

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: messages
      })
    });

    const data = await response.json();
    hideTypingIndicator();

    if (!data.content || !data.content[0]) {
      throw new Error('Empty response');
    }

    let rawText = data.content.map(c => c.text || '').join('');
    // Strip any markdown if present
    rawText = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      // Fallback if not JSON
      parsed = {
        message: rawText,
        field: '',
        required: false,
        quickReplies: [],
        step: STEPS[currentStep]
      };
    }

    // Update resume data if provided
    if (parsed.updateData) {
      mergeResumeData(parsed.updateData);
      renderResumePreview();
    }

    // Update step
    if (parsed.step && STEPS.indexOf(parsed.step) > currentStep) {
      currentStep = STEPS.indexOf(parsed.step);
      updateProgress(currentStep);

      // Show template selector at template step
      if (parsed.step === 'template') {
        document.getElementById('templateQuickSelect').classList.remove('hidden');
      }
    }

    conversationHistory.push({ role: 'assistant', content: rawText });
    displayAIMessage(parsed);
    isTyping = false;

  } catch (error) {
    hideTypingIndicator();
    isTyping = false;
    console.error('AI Error:', error);

    // Fallback response
    const fallback = getFallbackResponse(userMessage);
    displayAIMessage(fallback);
    processUserInput(userMessage, fallback);
  }
}

// ---- FALLBACK (when API unavailable) ----
const QUESTIONS = [
  { field: 'name', q: "What's your full name?", required: true, step: 'personal' },
  { field: 'title', q: "What's your current job title or the role you're applying for?", required: true, step: 'personal' },
  { field: 'email', q: "What's your email address?", required: true, step: 'personal' },
  { field: 'phone', q: "What's your phone number?", required: true, step: 'personal' },
  { field: 'location', q: "What's your location? (City, Country)", required: true, step: 'personal' },
  { field: 'linkedin', q: "What's your LinkedIn URL? (not required — skip if you prefer)", required: false, step: 'personal' },
  { field: 'portfolio', q: "Do you have a portfolio or website URL? (not required)", required: false, step: 'personal' },
  { field: 'exp1_company', q: "Let's add your work experience. What's the name of your most recent company?", required: true, step: 'experience' },
  { field: 'exp1_role', q: "What was your job title there?", required: true, step: 'experience' },
  { field: 'exp1_dates', q: "What were your start and end dates? (e.g. Jan 2022 – Present)", required: true, step: 'experience' },
  { field: 'exp1_desc', q: "Describe your key responsibilities and achievements. Focus on measurable impact (e.g. 'Increased sales by 30%'). What did you accomplish?", required: true, step: 'experience' },
  { field: 'exp2', q: "Do you have another work experience to add? (not required — say 'skip' to continue)", required: false, step: 'experience' },
  { field: 'edu_degree', q: "What's your highest level of education? (e.g. Bachelor's in Computer Science)", required: true, step: 'education' },
  { field: 'edu_school', q: "Which institution did you attend?", required: true, step: 'education' },
  { field: 'edu_year', q: "What year did you graduate (or expected graduation)?", required: true, step: 'education' },
  { field: 'edu_gpa', q: "What was your GPA? (not required — skip if below 3.5 or prefer not to show)", required: false, step: 'education' },
  { field: 'skills', q: "List your top skills, tools and technologies. Separate them with commas. (e.g. Python, React, Project Management, SQL)", required: true, step: 'skills' },
  { field: 'languages', q: "Do you speak any languages other than English? (not required — format: Spanish (Fluent))", required: false, step: 'skills' },
  { field: 'certs', q: "Any certifications or courses? (not required — e.g. AWS Certified, PMP, Google Analytics)", required: false, step: 'skills' },
  { field: 'template', q: "Great! Almost done 🎉 Choose a template from the panel on the right. Which style do you prefer?", required: false, step: 'template',
    quickReplies: ['Modern', 'Classic', 'Minimal', 'Bold', 'Tech'] },
  { field: 'done', q: "Your resume is ready! 🎉 Click **Export PDF** to download it. You can also go back and edit any section.", required: false, step: 'done' }
];

let fallbackIdx = 0;

function getFallbackResponse(userMessage) {
  // Process the answer before showing next question
  const currentQ = QUESTIONS[Math.min(fallbackIdx, QUESTIONS.length - 1)];
  updateResumeFromFallback(currentQ.field, userMessage);

  fallbackIdx = Math.min(fallbackIdx + 1, QUESTIONS.length - 1);
  const nextQ = QUESTIONS[fallbackIdx];

  return {
    message: nextQ.q,
    field: nextQ.field,
    required: nextQ.required,
    quickReplies: nextQ.quickReplies || [],
    step: nextQ.step,
    updateData: null
  };
}

function updateResumeFromFallback(field, value) {
  const skip = ['skip', 'no', 'none', 'n/a', '-', ''].includes(value.toLowerCase().trim());
  if (skip) return;

  if (field === 'name') resumeData.personalInfo.name = value;
  else if (field === 'title') resumeData.personalInfo.title = value;
  else if (field === 'email') resumeData.personalInfo.email = value;
  else if (field === 'phone') resumeData.personalInfo.phone = value;
  else if (field === 'location') resumeData.personalInfo.location = value;
  else if (field === 'linkedin') resumeData.links.linkedin = value;
  else if (field === 'portfolio') resumeData.links.portfolio = value;
  else if (field === 'exp1_company') {
    if (!resumeData.experience[0]) resumeData.experience[0] = {};
    resumeData.experience[0].company = value;
  }
  else if (field === 'exp1_role') resumeData.experience[0].role = value;
  else if (field === 'exp1_dates') resumeData.experience[0].dates = value;
  else if (field === 'exp1_desc') resumeData.experience[0].description = value;
  else if (field === 'exp2' && !skip) {
    resumeData.experience[1] = { company: value, role: '', dates: '', description: '' };
  }
  else if (field === 'edu_degree') {
    resumeData.education[0] = { degree: value };
  }
  else if (field === 'edu_school') resumeData.education[0].school = value;
  else if (field === 'edu_year') resumeData.education[0].year = value;
  else if (field === 'edu_gpa') resumeData.education[0].gpa = value;
  else if (field === 'skills') {
    resumeData.skills = value.split(',').map(s => s.trim()).filter(Boolean);
  }
  else if (field === 'languages') resumeData.languages = [value];
  else if (field === 'certs') resumeData.certifications = [value];

  // Generate summary if we have enough info
  if (resumeData.personalInfo.name && resumeData.personalInfo.title && resumeData.experience.length > 0) {
    resumeData.summary = generateSummary();
  }

  renderResumePreview();
}

function processUserInput(userMessage, parsed) {
  // handled by updateResumeFromFallback
}

// ---- AUTO SUMMARY GENERATOR ----
function generateSummary() {
  const { name, title } = resumeData.personalInfo;
  const exp = resumeData.experience[0];
  const skills = resumeData.skills.slice(0, 3).join(', ');

  if (!name || !title) return '';

  const yearsExp = exp ? '3+' : '2+';
  return `Results-driven ${title} with ${yearsExp} years of experience${exp ? ` at ${exp.company}` : ''}. ${skills ? `Proficient in ${skills}. ` : ''}Passionate about delivering high-quality results and driving meaningful impact.`;
}

// ---- MERGE RESUME DATA ----
function mergeResumeData(update) {
  if (!update) return;
  Object.keys(update).forEach(key => {
    if (typeof update[key] === 'object' && !Array.isArray(update[key])) {
      resumeData[key] = { ...resumeData[key], ...update[key] };
    } else {
      resumeData[key] = update[key];
    }
  });
}

// ---- DISPLAY MESSAGES ----
function displayAIMessage(parsed) {
  const chat = document.getElementById('aiChat');
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const msgDiv = document.createElement('div');
  msgDiv.className = 'chat-msg ai';

  const requiredBadge = parsed.required === false
    ? `<span class="not-required-badge"><i class="fa fa-info-circle"></i> Optional</span>`
    : '';

  msgDiv.innerHTML = `
    <div class="msg-avatar"><i class="fa fa-robot"></i></div>
    <div class="msg-content">
      ${parsed.field ? `<span class="field-label">${parsed.field.replace(/_/g, ' ')}${requiredBadge}</span>` : ''}
      <div class="msg-bubble">${formatMessage(parsed.message)}</div>
      <div class="msg-time">${time}</div>
    </div>
  `;
  chat.appendChild(msgDiv);
  chat.scrollTop = chat.scrollHeight;

  // Quick replies
  if (parsed.quickReplies && parsed.quickReplies.length > 0) {
    setQuickReplies(parsed.quickReplies);
  } else {
    clearQuickReplies();
  }
}

function displayUserMessage(text) {
  const chat = document.getElementById('aiChat');
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const msgDiv = document.createElement('div');
  msgDiv.className = 'chat-msg user';
  msgDiv.innerHTML = `
    <div class="msg-avatar"><i class="fa fa-user"></i></div>
    <div class="msg-content">
      <div class="msg-bubble">${escapeHtml(text)}</div>
      <div class="msg-time">${time}</div>
    </div>
  `;
  chat.appendChild(msgDiv);
  chat.scrollTop = chat.scrollHeight;
}

function formatMessage(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
    .replace(/_(.*?)_/g, '<em>$1</em>');
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ---- TYPING INDICATOR ----
function showTypingIndicator() {
  const chat = document.getElementById('aiChat');
  const div = document.createElement('div');
  div.id = 'typingIndicator';
  div.className = 'chat-msg ai';
  div.innerHTML = `
    <div class="msg-avatar"><i class="fa fa-robot"></i></div>
    <div class="msg-content">
      <div class="msg-bubble" style="padding:8px 16px;">
        <div class="typing-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  `;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}
function hideTypingIndicator() {
  document.getElementById('typingIndicator')?.remove();
}

// ---- QUICK REPLIES ----
function setQuickReplies(replies) {
  const qr = document.getElementById('quickActions');
  qr.innerHTML = replies.map(r =>
    `<button class="quick-btn" onclick="quickReply('${r}')">${r}</button>`
  ).join('');
}
function clearQuickReplies() {
  const qr = document.getElementById('quickActions');
  if (qr) qr.innerHTML = '';
}
function quickReply(text) {
  document.getElementById('userInput').value = text;
  sendMessage();
}

// ---- PROGRESS ----
function updateProgress(step) {
  const steps = document.querySelectorAll('.prog-step');
  steps.forEach((s, i) => {
    s.classList.remove('active', 'done');
    if (i < step) s.classList.add('done');
    else if (i === step) s.classList.add('active');
  });
}

// ---- RESUME PREVIEW RENDERING ----
function renderResumePreview() {
  const preview = document.getElementById('resumePreview');
  if (!preview) return;

  const tpl = selectedTemplate || { style: 'modern', accent: '#6c63ff' };
  const html = generateResumeHTML(resumeData, tpl);
  preview.innerHTML = html;
}

function generateResumeHTML(data, template) {
  const style = template.style || 'modern';
  const accent = template.accent || '#6c63ff';

  if (style === 'classic') return generateClassicResume(data, accent);
  if (style === 'minimal') return generateMinimalResume(data, accent);
  return generateModernResume(data, accent);
}

function generateModernResume(data, accent) {
  const p = data.personalInfo;
  const exp = data.experience;
  const edu = data.education;
  const skills = data.skills;

  return `
  <div style="font-family:'Georgia',serif;color:#1a1a1a;height:100%;">
    <!-- Header -->
    <div style="background:${accent};color:#fff;padding:40px;display:flex;justify-content:space-between;align-items:flex-start;">
      <div>
        <div style="font-size:28px;font-weight:700;margin-bottom:6px;">${p.name || 'Your Name'}</div>
        <div style="font-size:15px;opacity:0.85;">${p.title || 'Your Job Title'}</div>
      </div>
      <div style="text-align:right;font-size:12px;opacity:0.9;line-height:1.8;">
        ${p.email ? `<div>✉ ${p.email}</div>` : ''}
        ${p.phone ? `<div>📞 ${p.phone}</div>` : ''}
        ${p.location ? `<div>📍 ${p.location}</div>` : ''}
        ${data.links.linkedin ? `<div>🔗 LinkedIn</div>` : ''}
      </div>
    </div>
    <!-- Body -->
    <div style="display:grid;grid-template-columns:1fr 2fr;">
      <!-- Sidebar -->
      <div style="background:#f8f8fc;padding:28px 20px;min-height:calc(100% - 108px);">
        ${data.summary ? `
          <div style="margin-bottom:24px;">
            <div style="font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${accent};border-bottom:2px solid ${accent};padding-bottom:5px;margin-bottom:10px;">SUMMARY</div>
            <p style="font-size:12px;color:#444;line-height:1.6;">${data.summary}</p>
          </div>` : ''}
        ${skills.length > 0 ? `
          <div style="margin-bottom:24px;">
            <div style="font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${accent};border-bottom:2px solid ${accent};padding-bottom:5px;margin-bottom:10px;">SKILLS</div>
            ${skills.map(s => `<span style="display:inline-block;background:#e8e6ff;color:${accent};padding:3px 8px;border-radius:3px;font-size:11px;font-weight:500;margin:3px 2px 0 0;">${s}</span>`).join('')}
          </div>` : ''}
        ${edu.length > 0 ? `
          <div style="margin-bottom:24px;">
            <div style="font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${accent};border-bottom:2px solid ${accent};padding-bottom:5px;margin-bottom:10px;">EDUCATION</div>
            ${edu.map(e => `
              <div style="margin-bottom:12px;">
                <div style="font-weight:700;font-size:12px;">${e.degree || ''}</div>
                <div style="font-size:11px;color:#666;">${e.school || ''}</div>
                <div style="font-size:11px;color:#888;">${e.year || ''}${e.gpa ? ' • GPA: ' + e.gpa : ''}</div>
              </div>`).join('')}
          </div>` : ''}
        ${data.languages.length > 0 ? `
          <div>
            <div style="font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${accent};border-bottom:2px solid ${accent};padding-bottom:5px;margin-bottom:10px;">LANGUAGES</div>
            ${data.languages.map(l => `<div style="font-size:12px;color:#444;padding:3px 0;">${l}</div>`).join('')}
          </div>` : ''}
      </div>
      <!-- Main Content -->
      <div style="padding:28px;">
        ${exp.length > 0 ? `
          <div style="margin-bottom:28px;">
            <div style="font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${accent};border-bottom:2px solid ${accent};padding-bottom:5px;margin-bottom:16px;">EXPERIENCE</div>
            ${exp.filter(e => e.company).map(e => `
              <div style="margin-bottom:18px;">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:3px;">
                  <div style="font-weight:700;font-size:14px;">${e.role || ''}</div>
                  <div style="font-size:11px;color:#888;white-space:nowrap;margin-left:8px;">${e.dates || ''}</div>
                </div>
                <div style="font-size:12px;color:${accent};margin-bottom:6px;font-weight:600;">${e.company || ''}</div>
                <div style="font-size:12px;color:#444;line-height:1.7;">${e.description || ''}</div>
              </div>`).join('')}
          </div>` : `
          <div style="background:#f8f8fc;border-radius:8px;padding:24px;text-align:center;color:#aaa;font-size:13px;margin-bottom:24px;">
            <div style="font-size:32px;margin-bottom:8px;">💼</div>
            Your experience will appear here
          </div>`}
        ${data.certifications.length > 0 ? `
          <div>
            <div style="font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${accent};border-bottom:2px solid ${accent};padding-bottom:5px;margin-bottom:12px;">CERTIFICATIONS</div>
            ${data.certifications.map(c => `<div style="font-size:12px;color:#444;padding:4px 0;">• ${c}</div>`).join('')}
          </div>` : ''}
      </div>
    </div>
  </div>`;
}

function generateClassicResume(data, accent) {
  const p = data.personalInfo;
  const exp = data.experience;
  const edu = data.education;

  return `
  <div style="font-family:'Times New Roman',serif;color:#1a1a1a;padding:48px;">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:28px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">${p.name || 'Your Name'}</div>
      <div style="font-size:14px;color:#555;margin:6px 0;">${p.title || 'Professional Title'}</div>
      <div style="font-size:12px;color:#777;">${[p.email, p.phone, p.location].filter(Boolean).join(' | ')}</div>
    </div>
    <hr style="border:none;border-top:2px solid #333;margin:16px 0;"/>
    ${data.summary ? `<div style="margin-bottom:20px;"><div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;">PROFESSIONAL SUMMARY</div><p style="font-size:13px;color:#444;line-height:1.7;">${data.summary}</p></div>` : ''}
    ${exp.length > 0 ? `
    <div style="margin-bottom:20px;">
      <div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;border-bottom:1px solid #ccc;padding-bottom:4px;margin-bottom:12px;">WORK EXPERIENCE</div>
      ${exp.filter(e => e.company).map(e => `
        <div style="margin-bottom:16px;">
          <div style="display:flex;justify-content:space-between;"><strong style="font-size:14px;">${e.role}</strong><span style="font-size:12px;color:#777;">${e.dates}</span></div>
          <div style="font-size:12px;color:${accent};font-style:italic;margin:3px 0;">${e.company}</div>
          <div style="font-size:12px;color:#444;line-height:1.7;">${e.description}</div>
        </div>`).join('')}
    </div>` : ''}
    ${edu.length > 0 ? `
    <div style="margin-bottom:20px;">
      <div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;border-bottom:1px solid #ccc;padding-bottom:4px;margin-bottom:12px;">EDUCATION</div>
      ${edu.map(e => `<div style="margin-bottom:12px;"><strong>${e.degree}</strong> — ${e.school}<div style="font-size:12px;color:#777;">${e.year}${e.gpa ? ' | GPA: ' + e.gpa : ''}</div></div>`).join('')}
    </div>` : ''}
    ${data.skills.length > 0 ? `
    <div>
      <div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;border-bottom:1px solid #ccc;padding-bottom:4px;margin-bottom:12px;">SKILLS</div>
      <div style="font-size:13px;color:#444;">${data.skills.join(' • ')}</div>
    </div>` : ''}
  </div>`;
}

function generateMinimalResume(data, accent) {
  const p = data.personalInfo;
  const exp = data.experience;
  const edu = data.education;

  return `
  <div style="font-family:'Arial',sans-serif;color:#111;padding:48px;">
    <div style="margin-bottom:36px;">
      <div style="font-size:38px;font-weight:900;letter-spacing:-1.5px;">${p.name || 'Your Name'}</div>
      <div style="font-size:16px;color:#777;margin:4px 0;">${p.title || 'Professional Title'}</div>
      <div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:8px;">
        ${p.email ? `<span style="font-size:12px;color:#555;">${p.email}</span>` : ''}
        ${p.phone ? `<span style="font-size:12px;color:#555;">${p.phone}</span>` : ''}
        ${p.location ? `<span style="font-size:12px;color:#555;">${p.location}</span>` : ''}
      </div>
    </div>
    ${data.summary ? `
    <div style="margin-bottom:28px;border-left:3px solid ${accent};padding-left:16px;">
      <p style="font-size:13px;color:#444;line-height:1.7;">${data.summary}</p>
    </div>` : ''}
    ${exp.length > 0 ? `
    <div style="margin-bottom:28px;">
      <div style="font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin-bottom:16px;color:#111;">EXPERIENCE</div>
      <div style="width:24px;height:2px;background:${accent};margin-bottom:16px;"></div>
      ${exp.filter(e => e.company).map(e => `
        <div style="margin-bottom:20px;padding-left:0;">
          <div style="display:flex;justify-content:space-between;align-items:baseline;">
            <strong style="font-size:15px;">${e.role}</strong>
            <span style="font-size:11px;color:#888;">${e.dates}</span>
          </div>
          <div style="font-size:12px;color:${accent};margin:3px 0;font-weight:600;">${e.company}</div>
          <div style="font-size:12px;color:#555;line-height:1.7;">${e.description}</div>
        </div>`).join('')}
    </div>` : ''}
    ${edu.length > 0 ? `
    <div style="margin-bottom:28px;">
      <div style="font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin-bottom:16px;">EDUCATION</div>
      <div style="width:24px;height:2px;background:${accent};margin-bottom:16px;"></div>
      ${edu.map(e => `<div><strong>${e.degree}</strong><div style="font-size:12px;color:#777;">${e.school} • ${e.year}</div></div>`).join('')}
    </div>` : ''}
    ${data.skills.length > 0 ? `
    <div>
      <div style="font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin-bottom:16px;">SKILLS</div>
      <div style="width:24px;height:2px;background:${accent};margin-bottom:16px;"></div>
      <div>${data.skills.map(s => `<span style="display:inline-block;border:1px solid #ddd;padding:4px 10px;border-radius:4px;font-size:12px;margin:3px 3px 0 0;">${s}</span>`).join('')}</div>
    </div>` : ''}
  </div>`;
}

// ---- TEMPLATE APPLICATION ----
window.applyTemplate = function(template) {
  selectedTemplate = template;
  renderResumePreview();
};

// ---- ZOOM ----
let zoomLevel = 1;
function zoomIn() {
  zoomLevel = Math.min(zoomLevel + 0.1, 1.5);
  applyZoom();
}
function zoomOut() {
  zoomLevel = Math.max(zoomLevel - 0.1, 0.5);
  applyZoom();
}
function applyZoom() {
  const preview = document.getElementById('resumePreview');
  if (preview) preview.style.transform = `scale(${zoomLevel})`;
  document.getElementById('zoomLevel').textContent = Math.round(zoomLevel * 100) + '%';
}

// ---- EXPORT PDF ----
function exportPDF() {
  showToast('Preparing your PDF... (use Ctrl+P / Cmd+P to print as PDF in demo)', 'info');

  const preview = document.getElementById('resumePreview');
  const win = window.open('', '_blank');
  win.document.write(`
    <!DOCTYPE html><html><head>
    <title>${resumeData.personalInfo.name || 'Resume'} - Resume</title>
    <style>body{margin:0;} @page{margin:0;size:A4;}</style>
    </head><body>${preview.innerHTML}</body></html>
  `);
  win.document.close();
  setTimeout(() => win.print(), 500);
}

// ---- SAVE DRAFT ----
function saveDraft() {
  const drafts = JSON.parse(localStorage.getItem('resumeai_drafts') || '[]');
  const draft = {
    id: Date.now(),
    name: resumeData.personalInfo.name || 'Untitled Resume',
    data: resumeData,
    template: selectedTemplate,
    savedAt: new Date().toISOString()
  };
  drafts.unshift(draft);
  localStorage.setItem('resumeai_drafts', JSON.stringify(drafts.slice(0, 10)));
  showToast('Draft saved! ✓', 'success');
}

// ---- MOBILE TOGGLE ----
function showPanel(panel) {
  const aiPanel = document.getElementById('aiPanel');
  const previewPanel = document.getElementById('previewPanel');
  document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));

  if (panel === 'ai') {
    aiPanel.style.display = 'flex';
    previewPanel.style.display = 'none';
    document.querySelectorAll('.toggle-btn')[0].classList.add('active');
  } else {
    aiPanel.style.display = 'none';
    previewPanel.style.display = 'flex';
    document.querySelectorAll('.toggle-btn')[1].classList.add('active');
  }
}

// ---- UTILS ----
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
