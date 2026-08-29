const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Mobile nav — slides out of the dark navbar blob; closes on link tap,
// any click outside the panel, or Escape
const burger = $('#nav-burger');
const navLinks = $('#nav-links');
if (burger && navLinks) {
  const setNav = (open) => {
    navLinks.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
  };
  burger.addEventListener('click', (e) => {
    e.stopPropagation();
    setNav(!navLinks.classList.contains('is-open'));
  });
  navLinks.addEventListener('click', () => setNav(false));
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('is-open') && !navLinks.contains(e.target)) setNav(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setNav(false);
  });
  if (location.hash === '#test-menu') setNav(true);
}

// Services carousel dots (mobile only — grid becomes scroll-snap under 880px)
const grid = $('#services-grid');
const dotsWrap = $('#services-dots');
if (grid && dotsWrap) {
  const cards = Array.from(grid.children);
  const setActiveDot = (idx) => {
    dotsWrap.querySelectorAll('button').forEach((d, i) => {
      d.classList.toggle('is-active', i === idx);
      if (i === idx) d.setAttribute('aria-current', 'true');
      else d.removeAttribute('aria-current');
    });
  };
  cards.forEach((card, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    const title = card.querySelector('.card__head h3');
    dot.setAttribute('aria-label', title ? title.textContent : `service ${i + 1}`);
    if (i === 0) { dot.classList.add('is-active'); dot.setAttribute('aria-current', 'true'); }
    dot.addEventListener('click', () => {
      cards[i].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
    dotsWrap.appendChild(dot);
  });
  grid.addEventListener('scroll', () => {
    const center = grid.scrollLeft + grid.clientWidth / 2;
    let nearest = 0;
    let best = Infinity;
    cards.forEach((card, i) => {
      const mid = card.offsetLeft + card.offsetWidth / 2;
      const dist = Math.abs(mid - center);
      if (dist < best) { best = dist; nearest = i; }
    });
    setActiveDot(nearest);
  }, { passive: true });
}

// CTA hover swap — measure how far the icon and label travel to trade places
function measureCtaSwaps() {
  $$('.cta').forEach((cta) => {
    const icon = cta.querySelector('.cta__iconwrap');
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
const contactForm = $('#contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!contactForm.reportValidity()) return;
    const submitBtn = contactForm.querySelector('.submit-btn');
    const errorBox = $('#form-error');
    errorBox.hidden = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'sending...';
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          email: contactForm.elements.email.value.trim(),
          message: contactForm.elements.message.value.trim(),
          _subject: 'Website inquiry — IT Prescription',
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      contactForm.hidden = true;
      $('#contact-success').hidden = false;
      $('#window-title').textContent = 'Your prescription is being written!';
      $('#contact-success .success-text').focus();
    } catch (err) {
      errorBox.hidden = false;
      submitBtn.disabled = false;
      submitBtn.textContent = 'submit';
      submitBtn.focus();
    }
  });

  // Dev hook: open the page with #test-success to preview the submit variant
  if (location.hash === '#test-success') {
    contactForm.hidden = true;
    $('#contact-success').hidden = false;
    $('#window-title').textContent = 'Your prescription is being written!';
  }
}

// Floating scroll-to-top button
const toTop = $('#to-top');
if (toTop) {
  const onScroll = () => toTop.classList.toggle('is-visible', window.scrollY > 500);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }));
}

// Scroll-in reveals — subtle fade/rise as sections enter the viewport,
// with a small stagger inside grids. CTAs get a one-shot wag on arrival.
if (!reducedMotion && 'IntersectionObserver' in document.defaultView) {
  const targets = $$([
    '.section-title', '.brands__head', '.brands__sub', '.brands__row',
    '.trust__title', '.services__sub', '.card', '.services__cta-title',
    '.experience__sub', '.triple__col', '.experience__creds',
    '.banner', '.scalable__title', '.mission__head', '.mission__intro',
    '.mission__photo', '.value', '.mission__outro', '.signup__title',
    '.signup__logo-row', '.window', '.cta', '.coming-soon__title', '.coming-soon__text',
  ].join(', '));
  targets.forEach((el) => el.classList.add('reveal'));
  $$('.services__grid .card').forEach((c, i) => { c.style.transitionDelay = `${(i % 3) * 110}ms`; });
  $$('.triple__col').forEach((c, i) => { c.style.transitionDelay = `${(i % 3) * 130}ms`; });
  $$('.value').forEach((c, i) => { c.style.transitionDelay = `${i * 120}ms`; });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-inview');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  targets.forEach((el) => io.observe(el));
}
