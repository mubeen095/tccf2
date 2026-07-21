(function() {
  // ── Site Configuration ──
  var SITE_CONFIG = {
    whatsappNumber: '9182160152',
    freelanceFormUrl: 'https://forms.gle/Afrmvu8LJHhWR1ZK8',
    linkedInUrl: 'https://www.linkedin.com/company/112741155/',
    instagramUrl: 'https://www.instagram.com/thecodingcompany.io/',
    lmsUrl: 'https://lms.thecodingcompany.io/',
    canonicalDomain: 'https://thecodingcompany.com',
    logoPath: '/assets/img/logo.jpeg'
  };
  window.SITE_CONFIG = SITE_CONFIG;

  // ── Dynamic canonical URL ──
  var canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    canonical.href = SITE_CONFIG.canonicalDomain + window.location.pathname;
  }

  // ── Friendly Error Recovery UI ──
  var errorBox = document.getElementById('error-box');
  var crashDetected = false;
  var crashObserver = new MutationObserver(function() {
    var root = document.getElementById('root');
    if (!root) return;
    var hasContent = root.children.length > 0 && root.children[0].innerHTML !== '';
    if (!hasContent && !crashDetected && document.querySelector('script[src*="index-CIsw"]')) {
      crashDetected = true;
      setTimeout(function() {
        if (root.children.length === 0 || root.innerHTML.trim() === '') {
          root.innerHTML =
            '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:80vh;padding:2rem;text-align:center;background:#050505;color:white">' +
            '<h2 style="font-size:1.5rem;margin-bottom:1rem;font-weight:600">Something went wrong</h2>' +
            '<p style="color:rgba(255,255,255,0.6);margin-bottom:2rem;max-width:400px">The app encountered an unexpected error. Please try reloading the page.</p>' +
            '<button onclick="location.reload()" style="padding:0.75rem 2rem;border-radius:9999px;border:1px solid rgba(255,255,255,0.2);background:rgba(255,255,255,0.1);color:white;cursor:pointer;font-size:0.9rem;backdrop-filter:blur(12px)">Reload Page</button>' +
            '</div>';
        }
      }, 3000);
    }
  });
  if (document.getElementById('root')) {
    crashObserver.observe(document.getElementById('root'), { childList: true, subtree: true });
  }

  // ── Dynamic OG/Twitter Meta Tags ──
  var ogMetaConfig = {
    '/':        { title: 'The Coding Company | Learn AI, Build Real Skills, Get Ahead', desc: 'AI is changing everything. The Coding Company helps you learn AI engineering, build LLM-powered systems, and join an elite community of builders.' },
    '/bootcamps': { title: 'AI Bootcamps | The Coding Company', desc: 'Join our AI engineering bootcamps. Build real-world AI projects, learn from industry experts, and launch your career.' },
    '/vybeclub':  { title: '100 Club | The Coding Company', desc: 'Join the exclusive 100 Club network for high-performing AI builders at The Coding Company.' },
    '/vybing':    { title: 'Vybing | The Coding Company', desc: 'Explore the Vybing experience at The Coding Company.' },
    '/learn':     { title: 'Learn | The Coding Company', desc: 'Access focused learning environments for AI theory, practical building, and hands-on experiments.' },
    '/login':     { title: 'Login | The Coding Company', desc: 'Sign in to your The Coding Company account.' },
    '/webinars':  { title: 'Webinars | The Coding Company', desc: 'Daily AI learning sessions and webinars for everyone.' },
    '/gigs':      { title: 'Freelance | The Coding Company', desc: 'Find freelance AI engineering gigs and opportunities.' },
    '/verify':    { title: 'Verify Certificate | The Coding Company', desc: 'Verify your The Coding Company certificates.' },
    '/domains':   { title: 'Domains | The Coding Company', desc: 'Explore engineering domains and AI courses at The Coding Company.' },
  };

  function updateMetaTags(path) {
    var config = ogMetaConfig[path] || ogMetaConfig['/'];
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', config.title);
    var ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', config.desc);
    var twTitle = document.querySelector('meta[name="twitter:title"]');
    if (!twTitle) {
      twTitle = document.createElement('meta');
      twTitle.setAttribute('name', 'twitter:title');
      document.head.appendChild(twTitle);
    }
    twTitle.setAttribute('content', config.title);
    var twDesc = document.querySelector('meta[name="twitter:description"]');
    if (!twDesc) {
      twDesc = document.createElement('meta');
      twDesc.setAttribute('name', 'twitter:description');
      document.head.appendChild(twDesc);
    }
    twDesc.setAttribute('content', config.desc);
    var canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.href = SITE_CONFIG.canonicalDomain + window.location.pathname;
    }
  }
  updateMetaTags(window.location.pathname);
  var origPushState = history.pushState;
  var origReplaceState = history.replaceState;
  history.pushState = function() {
    origPushState.apply(this, arguments);
    updateMetaTags(window.location.pathname);
  };
  history.replaceState = function() {
    origReplaceState.apply(this, arguments);
    updateMetaTags(window.location.pathname);
  };
  window.addEventListener('popstate', function() {
    updateMetaTags(window.location.pathname);
  });

  // ── Video error handling (fallback for broken CloudFront streams) ──
  document.addEventListener('error', function(e) {
    var target = e.target;
    if (target && target.tagName === 'VIDEO') {
      target.style.display = 'none';
    }
  }, true);

  // ── Auto lazy-load dynamically injected images ──
  var imgObserver = new MutationObserver(function() {
    document.querySelectorAll('img:not([loading])').forEach(function(img) {
      img.setAttribute('loading', 'lazy');
    });
  });
  var rootEl = document.getElementById('root');
  if (rootEl) imgObserver.observe(rootEl, { childList: true, subtree: true });

  // ── Touch/Click Support for Hover-Dependent Elements ──
  function addTouchSupport() {
    document.querySelectorAll('[class*="group"]').forEach(function(el) {
      el.addEventListener('touchstart', function() {
        this.classList.add('touch-hover');
      }, { passive: true });
      el.addEventListener('touchend', function() {
        setTimeout(function() { el.classList.remove('touch-hover'); }, 300);
      }, { passive: true });
    });
  }
  setTimeout(addTouchSupport, 2000);
  if (rootEl) {
    new MutationObserver(function() {
      addTouchSupport();
    }).observe(rootEl, { childList: true, subtree: true });
  }

  // ── Logo Replacement (MutationObserver on 'thecodingcompany' text) ──
  var replaced = new WeakSet();
  function replaceLogo(node) {
    var parent = node.parentNode;
    if (!parent || replaced.has(parent)) return;
    replaced.add(parent);
    var wrapper = document.createElement('div');
    wrapper.style.cssText = 'display:flex;flex-direction:column;align-items:flex-start;line-height:1;';
    var img = document.createElement('img');
    img.src = SITE_CONFIG.logoPath;
    img.alt = 'The Coding Company';
    img.style.cssText = 'width:112px;max-width:35vw;height:auto;display:block;object-fit:contain;';
    wrapper.appendChild(img);
    parent.replaceChild(wrapper, node);
  }
  var logObserver = new MutationObserver(function() {
    var walker = document.createTreeWalker(document.body, 4, null, false);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function(node) {
      if (node.nodeType === 3 && node.textContent.trim() === 'thecodingcompany')
        replaceLogo(node);
    });
  });
  logObserver.observe(document.documentElement, { childList: true, subtree: true });

  // ── WhatsApp Floating Button ──
  var whatsappBtn = document.createElement('a');
  whatsappBtn.className = 'whatsapp-float';
  whatsappBtn.href = 'https://wa.me/' + SITE_CONFIG.whatsappNumber;
  whatsappBtn.target = '_blank';
  whatsappBtn.rel = 'noopener noreferrer';
  whatsappBtn.setAttribute('aria-label', 'Chat on WhatsApp');
  whatsappBtn.innerHTML = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';
  document.body.appendChild(whatsappBtn);

  // ── Mobile header scroll effect ──
  function updateHeaderOnScroll() {
    var headers = document.querySelectorAll('header.md\\:hidden, [class*="md:hidden"]:is(header)');
    var scrollY = window.scrollY;
    headers.forEach(function(h) {
      if (scrollY > 10) {
        h.classList.add('header-scrolled');
      } else {
        h.classList.remove('header-scrolled');
      }
    });
  }
  window.addEventListener('scroll', updateHeaderOnScroll, { passive: true });
  setTimeout(updateHeaderOnScroll, 100);

  // ── Freelance page redirect ──
  function isFreelancePage() {
    return window.location.pathname === '/gigs';
  }
  function renameGigsNavigation() {
    document.querySelectorAll('a[href="/gigs"]').forEach(function(link) {
      link.setAttribute('aria-label', 'Freelance');
      var textNodes = [];
      var textWalker = document.createTreeWalker(link, NodeFilter.SHOW_TEXT, null, false);
      while (textWalker.nextNode()) textNodes.push(textWalker.currentNode);
      textNodes.forEach(function(node) {
        if (node.textContent.trim() === 'Gigs') node.textContent = 'Freelance';
      });
    });
  }
  function applyFreelancePage() {
    document.documentElement.classList.toggle('freelance-page', isFreelancePage());
    if (isFreelancePage()) {
      renameGigsNavigation();
      document.title = 'Freelance | The Coding Company';
    }
  }
  document.addEventListener('click', function(event) {
    if (!isFreelancePage()) return;
    var action = event.target.closest('a, button');
    if (!action || action.closest('aside, nav') || action.classList.contains('whatsapp-float')) return;
    event.preventDefault();
    window.location.assign(SITE_CONFIG.freelanceFormUrl);
  }, true);
  if (rootEl) {
    new MutationObserver(applyFreelancePage).observe(rootEl, { childList: true, subtree: true });
  }
  applyFreelancePage();

  // ── Skip link fix ──
  var skipLink = document.getElementById('skip-link');
  if (skipLink) {
    skipLink.addEventListener('click', function(e) {
      e.preventDefault();
      var main = document.querySelector('main') || document.querySelector('[role="main"]') || document.getElementById('root');
      if (main) {
        main.setAttribute('tabindex', '-1');
        main.focus({ preventScroll: true });
        main.scrollIntoView({ behavior: 'smooth' });
        setTimeout(function() { main.removeAttribute('tabindex'); }, 1000);
      }
    });
  }
})();
