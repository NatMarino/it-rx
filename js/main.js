// Mobile nav toggle
const burger = document.getElementById('nav-burger');
const navLinks = document.getElementById('nav-links');
burger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('is-open');
  burger.setAttribute('aria-expanded', open);
});
navLinks.addEventListener('click', () => navLinks.classList.remove('is-open'));

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

// Contact form -> mailto
document.getElementById('contact-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;
  if (!form.reportValidity()) return;
  const email = form.elements.email.value.trim();
  const message = form.elements.message.value.trim();
  const subject = encodeURIComponent('Website inquiry — IT Prescription');
  const body = encodeURIComponent(`From: ${email}\n\n${message}`);
  window.location.href = `mailto:nmartinez@itprescription.com?subject=${subject}&body=${body}`;
});

// Retro window close button — playful placeholder: collapse and bring it back
document.querySelector('.window__close').addEventListener('click', () => {
  const win = document.querySelector('.window');
  win.style.transition = 'opacity .25s ease';
  win.style.opacity = '0';
  setTimeout(() => {
    win.style.opacity = '1';
  }, 1200);
});
