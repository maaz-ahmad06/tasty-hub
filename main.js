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
  initScrollSpy();
  initCartLogic();
  initSearchLogic();

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

/**
 * 6. Scroll Spy Navigation Highlight
 * Highlights the active section menu link in the navbar as user scrolls
 */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id], footer[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  if (sections.length === 0) return;

  const handleScrollSpy = () => {
    let currentSectionId = '';
    const scrollPosition = window.scrollY + 130; // offset header height

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    if (currentSectionId) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        }
      });

      drawerLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        }
      });
    }
  };

  window.addEventListener('scroll', handleScrollSpy, { passive: true });
  handleScrollSpy(); // Trigger initially
}

/**
 * 7. Search Overlay Popup Logic
 */
function initSearchLogic() {
  const searchBtn = document.getElementById('searchBtn');
  const searchClose = document.getElementById('searchClose');
  const searchOverlay = document.getElementById('searchOverlay');
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');

  if (!searchBtn || !searchOverlay || !searchClose) return;

  searchBtn.addEventListener('click', () => {
    searchOverlay.classList.add('active');
    setTimeout(() => searchInput.focus(), 100);
  });

  const closeSearch = () => {
    searchOverlay.classList.remove('active');
  };

  searchClose.addEventListener('click', closeSearch);

  // Close search on escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
      closeSearch();
    }
  });

  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert(`Searching for: "${searchInput.value}"`);
      closeSearch();
      searchInput.value = '';
    });
  }
}

/**
 * 8. Cart Slide-Out Drawer & Toast Notifications
 */
function initCartLogic() {
  const cartBtn = document.getElementById('cartBtn');
  const cartClose = document.getElementById('cartClose');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartDrawer = document.getElementById('cartDrawer');
  const shopNowBtn = document.getElementById('shopNowBtn');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const cartItemsContainer = document.getElementById('cartItemsContainer');
  const cartSubtotal = document.getElementById('cartSubtotal');
  const cartCountHeader = document.getElementById('cartCountHeader');
  const cartBadge = document.querySelector('.cart-badge');
  const addButtons = document.querySelectorAll('.add-to-cart-btn');
  const toastContainer = document.getElementById('toastContainer');

  if (!cartBtn || !cartDrawer || !cartClose || !cartOverlay) return;

  // Cart state memory
  let cart = [];

  const toggleCart = () => {
    cartDrawer.classList.toggle('active');
    cartOverlay.classList.toggle('active');
    document.body.classList.toggle('cart-open');
  };

  cartBtn.addEventListener('click', toggleCart);
  cartClose.addEventListener('click', toggleCart);
  cartOverlay.addEventListener('click', toggleCart);

  if (shopNowBtn) {
    shopNowBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleCart();
      const menuSection = document.getElementById('menu');
      if (menuSection) {
        menuSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Update Cart Badge and Drawer UI
  const updateCartUI = () => {
    // 1. Calculate count
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    
    // Update Badge
    if (totalItems > 0) {
      cartBadge.textContent = totalItems;
      cartBadge.style.display = 'flex';
    } else {
      cartBadge.textContent = '0';
      cartBadge.style.display = 'none';
    }

    // Update Header Count
    if (cartCountHeader) {
      cartCountHeader.textContent = totalItems;
    }

    // 2. Calculate Subtotal
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    if (cartSubtotal) {
      cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    }

    // 3. Render List
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="cart-empty-message">
          <span class="cart-empty-icon">🛒</span>
          <p>Your cart is empty</p>
          <a href="#menu" class="btn btn-primary btn-sm" id="shopNowBtnInner">Shop Now</a>
        </div>
      `;
      // Bind Shop Now inside empty message
      const innerShop = document.getElementById('shopNowBtnInner');
      if (innerShop) {
        innerShop.addEventListener('click', (e) => {
          e.preventDefault();
          toggleCart();
          const menuSection = document.getElementById('menu');
          if (menuSection) {
            menuSection.scrollIntoView({ behavior: 'smooth' });
          }
        });
      }
    } else {
      let html = '';
      cart.forEach(item => {
        html += `
          <div class="cart-item">
            <img src="${item.image}" alt="${item.title}" class="cart-item-img">
            <div class="cart-item-info">
              <h4 class="cart-item-title">${item.title}</h4>
              <span class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</span>
              <div class="cart-item-qty-control">
                <button class="cart-qty-btn decrease-qty" data-title="${item.title}">-</button>
                <span class="cart-qty-val">${item.qty}</span>
                <button class="cart-qty-btn increase-qty" data-title="${item.title}">+</button>
              </div>
            </div>
            <button class="cart-item-remove" data-title="${item.title}">&times;</button>
          </div>
        `;
      });
      cartItemsContainer.innerHTML = html;
    }
  };

  // Toast notifications trigger
  const showToast = (message) => {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `<span>🍔</span> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    // Trigger transition
    setTimeout(() => toast.classList.add('active'), 50);

    // Fade out and remove
    setTimeout(() => {
      toast.classList.remove('active');
      setTimeout(() => toast.remove(), 400);
    }, 2800);
  };

  // Add Item to Cart Array
  const addItemToCart = (title, price, image) => {
    const existing = cart.find(item => item.title === title);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ title, price, image, qty: 1 });
    }
    updateCartUI();
    showToast(`Added ${title} to your cart!`);
  };

  // Bind Add Buttons on Menu Items
  addButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.menu-card');
      if (!card) return;

      const title = card.querySelector('.menu-card-title').textContent;
      const priceText = card.querySelector('.menu-card-price') 
        ? card.querySelector('.menu-card-price').textContent 
        : card.querySelector('.menu-card-price-tag').textContent;
      const price = parseFloat(priceText.replace('$', ''));
      const image = card.querySelector('.menu-card-img').getAttribute('src');

      addItemToCart(title, price, image);
    });
  });

  // Quantity and Remove Event Delegation
  cartItemsContainer.addEventListener('click', (e) => {
    const target = e.target;
    const title = target.getAttribute('data-title');
    if (!title) return;

    if (target.classList.contains('increase-qty')) {
      const item = cart.find(i => i.title === title);
      if (item) {
        item.qty += 1;
        updateCartUI();
      }
    } else if (target.classList.contains('decrease-qty')) {
      const item = cart.find(i => i.title === title);
      if (item) {
        item.qty -= 1;
        if (item.qty <= 0) {
          cart = cart.filter(i => i.title !== title);
        }
        updateCartUI();
      }
    } else if (target.classList.contains('cart-item-remove')) {
      cart = cart.filter(i => i.title !== title);
      updateCartUI();
    }
  });

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        alert("Your cart is empty! Please add some delicious meals first.");
        return;
      }
      alert("Order submitted successfully! Thank you for ordering from BiteDash.");
      cart = [];
      updateCartUI();
      toggleCart();
    });
  }

  // Pre-load current badge number (if design contains static mockup numbers e.g. "2")
  const initialBadgeVal = parseInt(cartBadge.textContent, 10);
  if (initialBadgeVal > 0) {
    // Add two mock items to match the "2" on badge
    cart.push({ title: "Margherita Pizza", price: 12.99, image: "assets/menu-pizza.jpg", qty: 1 });
    cart.push({ title: "Double Cheeseburger", price: 9.49, image: "assets/menu-burger.jpg", qty: 1 });
    updateCartUI();
  }
}

