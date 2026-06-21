/* =====================================================================
   D3 Inspection — site interactions
   Vanilla JS, no dependencies.
   ===================================================================== */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---- current year ------------------------------------------------ */
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---- header scroll state ----------------------------------------- */
  var header = $('#header');
  if (header) {
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 16); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- mobile nav -------------------------------------------------- */
  var burger = $('#hamburger');
  var navLinks = $('#navLinks');
  if (burger && navLinks) {
    var toggleNav = function (force) {
      var open = typeof force === 'boolean' ? force : !navLinks.classList.contains('open');
      navLinks.classList.toggle('open', open);
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    };
    burger.addEventListener('click', function () { toggleNav(); });
    $$('a', navLinks).forEach(function (a) {
      a.addEventListener('click', function () { toggleNav(false); });
    });
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggleNav(false); });
  }

  /* ---- scroll reveal ----------------------------------------------- */
  var reveals = $$('[data-reveal]');
  if ('IntersectionObserver' in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- active section in nav --------------------------------------- */
  var sections = $$('section[id]').filter(function (s) {
    return $('.nav-links a[href="#' + s.id + '"]');
  });
  if (sections.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        $$('.nav-links a').forEach(function (a) { a.classList.remove('active'); });
        var link = $('.nav-links a[href="#' + en.target.id + '"]');
        if (link) link.classList.add('active');
      });
    }, { threshold: 0.5 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---- lightbox gallery -------------------------------------------- */
  var lb = $('#lightbox');
  if (lb) {
    var figures = $$('#gallery .gallery__item');
    var lbImg = $('#lbImg'), lbCount = $('#lbCount');
    var current = 0;

    var show = function (i) {
      current = (i + figures.length) % figures.length;
      var fig = figures[current];
      var img = $('img', fig);
      lbImg.src = fig.getAttribute('data-full') || (img && img.src) || '';
      lbImg.alt = (img && img.alt) || '';
      lbCount.textContent = (current + 1) + ' / ' + figures.length;
    };
    var open = function (i) {
      show(i);
      lb.classList.add('open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };
    var close = function () {
      lb.classList.remove('open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    figures.forEach(function (fig, i) { fig.addEventListener('click', function () { open(i); }); });
    $('#lbClose').addEventListener('click', close);
    $('#lbNext').addEventListener('click', function (e) { e.stopPropagation(); show(current + 1); });
    $('#lbPrev').addEventListener('click', function (e) { e.stopPropagation(); show(current - 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    window.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(current + 1);
      if (e.key === 'ArrowLeft') show(current - 1);
    });
  }

  /* ---- contact form (mailto for static hosting) -------------------- */
  var form = $('#contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var val = function (id) { var el = $('#' + id); return el ? el.value.trim() : ''; };
      var name = val('name'), email = val('email');
      var phone = val('phone') || '—';
      var service = ($('#service') && $('#service').value) || '—';
      var message = val('message');

      var subject = 'Project inquiry from ' + name + ' — D3 Inspection';
      var body =
        'Name: ' + name + '\n' +
        'Email: ' + email + '\n' +
        'Phone: ' + phone + '\n' +
        'Service needed: ' + service + '\n\n' +
        'Message:\n' + message + '\n';

      var success = $('#formSuccess');
      if (success) success.classList.add('show');

      window.location.href = 'mailto:d3inspectionllc@gmail.com'
        + '?subject=' + encodeURIComponent(subject)
        + '&body='    + encodeURIComponent(body);
      form.reset();
    });
  }
})();
