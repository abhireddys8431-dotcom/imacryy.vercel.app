# ResumeAI — AI-Powered Resume Builder

## Overview
A full-featured, responsive web app for building professional resumes using AI (Claude API). Supports 100+ templates with free, login-required, and premium tiers.

## Features
- 🤖 **AI Resume Builder** — Conversational AI asks targeted questions and builds your resume
- 📄 **100+ Templates** — Free, Login-only, and Premium templates
- 💳 **Monetization** — 3-tier access: Free / Login / Premium ($9/mo or $49/yr)
- 📱 **Fully Responsive** — Works on mobile and desktop
- 🎯 **ATS Optimized** — All templates pass Applicant Tracking Systems
- 💾 **Draft Saving** — Save and manage multiple resumes
- 📤 **PDF Export** — One-click PDF download
- 🔐 **Auth System** — Login/Signup with session persistence

## Project Structure
```
resume-builder/
├── index.html          # Homepage with hero, templates, pricing
├── builder.html        # AI Resume Builder interface
├── dashboard.html      # User dashboard
├── css/
│   ├── main.css        # Main stylesheet (dark theme)
│   └── builder.css     # Builder-specific styles
└── js/
    ├── auth.js         # Authentication, user state, modals
    ├── templates.js    # 100+ template library & rendering
    ├── builder.js      # AI chat builder core (Claude API)
    ├── main.js         # Homepage interactions
    └── dashboard.js    # Dashboard logic
```

## Setup & Running

### Option 1: Open directly
Just open `index.html` in any modern browser. No server needed for basic functionality.

### Option 2: Local server (recommended)
```bash
cd resume-builder
npx serve .
# or
python3 -m http.server 3000
```

## Claude API Integration
The builder uses the Claude API (claude-sonnet-4-20250514) for AI conversations.

**How it works:**
1. User answers AI questions in the chat panel
2. AI extracts structured data (name, experience, skills, etc.)
3. Resume preview updates in real-time
4. User picks a template and exports PDF

**API Setup:**
The Anthropic API key is handled automatically via the proxy when embedded in Claude artifacts. For standalone deployment:
1. Get an API key from https://console.anthropic.com
2. Add a backend proxy or use the Anthropic SDK
3. Update the fetch URL in `js/builder.js`

**Fallback Mode:**
When the API is unavailable, the builder switches to a rule-based Q&A fallback that still builds complete resumes.

## Template System

### Access Tiers
| Tier | Templates | Requirements |
|------|-----------|-------------|
| Free | 5 templates | None |
| Login | 50+ templates | Free account |
| Premium | 100+ templates | $9/month or $49/year |

### Template Styles
- Modern, Classic, Minimal, Tech, Bold, Executive, Creative, Finance, Academic, Healthcare, and more

### Adding Templates
To add more templates, edit `js/templates.js`:
```js
TEMPLATE_STYLES.push({
  name: 'My Template',
  style: 'modern',  // Use existing renderer
  category: 'Professional',
  accent: '#your-color',
  access: 'premium'  // 'free' | 'login' | 'premium'
});
```

## Monetization
- **Free**: 5 templates, AI builder, PDF export
- **Login (Free)**: 50+ templates, save resumes, dashboard
- **Premium ($9/mo or $49/yr)**: All 100+ templates, priority AI, cover letter AI

### Payment Integration
Replace `handleUpgrade()` in `js/auth.js` with your payment provider:
- Stripe: https://stripe.com
- Razorpay (India): https://razorpay.com
- Paddle: https://paddle.com

## Production Deployment
1. Host on Vercel, Netlify, or any static host
2. Add a backend (Node.js/Python) for:
   - Real authentication (Firebase, Auth0, Supabase)
   - Claude API proxy (to hide API keys)
   - Payment processing (Stripe)
   - Database (save resumes server-side)

## Browser Support
Chrome, Firefox, Safari, Edge (all modern versions)

## License
MIT — Free to use and modify
