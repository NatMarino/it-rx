/* ============================================================
   ITRX — Home behaviours.
   Static translation of the design system's DCLogic classes
   (SiteNav, SiteFooter, Home) into plain DOM code. No build,
   no framework, matching the rest of the repo.
   ============================================================ */

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------- nav: mobile dropdown ---------------- */

const burger = document.getElementById('nav-burger');
const drop = document.getElementById('nav-drop');

if (burger && drop) {
  burger.addEventListener('click', () => {
    const open = drop.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });

  // close on outside click and on Escape, so the panel can't strand focus
  document.addEventListener('click', (e) => {
    if (!drop.classList.contains('is-open')) return;
    if (drop.contains(e.target) || burger.contains(e.target)) return;
    drop.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !drop.classList.contains('is-open')) return;
    drop.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.focus();
  });
  // the panel is desktop-hidden by CSS; drop the open state when we cross back
  matchMedia('(min-width: 981px)').addEventListener('change', (e) => {
    if (!e.matches) return;
    drop.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  });
}

/* ---------------- sticky nav shade ---------------- */

const navEl = document.querySelector('.nav');
const navH = () => (navEl ? navEl.getBoundingClientRect().height : 84);

if (navEl) {
  const onNavScroll = () => navEl.classList.toggle('is-stuck', window.scrollY > 8);
  window.addEventListener('scroll', onNavScroll, { passive: true });
  onNavScroll();
}

/* ---------------- links to the page you are already on ---------------- */

/* A link whose href is the current URL is a no-op that the browser answers by
   restoring the old scroll position, so the nav's own entry looks dead. Send it
   to the top of the page, which is what clicking it is asking for. Links with a
   #hash are left alone: the browser lands them correctly via scroll-margin-top. */

const samePageLink = (a) => {
  const href = a.getAttribute('href');
  if (!href || href.startsWith('mailto:') || href.startsWith('tel:')) return false;
  let u;
  try { u = new URL(href, location.href); } catch (err) { return false; }
  if (u.origin !== location.origin || u.hash) return false;
  const norm = (p) => p.replace(/\/index\.html$/, '/');
  return norm(u.pathname) === norm(location.pathname) && u.search === location.search;
};

document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const el = e.target instanceof Element ? e.target : null;
  const a = el ? el.closest('a[href]') : null;
  if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
  if (!samePageLink(a)) return;
  e.preventDefault();
  if (drop && drop.classList.contains('is-open')) {
    drop.classList.remove('is-open');
    if (burger) burger.setAttribute('aria-expanded', 'false');
  }
  window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
});

/* ---------------- chat demo ---------------- */

const SCRIPT = [
  { who: 'them', text: "Our firewall license runs out next month, and we need about 20 laptops for new hires." },
  { who: 'us',   text: "Which firewall model are you on? Some older units can't run current firmware, so renewing might not be the best spend." },
  { who: 'them', text: "The one you installed a few years back, I think." },
  { who: 'us',   text: "Found it. It's close to end of support, so I priced a renewal and a replacement side by side. The laptops are imaged to match your current fleet.", file: 'quote-2291.pdf' },
  { who: 'them', text: "That comparison helps a lot. Let's go with the replacement." },
  { who: 'us',   text: "Sounds good. We'll plan the swap around your schedule so nobody loses a workday." }
];

const chatLog = document.getElementById('chat-log');
const chatReplay = document.getElementById('chat-replay');

