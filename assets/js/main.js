/* ============================================================
   MY FOREVER NAILS — site behaviour
   ------------------------------------------------------------
   Sticky header · mobile navigation · scroll reveals ·
   order builder + live subtotal · procurement form submission
   ============================================================ */
(function () {
  'use strict';

  /* ==========================================================
     CONFIGURATION — the only part you need to edit
     ==========================================================

     WEB3FORMS_ACCESS_KEY
     --------------------
     Paste your free Web3Forms access key between the quotes to
     turn on live form delivery to myforevernails@gmail.com.

       1. Visit https://web3forms.com
       2. Enter myforevernails@gmail.com and press "Create Access Key"
       3. Confirm the email they send you
       4. Paste the key below, then commit and push

     Until a key is present the form still works: it opens a
     pre-filled email addressed to CONTACT_EMAIL containing the
     complete request, so no enquiry is ever lost.
     ========================================================== */
  var WEB3FORMS_ACCESS_KEY = '';
  var CONTACT_EMAIL = 'myforevernails@gmail.com';

  /* Shade catalogue — prices in whole US dollars. */
  var SHADES = {
    g01: { price: 35, code: 'Grace .01', name: 'Pale Pink' },
    g02: { price: 35, code: 'Grace .02', name: 'Velvety Nude' },
    g03: { price: 55, code: 'Grace .03', name: 'Fusion French' }
  };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var scrollBehaviour = reduceMotion ? 'auto' : 'smooth';

  /* ----------------------------------------------------------
     Copyright year
     ---------------------------------------------------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  /* ----------------------------------------------------------
     Sticky header state
     ---------------------------------------------------------- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ----------------------------------------------------------
     Mobile navigation
     ---------------------------------------------------------- */
  var navToggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');

  function setNav(open) {
    if (!nav || !navToggle) return;
    nav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('nav-open', open);
  }
  function closeNav() { setNav(false); }

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      setNav(!nav.classList.contains('is-open'));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        closeNav();
        navToggle.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('is-open')) return;
      if (e.target.closest('#primary-nav') || e.target.closest('.nav-toggle')) return;
      closeNav();
    });
    /* Leaving the mobile breakpoint should never strand an open panel. */
    var wide = window.matchMedia('(min-width: 900px)');
    var onBreakpoint = function (e) { if (e.matches) closeNav(); };
    if (wide.addEventListener) { wide.addEventListener('change', onBreakpoint); }
    else if (wide.addListener) { wide.addListener(onBreakpoint); }
  }

  /* ----------------------------------------------------------
     Reveal on scroll
     ---------------------------------------------------------- */
  var revealEls = [].slice.call(document.querySelectorAll('.reveal'));
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ----------------------------------------------------------
     Order steppers + live subtotal
     ---------------------------------------------------------- */
  function qtyInput(shade) {
    return document.querySelector('.stepper[data-shade="' + shade + '"] .stepper__input');
  }
  function clampQty(v) {
    v = parseInt(v, 10);
    if (isNaN(v) || v < 0) v = 0;
    if (v > 99) v = 99;
    return v;
  }
  function updateSubtotal() {
    var total = 0;
    Object.keys(SHADES).forEach(function (shade) {
      var input = qtyInput(shade);
      if (input) total += clampQty(input.value) * SHADES[shade].price;
    });
    var el = document.getElementById('subtotal');
    if (el) el.textContent = '$' + total;
    return total;
  }

  [].slice.call(document.querySelectorAll('.stepper')).forEach(function (stepper) {
    var input = stepper.querySelector('.stepper__input');
    if (!input) return;
    stepper.addEventListener('click', function (e) {
      var btn = e.target.closest('.stepper__btn');
      if (!btn) return;
      var val = clampQty(input.value);
      val = btn.getAttribute('data-act') === 'inc' ? Math.min(99, val + 1) : Math.max(0, val - 1);
      input.value = val;
      updateSubtotal();
    });
    input.addEventListener('input', function () {
      input.value = String(clampQty(input.value));
      updateSubtotal();
    });
    /* A blank field left by keyboard editing should settle back to 0. */
    input.addEventListener('blur', function () {
      input.value = String(clampQty(input.value));
      updateSubtotal();
    });
  });

  /* ----------------------------------------------------------
     "Add to procurement" from the collection cards
     ---------------------------------------------------------- */
  [].slice.call(document.querySelectorAll('[data-add]')).forEach(function (btn) {
    btn.addEventListener('click', function () {
      var shade = btn.getAttribute('data-add');
      var input = qtyInput(shade);
      if (input) { input.value = clampQty(input.value) + 1; updateSubtotal(); }

      var target = document.getElementById('procurement');
      if (target) target.scrollIntoView({ behavior: scrollBehaviour, block: 'start' });

      var row = document.querySelector('.order-row[data-shade="' + shade + '"]');
      if (row) {
        row.classList.add('is-flash');
        window.setTimeout(function () { row.classList.remove('is-flash'); }, 1200);
      }
    });
  });

  updateSubtotal();

  /* ----------------------------------------------------------
     Procurement form
     ---------------------------------------------------------- */
  var form = document.getElementById('procurement-form');
  var statusEl = document.getElementById('form-status');
  var successEl = document.getElementById('form-success');

  function setStatus(msg, type) {
    if (!statusEl) return;
    if (!msg) {
      statusEl.textContent = '';
      statusEl.className = 'form-status';
      statusEl.style.display = 'none';
      return;
    }
    statusEl.innerHTML = msg;
    statusEl.className = 'form-status' + (type ? ' form-status--' + type : '');
    statusEl.style.display = 'block';
  }

  function value(name) {
    if (!form) return '';
    var el = form.querySelector('[name="' + name + '"]');
    return el ? String(el.value || '').trim() : '';
  }

  /* Builds the order lines and totals shared by both delivery paths. */
  function buildOrder() {
    var lines = [];
    var totalQty = 0;
    var total = 0;
    Object.keys(SHADES).forEach(function (shade) {
      var input = qtyInput(shade);
      var q = input ? clampQty(input.value) : 0;
      if (!q) return;
      var s = SHADES[shade];
      totalQty += q;
      total += q * s.price;
      lines.push(s.code + ' (' + s.name + ') @ $' + s.price + '  x' + q + '  = $' + (q * s.price));
    });
    return { lines: lines, totalQty: totalQty, total: total };
  }

  /* Fallback delivery: compose a complete email the director can send. */
  function mailtoFallback(order) {
    var body = [
      'PROCUREMENT REQUEST — MY FOREVER NAILS',
      '',
      'ESTABLISHMENT',
      'Funeral home: ' + value('Funeral Home Name'),
      '',
      'DIRECTOR DETAILS',
      'Name: ' + value('Director Name'),
      'Position / title: ' + value('Position / Title'),
      'Mortician license number: ' + value('Mortician License Number'),
      '',
      'ORDER',
      order.lines.join('\n'),
      'Estimated subtotal: $' + order.total + ' (estimate — formal invoice to follow)',
      '',
      'SHIPPING & CONTACT',
      'Shipping address:',
      value('Shipping Address'),
      'Contact email: ' + value('email'),
      '',
      'ADDITIONAL NOTES',
      value('Additional Notes') || '(none)',
      '',
      'CONFIRMATION',
      'I confirm I am a licensed funeral professional, and I understand that sets',
      'are batch-prepared and that my request is subject to credential verification',
      'and formal invoicing.'
    ].join('\n');

    var href = 'mailto:' + CONTACT_EMAIL +
      '?subject=' + encodeURIComponent('Procurement Request — ' + (value('Funeral Home Name') || 'My Forever Nails')) +
      '&body=' + encodeURIComponent(body);

    window.location.href = href;

    setStatus(
      'Your request has been prepared in your email application — please press <strong>send</strong> to complete it. ' +
      'If nothing opened, email <a href="mailto:' + CONTACT_EMAIL + '">' + CONTACT_EMAIL + '</a> directly.',
      'info'
    );
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      setStatus('', '');

      var order = buildOrder();

      if (order.totalQty === 0) {
        setStatus('Please select at least one set before submitting your request.', 'error');
        var ob = document.getElementById('order-builder');
        if (ob) ob.scrollIntoView({ behavior: scrollBehaviour, block: 'center' });
        return;
      }

      /* Populate the hidden summary fields carried in the notification email. */
      var sumField = form.querySelector('input[name="Order Summary"]');
      var totField = form.querySelector('input[name="Estimated Subtotal"]');
      var keyField = form.querySelector('input[name="access_key"]');
      if (sumField) sumField.value = order.lines.join('\n');
      if (totField) totField.value = '$' + order.total + ' (estimate — formal invoice to follow)';

      var accessKey = String(WEB3FORMS_ACCESS_KEY || '').trim();

      /* No key configured yet — hand the request to the visitor's mail client. */
      if (!accessKey) {
        mailtoFallback(order);
        return;
      }

      if (keyField) keyField.value = accessKey;

      var submitBtn = form.querySelector('.form-submit');
      var originalText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Submitting…'; }
      setStatus('Submitting your request…', 'info');

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      }).then(function (res) {
        return res.json().catch(function () { return null; });
      }).then(function (json) {
        if (json && json.success) {
          form.style.display = 'none';
          if (successEl) {
            successEl.style.display = 'block';
            successEl.scrollIntoView({ behavior: scrollBehaviour, block: 'center' });
          }
          setStatus('', '');
        } else {
          setStatus(
            (json && json.message ? json.message : 'Something went wrong.') +
            ' Please try again, or email <a href="mailto:' + CONTACT_EMAIL + '">' + CONTACT_EMAIL + '</a>.',
            'error'
          );
        }
      }).catch(function () {
        setStatus(
          'We could not submit your request just now. Please check your connection and try again, ' +
          'or email <a href="mailto:' + CONTACT_EMAIL + '">' + CONTACT_EMAIL + '</a>.',
          'error'
        );
      }).then(function () {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalText; }
      });
    });
  }
})();
