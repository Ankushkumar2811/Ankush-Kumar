// Roles to cycle through
var roles = [
  'Full Stack Developer',
  'MERN Stack Developer',
  'WordPress & Shopify Expert',
  'Custom CRM Developer',
  'SaaS Dashboard Builder',
  'API Integration Specialist',
  'Web App Developer'
];

function startTyped(selector, strings){
  var el = document.querySelector(selector);
  if (!el || !window.Typed) return;
  new Typed(selector, {
    strings: strings || roles,
    typeSpeed: 150,
    backSpeed: 150,
    backDelay: 1000,
    loop: true,
  });
}

window.addEventListener('DOMContentLoaded', function () {
  var menuToggle = document.querySelector('.menu-toggle');
  var navbar = document.querySelector('.navbar');
  if (menuToggle && navbar) {
    var closeMenu = function () {
      navbar.classList.remove('open');
      document.body.classList.remove('body-menu-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation menu');
      var icon = menuToggle.querySelector('i');
      if (icon) icon.className = 'bx bx-menu';
    };
    menuToggle.addEventListener('click', function () {
      var opening = !navbar.classList.contains('open');
      navbar.classList.toggle('open', opening);
      document.body.classList.toggle('body-menu-open', opening);
      menuToggle.setAttribute('aria-expanded', String(opening));
      menuToggle.setAttribute('aria-label', opening ? 'Close navigation menu' : 'Open navigation menu');
      var icon = menuToggle.querySelector('i');
      if (icon) icon.className = opening ? 'bx bx-x' : 'bx bx-menu';
    });
    navbar.querySelectorAll('a').forEach(function (link) { link.addEventListener('click', closeMenu); });
    window.addEventListener('resize', function () { if (window.innerWidth > 900) closeMenu(); });
  }

  var contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      var status = contactForm.querySelector('.form-status');
      var invalid = contactForm.querySelectorAll(':invalid');
      contactForm.querySelectorAll('label').forEach(function(label){ label.classList.remove('field-error'); });
      if (invalid.length) {
        invalid.forEach(function(field){ var label = field.closest('label'); if (label) label.classList.add('field-error'); });
        if (status) status.textContent = 'Please complete all fields with valid information.';
        invalid[0].focus();
        return;
      }
      var data = new FormData(contactForm);
      var submitButton = contactForm.querySelector('button[type="submit"]');
      var originalButton = submitButton ? submitButton.innerHTML : '';
      if (submitButton) { submitButton.disabled = true; submitButton.innerHTML = "<i class='bx bx-loader-alt bx-spin'></i> Sending…"; }
      if (status) status.textContent = 'Sending your message securely…';
      try {
        var response = await fetch(contactForm.action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } });
        var result = await response.json();
        if (!response.ok || !result.ok) throw new Error(result.message || 'Message could not be sent.');
        if (status) status.textContent = result.message;
        contactForm.reset();
      } catch (error) {
        if (status) status.textContent = error.message || 'Message could not be sent. Please email ak5974828@gmail.com directly.';
      } finally {
        if (submitButton) { submitButton.disabled = false; submitButton.innerHTML = originalButton; }
      }
    });
    contactForm.querySelectorAll('input, textarea').forEach(function(field){
      field.addEventListener('input', function(){ var label = field.closest('label'); if (label) label.classList.remove('field-error'); });
    });
  }

  var year = document.querySelector('#current-year');
  if (year) year.textContent = String(new Date().getFullYear());
  var backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    var syncBackToTop = function(){ backToTop.classList.toggle('visible', window.scrollY > 650); };
    window.addEventListener('scroll', syncBackToTop, { passive: true });
    syncBackToTop();
    backToTop.addEventListener('click', function(){ window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  var faqItems = document.querySelectorAll('.faq-list details');
  faqItems.forEach(function(item){
    item.addEventListener('toggle', function(){
      if (!item.open) return;
      faqItems.forEach(function(other){ if (other !== item) other.open = false; });
    });
  });

  // HERO: start after the h3 (with span.text) finishes its CSS intro animation
  var heroSpan = document.querySelector('.text');
  if (heroSpan) {
    var heroH3 = heroSpan.closest('h3');
    var started = false;
    function beginHero(){ if(!started){ started = true; startTyped('.text'); } }
    if (heroH3) {
      heroH3.addEventListener('animationend', beginHero, { once: true });
    }
    // Fallback in case animationend doesn't fire (e.g., styles change)
    setTimeout(beginHero, 1600);
  }

  var impactSpan = document.querySelector('.impact-text');
  if (impactSpan) {
    startTyped('.impact-text', [
      'I Build Web Apps That Drive Results.',
      'I Create Scalable MERN Solutions.',
      'I Develop High-Performance Websites.',
      'I Turn Ideas Into Digital Products.'
    ]);
  }

  // ABOUT: start when the span scrolls into view
  var aboutSpan = document.querySelector('.about-role');
  if (aboutSpan) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          if (e.isIntersecting) { startTyped('.about-role'); io.disconnect(); }
        });
      }, { threshold: 0.2 });
      io.observe(aboutSpan);
    } else {
      // Older browsers: small delay
      setTimeout(function(){ startTyped('.about-role'); }, 1500);
    }
  }

  // Skills section now uses standalone layout/styles; no JS effects needed
  // (Projects filtering removed)
  // Projects filtering + reveal
  var pFilters = document.querySelectorAll('.proj-filter');
  var pCards = document.querySelectorAll('.proj-card');
  function projApply(cat){
    pCards.forEach(function(c){
      var rawCat = c.getAttribute('data-cat') || '';
      var cats = rawCat.split(/\s+/).filter(Boolean);
      var isPlatform = c.dataset.platform === 'true';
      var show = cat === 'all' ? isPlatform : (!isPlatform && cats.includes(cat));
      c.style.display = show ? '' : 'none';
      // Special handling for the WordPress hero cover image
      var thumb = c.querySelector('.proj-thumb');
      var img = thumb ? thumb.querySelector('img') : null;
      if (img && img.hasAttribute('data-cover')){
        var body = c.querySelector('.proj-body');
        var titleEl = body ? body.querySelector('h3') : null;
        var descEl = body ? body.querySelector('.desc') : null;
        var tagsEl = body ? body.querySelector('.tags') : null;
        var liveBtn = body ? body.querySelector('.proj-live:not([data-filter])') : null;
        var wpBtn = body ? body.querySelector('.proj-live[data-filter=\"wordpress\"]') : null;

        var cover = img.getAttribute('data-cover');
        var icon = img.getAttribute('data-icon') || img.getAttribute('src');
        var data = c.dataset || {};

        if (cat === 'wordpress'){
          // Use cover image and project-specific details
          if (img && cover){ img.src = cover; thumb && thumb.classList.add('is-cover'); }
          if (titleEl && data.titleWp) titleEl.textContent = data.titleWp;
          if (descEl && data.descWp) descEl.textContent = data.descWp;
          if (tagsEl && data.tagsWp) tagsEl.textContent = data.tagsWp;
          if (liveBtn){ liveBtn.style.display='inline-flex'; if(data.live) liveBtn.href = data.live; }
          if (wpBtn){ wpBtn.style.display='none'; }
        } else {
          // In ALL or other tabs, use icon and category description
          if (img && icon){ img.src = icon; thumb && thumb.classList.remove('is-cover'); }
          if (titleEl && data.titleAll) titleEl.textContent = data.titleAll;
          if (descEl && data.descAll) descEl.textContent = data.descAll;
          if (tagsEl && data.tagsAll) tagsEl.textContent = data.tagsAll;
          if (liveBtn){ liveBtn.style.display='none'; }
          if (wpBtn){ wpBtn.style.display='inline-flex'; }
        }
      }
    });
  }
  if (pFilters.length){
    pFilters.forEach(function(btn){
      btn.addEventListener('click', function(){
        setProjFilter(btn.getAttribute('data-filter'));
      });
    });
    projApply('all');
  }

  // Reveal on scroll
  if ('IntersectionObserver' in window){
    var ioProj = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); ioProj.unobserve(e.target); } });
    }, { threshold: 0.15 });
    pCards.forEach(function(c){ ioProj.observe(c); });
  } else {
    pCards.forEach(function(c){ c.classList.add('in'); });
  }

  // Programmatic filter setter (used by "View WordPress" button)
  function setProjFilter(cat){
    pFilters.forEach(function(b){ 
      var is = b.getAttribute('data-filter') === cat;
      b.classList.toggle('active', is);
      b.setAttribute('aria-selected', is ? 'true' : 'false');
    });
    projApply(cat);
  }
  window.setProjFilter = setProjFilter;

  // Intercept buttons with data-filter on projects to switch tabs
  document.addEventListener('click', function(e){
    var a = e.target.closest('.proj-live[data-filter]');
    if (!a) return;
    e.preventDefault();
    var cat = a.getAttribute('data-filter');
    setProjFilter(cat);
    var section = document.querySelector('#projects');
    if(section && section.scrollIntoView){ section.scrollIntoView({ behavior:'smooth', block:'start' }); }
  });

  var testimonialsTrack = document.querySelector('.testimonials-track');
  if (testimonialsTrack) {
    var testimonialPrev = document.querySelector('.testimonial-arrow.prev');
    var testimonialNext = document.querySelector('.testimonial-arrow.next');
    var moveTestimonials = function(direction) {
      var card = testimonialsTrack.querySelector('.testimonial-card');
      if (!card) return;
      var gap = parseFloat(getComputedStyle(testimonialsTrack).gap) || 14;
      testimonialsTrack.scrollBy({ left: direction * (card.offsetWidth + gap), behavior: 'smooth' });
    };
    if (testimonialPrev) testimonialPrev.addEventListener('click', function(){ moveTestimonials(-1); });
    if (testimonialNext) testimonialNext.addEventListener('click', function(){ moveTestimonials(1); });
  }

  // Interactive 3D depth: pointer spotlight, hero parallax and card tilt.
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) {
    document.addEventListener('pointermove', function (e) {
      document.body.style.setProperty('--spot-x', (e.clientX / window.innerWidth * 100).toFixed(1) + '%');
      document.body.style.setProperty('--spot-y', (e.clientY / window.innerHeight * 100).toFixed(1) + '%');
      var hero = document.querySelector('.home');
      if (hero && window.scrollY < window.innerHeight) {
        hero.style.setProperty('--hero-ry', ((e.clientX / window.innerWidth - .5) * 9).toFixed(2) + 'deg');
        hero.style.setProperty('--hero-rx', ((.5 - e.clientY / window.innerHeight) * 7).toFixed(2) + 'deg');
      }
    }, { passive: true });

    var tiltCards = document.querySelectorAll('.category-card, .exp-card, .proj-card, .contact-card');
    tiltCards.forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        if (window.innerWidth <= 768) return;
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - .5;
        var y = (e.clientY - rect.top) / rect.height - .5;
        card.style.setProperty('--ry', (x * 9).toFixed(2) + 'deg');
        card.style.setProperty('--rx', (-y * 7).toFixed(2) + 'deg');
      });
      card.addEventListener('pointerleave', function () {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  var revealSections = document.querySelectorAll('section:not(.home)');
  revealSections.forEach(function (section) { section.classList.add('reveal-3d'); });
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: .08, rootMargin: '0px 0px -6% 0px' });
    revealSections.forEach(function (section) { revealObserver.observe(section); });
  } else {
    revealSections.forEach(function (section) { section.classList.add('is-visible'); });
  }
});