if (chatLog) {
  let timer = null;

  const bubble = (m) => {
    const el = document.createElement('div');
    el.className = m.who === 'them' ? 'msg msg--them' : 'msg msg--us';
    const span = document.createElement('span');
    span.textContent = m.text;
    el.appendChild(span);
    if (m.file) {
      const f = document.createElement('span');
      f.className = 'msg__file';
      f.innerHTML = '<iconify-icon class="ic" icon="solar:document-text-bold-duotone" width="18" height="18" aria-hidden="true"></iconify-icon>';
      f.appendChild(document.createTextNode(m.file));
      el.appendChild(f);
    }
    return el;
  };

  const typingEl = () => {
    const el = document.createElement('div');
    el.className = 'typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    return el;
  };

  const play = () => {
    clearTimeout(timer);
    chatLog.textContent = '';
    let i = 0;

    // reduced motion: render the whole thread at once, no timers
    if (reducedMotion) {
      SCRIPT.forEach((m) => chatLog.appendChild(bubble(m)));
      chatLog.scrollTop = chatLog.scrollHeight;
      return;
    }

    const step = () => {
      if (i >= SCRIPT.length) return;
      const t = typingEl();
      t.style.alignSelf = SCRIPT[i].who === 'them' ? 'flex-end' : 'flex-start';
      chatLog.appendChild(t);
      chatLog.scrollTop = chatLog.scrollHeight;
      timer = setTimeout(() => {
        t.remove();
        chatLog.appendChild(bubble(SCRIPT[i]));
        chatLog.scrollTop = chatLog.scrollHeight;
        i += 1;
        timer = setTimeout(step, 700);
      }, 900);
    };
    timer = setTimeout(step, 300);
  };

  // start when the panel first scrolls into view
  let started = false;
  const kick = () => { if (!started) { started = true; play(); } };

  const onScreen = () => {
    const r = chatLog.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  };

  if (onScreen() || !('IntersectionObserver' in window)) {
    kick();
  } else {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { kick(); io.disconnect(); }
    }, { threshold: 0.2 });
    io.observe(chatLog);
  }

  if (chatReplay) chatReplay.addEventListener('click', () => { started = true; play(); });
}

/* ---------------- carousel dots (phones) ---------------- */

const phone = matchMedia('(max-width: 720px)');

document.querySelectorAll('.carousel').forEach((track) => {
  const dots = document.createElement('div');
  dots.className = 'dots';
  dots.setAttribute('aria-hidden', 'true');
  const kids = [...track.children];
  kids.forEach(() => dots.appendChild(document.createElement('span')));
  track.after(dots);

  const paint = () => {
    if (!phone.matches || !kids.length) return;
    const w = kids[0].getBoundingClientRect().width + 16;
    const i = Math.round(track.scrollLeft / w);
    [...dots.children].forEach((d, j) => d.classList.toggle('is-on', j === i));
  };

  track.addEventListener('scroll', () => requestAnimationFrame(paint), { passive: true });
  phone.addEventListener('change', paint);
  paint();
});

/* ---------------- scroll to top ---------------- */

const toTop = document.getElementById('to-top');

if (toTop) {
  const onScroll = () => toTop.classList.toggle('is-on', window.scrollY > 600);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  });
}

/* ---------------- scroll reveal ---------------- */

if (!reducedMotion && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-reveal]').forEach((el) => {
    // anything already on screen at load stays put — no flash of empty page
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) {
      el.classList.add('is-in');
      return;
    }
    el.classList.add('reveal');
    io.observe(el);
  });
}

/* ---------------- services anchor rail ----------------
   Scrollspy + auto-centring pill rail, matching the design's DCLogic:
   a section counts as current once its top passes a line 140px down the
   viewport, and the active pill scrolls itself into the middle of the rail. */

const railTrack = document.getElementById('rail-track');

