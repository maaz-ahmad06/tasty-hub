/**
 * BiteDash - Main JS Handler
 */

document.addEventListener('DOMContentLoaded', () => {
  // Prevent page scroll during preloader
  document.body.classList.add('loading');

  initNavbarScroll();
  initMobileMenu();
  initMenuFilters();
  initStatsCounters();

  // Preloader hide after 2.5 seconds
  setTimeout(() => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
      preloader.style.opacity = '0';
      preloader.style.visibility = 'hidden';
    }
    document.body.classList.remove('loading');
    
    // Trigger scroll reveal observer after loader finishes
    initScrollReveal();
  }, 2500);
});

/**
 * 1. Navbar Scroll Transition
 * Adds '.scrolled' class when scrolling down to give it a solid backdrop
 */
function initNavbarScroll() {
  const header = document.getElementById('navbarHeader');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  // Run on load in case the page is already scrolled
  handleScroll();

  // Throttled scroll listener for performance
  let isScrolling;
  window.addEventListener('scroll', () => {
    window.requestAnimationFrame(() => {
      handleScroll();
    });
  }, { passive: true });
}

/**
 * 2. Mobile Drawer Navigation
 * Manages the slide-in menu drawer and overlay
 */
function initMobileMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const drawerClose = document.getElementById('drawerClose');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileOverlay = document.getElementById('mobileOverlay');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  if (!menuToggle || !mobileDrawer || !mobileOverlay) return;

  const openDrawer = () => {
    mobileDrawer.classList.add('active');
    mobileOverlay.classList.add('active');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden'; // Disable page scrolling when drawer is open
  };

  const closeDrawer = () => {
    mobileDrawer.classList.remove('active');
    mobileOverlay.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = ''; // Enable page scrolling
  };

  menuToggle.addEventListener('click', () => {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  if (drawerClose) {
    drawerClose.addEventListener('click', closeDrawer);
  }
  
  mobileOverlay.addEventListener('click', closeDrawer);

  // Close drawer when clicking nav links
  drawerLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}

/**
 * 3. Scroll Reveal Animation Trigger
 * Uses Intersection Observer to add '.in-view' class to elements with '.scroll-reveal'
 * ready for phase 2 and future sections.
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.scroll-reveal');
  if (revealElements.length === 0) return;

  const options = {
    threshold: 0.15,
    rootMargin: '0px 0px -80px 0px' // triggers slightly before entering the screen
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target); // Only trigger once
      }
    });
  }, options);

  revealElements.forEach(element => {
    observer.observe(element);
  });
}

/**
 * 4. Menu Category Filters
 * Animates and filters popular dishes based on category tabs
 */
function initMenuFilters() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const menuCards = document.querySelectorAll('.menu-card');

  if (tabBtns.length === 0 || menuCards.length === 0) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons and add to the clicked button
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      menuCards.forEach(card => {
        const category = card.getAttribute('data-category');

        if (filterValue === 'all' || category === filterValue) {
          // Reveal card
          card.classList.remove('hidden');
          // Trigger reflow to start opacity transition
          void card.offsetWidth;
          card.classList.remove('fade-out');
        } else {
          // Hide card: fade out first
          card.classList.add('fade-out');
          
          // Add hidden class once transition ends
          const handleTransitionEnd = (e) => {
            if (e.propertyName === 'opacity') {
              if (card.classList.contains('fade-out')) {
                card.classList.add('hidden');
              }
              card.removeEventListener('transitionend', handleTransitionEnd);
            }
          };
          card.addEventListener('transitionend', handleTransitionEnd);
          
          // Fallback safety timeout
          setTimeout(() => {
            if (card.classList.contains('fade-out')) {
              card.classList.add('hidden');
            }
          }, 400);
        }
      });
    });
  });
}

/**
 * 5. Animated Counter Stats
 * Animates numerical stats counting up when they enter the viewport
 */
function initStatsCounters() {
  const counters = document.querySelectorAll('.stat-number');
  if (counters.length === 0) return;

  const animate = (counter) => {
    const target = parseInt(counter.getAttribute('data-target'), 10);
    const duration = 2000; // Animation duration in ms (2 seconds)
    const frameRate = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameRate);
    let frame = 0;

    // Smooth counting via easing (easeOutQuad)
    const easeOutQuad = (t) => t * (2 - t);

    const timer = setInterval(() => {
      frame++;
      const progress = easeOutQuad(frame / totalFrames);
      const currentValue = Math.round(progress * target);

      if (frame >= totalFrames) {
        counter.textContent = target;
        clearInterval(timer);
      } else {
        counter.textContent = currentValue;
      }
    }, frameRate);
  };

  const observerOptions = {
    threshold: 0.8, // Trigger when 80% visible
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate(entry.target);
        observer.unobserve(entry.target); // Animate once
      }
    });
  }, observerOptions);

  counters.forEach(counter => observer.observe(counter));
}
