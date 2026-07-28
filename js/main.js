// Mobile nav toggle — slides out of the dark navbar blob; closes on
// link tap, outside click, or Escape
const burger = document.getElementById('nav-burger');
const navLinks = document.getElementById('nav-links');
function setNav(open) {
  navLinks.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', open);
}
burger.addEventListener('click', () => setNav(!navLinks.classList.contains('is-open')));
navLinks.addEventListener('click', () => setNav(false));
document.addEventListener('click', (e) => {
  if (navLinks.classList.contains('is-open') && !e.target.closest('.navbar')) setNav(false);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') setNav(false);
});

// Services carousel dots (mobile only — grid becomes scroll-snap under 880px)
const grid = document.getElementById('services-grid');
const dotsWrap = document.getElementById('services-dots');
const cards = Array.from(grid.children);

cards.forEach((_, i) => {
  const dot = document.createElement('button');
  if (i === 0) dot.classList.add('is-active');
  dot.addEventListener('click', () => {
    cards[i].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  });
  dotsWrap.appendChild(dot);
});

grid.addEventListener('scroll', () => {
  const center = grid.scrollLeft + grid.clientWidth / 2;
  let nearest = 0, best = Infinity;
  cards.forEach((card, i) => {
    const mid = card.offsetLeft + card.offsetWidth / 2;
    const dist = Math.abs(mid - center);
    if (dist < best) { best = dist; nearest = i; }
  });
  dotsWrap.querySelectorAll('button').forEach((d, i) =>
    d.classList.toggle('is-active', i === nearest));
}, { passive: true });

// CTA hover swap — measure how far the icon and label travel to trade places
function measureCtaSwaps() {
  document.querySelectorAll('.cta').forEach((cta) => {
    const icon = cta.querySelector('.cta__icon');
    const label = cta.querySelector('.cta__label');
    if (!icon || !label) return;
    const gap = parseFloat(getComputedStyle(cta.querySelector('.cta__body')).gap) || 0;
    cta.style.setProperty('--icon-shift', `${label.offsetWidth + gap}px`);
    cta.style.setProperty('--label-shift', `${-(icon.offsetWidth + gap)}px`);
  });
}
measureCtaSwaps();
window.addEventListener('resize', measureCtaSwaps);
window.addEventListener('load', measureCtaSwaps);

// Contact form — deliver via FormSubmit to the inquiries inbox, then show
// the window component's submit variant as the success state.
const FORM_ENDPOINT = 'https://formsubmit.co/ajax/nmartinez@itprescription.com';

document.getElementById('contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  if (!form.reportValidity()) return;
  const submitBtn = form.querySelector('.submit-btn');
  const errorBox = document.getElementById('form-error');
  errorBox.hidden = true;
  submitBtn.disabled = true;
  submitBtn.textContent = 'sending...';
  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        email: form.elements.email.value.trim(),
        message: form.elements.message.value.trim(),
        _subject: 'Website inquiry — IT Prescription',
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    form.hidden = true;
    document.getElementById('contact-success').hidden = false;
    document.getElementById('window-title').textContent = 'Your prescription is being written!';
  } catch (err) {
    errorBox.hidden = false;
    submitBtn.disabled = false;
    submitBtn.textContent = 'submit';
  }
});

// Dev hook: open the page with #test-menu to preview the open mobile menu
if (location.hash === '#test-menu') setNav(true);

// Dev hook: open the page with #test-success to preview the submit variant
if (location.hash === '#test-success') {
  document.getElementById('contact-form').hidden = true;
  document.getElementById('contact-success').hidden = false;
  document.getElementById('window-title').textContent = 'Your prescription is being written!';
}

// Retro window close button — playful placeholder: collapse and bring it back
document.querySelector('.window__close').addEventListener('click', () => {
  const win = document.querySelector('.window');
  win.style.transition = 'opacity .25s ease';
  win.style.opacity = '0';
  setTimeout(() => {
    win.style.opacity = '1';
  }, 1200);
});
