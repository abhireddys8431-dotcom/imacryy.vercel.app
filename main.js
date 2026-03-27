/* ============================================
   MAIN.JS — Homepage & Shared Interactions
   ============================================ */

// Smooth reveal animations on scroll
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.step-card, .feature-card, .template-card, .price-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
}

// Hero counter animation
function animateCounters() {
  const counters = [
    { el: document.querySelector('.hero-stats .stat:nth-child(1) strong'), target: 500, suffix: 'K+' },
    { el: document.querySelector('.hero-stats .stat:nth-child(3) strong'), target: 94, suffix: '%' },
    { el: document.querySelector('.hero-stats .stat:nth-child(5) strong'), target: 100, suffix: '+' },
  ];
  counters.forEach(({ el, target, suffix }) => {
    if (!el) return;
    let current = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = Math.floor(current) + suffix;
    }, 20);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  setTimeout(animateCounters, 500);
});