if (railTrack) {
  const pills = [...railTrack.querySelectorAll('[data-rail]')];
  const ids = pills.map((p) => p.dataset.rail);
  let active = ids[0];
  let raf = null;

  const centerPill = () => {
    const pill = railTrack.querySelector('[data-rail="' + active + '"]');
    if (!pill) return;
    const target = pill.offsetLeft - railTrack.offsetLeft - (railTrack.clientWidth - pill.offsetWidth) / 2;
    railTrack.scrollTo({ left: Math.max(0, target), behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  const paint = () => {
    pills.forEach((p) => {
      const on = p.dataset.rail === active;
      p.classList.toggle('is-on', on);
      if (on) p.setAttribute('aria-current', 'true');
      else p.removeAttribute('aria-current');
    });
  };

  const spy = () => {
    // the design hardcodes 140; with a sticky nav above the rail the real
    // boundary is wherever the rail actually ends
    const railEl = document.getElementById('svc-rail');
    const line = (railEl ? railEl.getBoundingClientRect().bottom : navH()) + 8;
    let cur = ids[0];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top - line <= 0) cur = id;
    });
    if (cur === active) return;
    active = cur;
    paint();
    centerPill();
  };

  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => { raf = null; spy(); });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  pills.forEach((p) => {
    p.addEventListener('click', (e) => {
      const el = document.getElementById(p.dataset.rail);
      if (!el) return;
      e.preventDefault();
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - (navH() + 76),
        behavior: reducedMotion ? 'auto' : 'smooth'
      });
      active = p.dataset.rail;
      paint();
      centerPill();
    });
  });

  spy();
}

/* ---------------- select fields ---------------- */

/* Native option lists take no styling, animation or hover treatment, so each
   select is presented as a button + listbox. The <select> itself stays in the
   DOM and keeps holding the value, so FormData, `required` and the wizard's
   validation are untouched -- and if this script never runs, the plain select
   still works. */

document.querySelectorAll('.qfield--sel select').forEach((sel, n) => {
  const field = sel.closest('.qfield--sel');
  const labelEl = field.querySelector('.qfield__label');
  const caret = field.querySelector('.qsel__caret');
  const isPlaceholder = (v) => !v || v === 'Choose one';

  const wrap = document.createElement('div');
  wrap.className = 'qsel';
  sel.parentNode.insertBefore(wrap, sel);
  wrap.appendChild(sel);
  sel.classList.add('qsel__native');
  sel.tabIndex = -1;
  sel.setAttribute('aria-hidden', 'true');
  if (labelEl) labelEl.removeAttribute('for');   // it points at the hidden select now

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'qsel__btn';
  btn.id = sel.id ? sel.id + '-btn' : 'qsel-btn-' + n;
  btn.setAttribute('aria-haspopup', 'listbox');
  btn.setAttribute('aria-expanded', 'false');

  const val = document.createElement('span');
  val.className = 'qsel__val';
  btn.appendChild(val);
  if (caret) btn.appendChild(caret);
  wrap.appendChild(btn);

  const list = document.createElement('ul');
  list.className = 'qsel__list';
  list.id = btn.id + '-list';
  list.setAttribute('role', 'listbox');
  if (labelEl) {
    if (!labelEl.id) labelEl.id = btn.id + '-label';
    list.setAttribute('aria-labelledby', labelEl.id);
    btn.setAttribute('aria-labelledby', labelEl.id + ' ' + btn.id);
  }
  btn.setAttribute('aria-controls', list.id);

  const opts = [...sel.options].map((o, i) => {
    const li = document.createElement('li');
    li.className = 'qsel__opt';
    li.setAttribute('role', 'option');
    li.id = list.id + '-' + i;
    li.dataset.value = o.value || o.text;
    li.textContent = o.text;
    if (i === 0 && isPlaceholder(o.value || o.text)) li.classList.add('qsel__opt--empty');
    list.appendChild(li);
    return li;
  });
  wrap.appendChild(list);

  let active = Math.max(0, sel.selectedIndex);

  function paint() {
    const v = sel.value;
    val.textContent = isPlaceholder(v) ? sel.options[0].text : v;
    val.classList.toggle('qsel__val--empty', isPlaceholder(v));
    opts.forEach((li, i) => {
      li.setAttribute('aria-selected', String(i === sel.selectedIndex && !isPlaceholder(v)));
      li.classList.toggle('is-active', i === active);
    });
    const cur = opts[active];
    if (cur) btn.setAttribute('aria-activedescendant', cur.id);
  }

  /* the list is fixed, so it has to be placed against the button by hand --
     an absolutely positioned one is clipped by the form card */
  function place() {
    const r = btn.getBoundingClientRect();
    const h = Math.min(262, list.scrollHeight + 12);
    const below = window.innerHeight - r.bottom - 12;
    const above = r.top - 12;
    list.style.left = r.left + 'px';
    list.style.width = r.width + 'px';
    if (below < h && above > below) {
      list.style.top = Math.max(12, r.top - 8 - h) + 'px';
    } else {
      list.style.top = (r.bottom + 8) + 'px';
    }
  }

  const reflow = () => place();

  function open() {
    if (wrap.classList.contains('is-open')) return;
    active = Math.max(0, sel.selectedIndex);
    wrap.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    paint();
    place();
    window.addEventListener('scroll', reflow, true);
    window.addEventListener('resize', reflow);
    const cur = opts[active];
    if (cur) cur.scrollIntoView({ block: 'nearest' });
  }

  function close(focus) {
    if (!wrap.classList.contains('is-open')) return;
    wrap.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    window.removeEventListener('scroll', reflow, true);
    window.removeEventListener('resize', reflow);
    if (focus) btn.focus();
  }

  function pick(i) {
    sel.selectedIndex = i;
    active = i;
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    if (!isPlaceholder(sel.value)) btn.style.borderColor = '';
    paint();
    close(true);
  }

  function move(delta) {
    active = Math.min(opts.length - 1, Math.max(0, active + delta));
    paint();
    opts[active].scrollIntoView({ block: 'nearest' });
  }

  btn.addEventListener('click', () => (wrap.classList.contains('is-open') ? close(false) : open()));
  if (labelEl) labelEl.addEventListener('click', () => btn.focus());

  btn.addEventListener('keydown', (e) => {
    const isOpen = wrap.classList.contains('is-open');
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) { open(); return; }
      move(e.key === 'ArrowDown' ? 1 : -1);
    } else if (e.key === 'Home' || e.key === 'End') {
      if (!isOpen) return;
      e.preventDefault();
      active = e.key === 'Home' ? 0 : opts.length - 1;
      paint();
      opts[active].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isOpen) { open(); return; }
      pick(active);
    } else if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      close(true);
    } else if (e.key === 'Tab' && isOpen) {
      close(false);
    }
  });

  opts.forEach((li, i) => {
    li.addEventListener('click', () => pick(i));
    li.addEventListener('mousemove', () => {
      if (active === i) return;
      active = i;
      paint();
    });
  });

  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) close(false);
  });

  paint();
});

/* ---------------- request a quote: 3-step intake ----------------
   Static translation of the design's DCLogic wizard. The design's submit is a
   mock that just advances to the success state; here it actually posts to
   FormSubmit, the same endpoint the home page contact form uses. */

const qForm = document.getElementById('q-form');

if (qForm) {
  const QUOTE_ENDPOINT = 'https://formsubmit.co/ajax/nmartinez@itprescription.com';

  const SERVICE_NAMES = {
    'managed-support': 'Managed IT support',
    cybersecurity: 'Cybersecurity',
    cloud: 'Cloud services',
    network: 'Network monitoring',
    backup: 'Backup & recovery',
    voip: 'VoIP & communications',
    compliance: 'Compliance support',
    ai: 'AI consulting'
  };

  const TITLES = {
    1: 'step 1 of 3 — who you are',
    2: 'step 2 of 3 — what you need',
    3: 'step 3 of 3 — scope & timing',
    4: 'your prescription is being written!'
  };

  const win = document.getElementById('qwin');
  const barTitle = document.getElementById('qwin-title');
  const stepsEl = document.getElementById('q-steps');
  const doneEl = document.getElementById('q-done');
  const errEl = document.getElementById('q-error');
  const details = document.getElementById('q-details');
  const fieldsets = [1, 2, 3].map((n) => document.getElementById('q-step-' + n));

  // review hook, mirroring the design's initialStep prop: ?step=1|2|3|success
  let step = 1;
  try {
    const want = new URLSearchParams(location.search).get('step');
    if (want) step = ({ '1': 1, '2': 2, '3': 3, success: 4 })[want] || 1;
  } catch (e) { /* no-op */ }

  /* ---- preset from ?service= ---- */
  let preset = null;
  try { preset = new URLSearchParams(location.search).get('service'); } catch (e) { preset = null; }
  const presetName = SERVICE_NAMES[preset];

  if (presetName) {
    const banner = document.getElementById('q-preset');
    document.getElementById('q-preset-name').textContent = presetName;
    banner.hidden = false;
    details.value = 'Interested in: ' + presetName + '\n\n';
    // arriving from a service link means they want services, not products
    setHelp(1);
    document.querySelectorAll('#q-cats .catbtn').forEach((b) => { b.setAttribute('aria-pressed', 'false'); paintCat(b); });
  }

  /* ---- step rendering ---- */
  function render() {
    barTitle.textContent = TITLES[step];
    fieldsets.forEach((fs, i) => { fs.hidden = step !== i + 1; });
    stepsEl.hidden = step === 4;
    doneEl.hidden = step !== 4;
    qForm.hidden = step === 4;

    [...stepsEl.children].forEach((li, i) => {
      const n = i + 1;
      const done = step > n;
      li.classList.toggle('step--active', step === n);
      li.classList.toggle('step--done', done);
      li.classList.toggle('step--todo', step < n);
      // a completed step shows only the check glyph, so drop the digit entirely
      const num = li.querySelector('.step__n');
      if (num && num.firstChild && num.firstChild.nodeType === 3) {
        num.firstChild.nodeValue = done ? '' : String(n);
      }
    });
  }

  function go(next) {
    step = next;
    render();
    if (step === 3) prepareDoc().catch(() => {});   // warm the PDF library
    if (win) {
      window.scrollTo({
        top: win.getBoundingClientRect().top + window.scrollY - (navH() + 24),
        behavior: reducedMotion ? 'auto' : 'smooth'
      });
    }
  }

  /* ---- validation: only gate on what the design marks required ---- */
  function validate(n) {
    const fs = fieldsets[n - 1];
    let ok = true;
    let firstBad = null;

    fs.querySelectorAll('input[required], textarea[required], select[required]').forEach((el) => {
      const empty = !el.value.trim() || el.value === 'Choose one';
      const bad = empty || (el.type === 'email' && !el.checkValidity());
      // an enhanced select is hidden; its button is what the visitor sees
      const host = el.closest('.qsel');
      const shown = host ? host.querySelector('.qsel__btn') : el;
      shown.style.borderColor = bad ? 'var(--error)' : '';
      if (bad && !firstBad) firstBad = shown;
      if (bad) ok = false;
    });

    if (firstBad) firstBad.focus();
    return ok;
  }

  /* ---- help radio cards ---- */
  function setHelp(idx) {
    document.querySelectorAll('#q-help .helpcard').forEach((b, i) => {
      b.setAttribute('aria-checked', String(i === idx));
    });
  }
  document.querySelectorAll('#q-help .helpcard').forEach((b, i) => {
    b.addEventListener('click', () => setHelp(i));
  });

  /* ---- category toggles ---- */
  function paintCat(b) {
    const tick = b.querySelector('.catbtn__tick');
    if (tick) tick.textContent = b.getAttribute('aria-pressed') === 'true' ? '\u2713 ' : '';
  }
  document.querySelectorAll('#q-cats .catbtn').forEach((b) => {
    paintCat(b);
    b.addEventListener('click', () => {
      b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      paintCat(b);
    });
  });

  /* ---- navigation ---- */
  document.querySelectorAll('[data-q-next]').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      if (!validate(step)) return;
      go(Math.min(3, step + 1));
    });
  });
  document.querySelectorAll('[data-q-back]').forEach((el) => {
    el.addEventListener('click', (e) => { e.preventDefault(); go(Math.max(1, step - 1)); });
  });

  qForm.addEventListener('submit', (e) => e.preventDefault());

  /* ---- the quote document ---- */

  /* The submitted answers also go out as a formal PDF, because the person who
     prices it works from a document, not an email body. jsPDF is ~360KB, so it
     is only fetched once someone is actually on the last step. */

  const PDF_LIB = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/4.2.1/jspdf.umd.min.js';
  let docReady = null;
  let lastDocUrl = null;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('could not load ' + src));
      document.head.appendChild(s);
    });
  }

  function prepareDoc() {
    if (!docReady) {
      docReady = loadScript(PDF_LIB).then(() => loadScript('js/quote-pdf.js'));
      docReady.catch(() => { docReady = null; });   // let a later attempt retry
    }
    return docReady;
  }

  /* ---- submit ---- */
  const submitBtn = document.getElementById('q-submit');

  submitBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    if (!validate(1)) { go(1); return; }
    if (!validate(2)) { go(2); return; }

    const label = submitBtn.querySelector('span');
    const original = label.textContent;
    label.textContent = 'sending...';
    submitBtn.style.pointerEvents = 'none';
    if (errEl) errEl.hidden = true;

    const data = Object.fromEntries(new FormData(qForm).entries());
    const checked = document.querySelector('#q-help .helpcard[aria-checked="true"] .helpcard__txt');
    data.help = checked ? checked.textContent : '';
    data.categories = [...document.querySelectorAll('#q-cats .catbtn[aria-pressed="true"]')]
      .map((b) => b.textContent.replace('✓', '').trim()).join(', ');
    /* the document is a nicety, not a gate: if it cannot be built the request
       still goes out exactly as it did before */
    let built = null;
    try {
      await prepareDoc();
      built = window.ITRXQuoteDoc.build(data);
    } catch (err) {
      built = null;
    }

    data._subject = built
      ? 'Quote request ' + built.reference + ' \u2014 ' + (data.organization || 'itprescription.com')
      : 'Quote request from ' + (data.organization || 'itprescription.com');

    try {
      let res;
      if (built) {
        // multipart, so the PDF rides along as a real attachment
        const fd = new FormData();
        Object.keys(data).forEach((k) => fd.append(k, data[k]));
        fd.append('quote_reference', built.reference);
        fd.append('attachment', built.blob, built.filename);
        res = await fetch(QUOTE_ENDPOINT, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: fd
        });
      } else {
        res = await fetch(QUOTE_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data)
        });
      }
      /* FormSubmit answers 200 with {"success":"false"} when the endpoint is
         not activated or a field is rejected, so the status alone is not
         enough -- without this the visitor is told it sent when it did not */
      let payload = {};
      try { payload = await res.json(); } catch (e) { payload = {}; }
      if (!res.ok || String(payload.success) === 'false') {
        throw new Error(payload.message || 'bad status ' + res.status);
      }

      const dl = document.getElementById('q-download');
      if (dl && built) {
        if (lastDocUrl) URL.revokeObjectURL(lastDocUrl);
        lastDocUrl = URL.createObjectURL(built.blob);
        dl.href = lastDocUrl;
        dl.setAttribute('download', built.filename);
        dl.hidden = false;
      }
      const refEl = document.getElementById('q-ref');
      if (refEl && built) {
        refEl.textContent = built.reference;
        refEl.parentElement.hidden = false;
      }
      go(4);
    } catch (err) {
      if (errEl) errEl.hidden = false;
      label.textContent = original;
      submitBtn.style.pointerEvents = '';
    }
  });

  document.getElementById('q-again').addEventListener('click', () => {
    qForm.reset();
    const dl = document.getElementById('q-download');
    if (dl) dl.hidden = true;
    const refLine = document.getElementById('q-refline');
    if (refLine) refLine.hidden = true;
    if (presetName) details.value = 'Interested in: ' + presetName + '\n\n';
    const label = submitBtn.querySelector('span');
    label.textContent = 'send my request';
    submitBtn.style.pointerEvents = '';
    go(1);
  });

  render();
}
