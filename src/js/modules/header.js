const ACTIVATION_OFFSET = 160;
const DIRECTION_THRESHOLD = 8;

export const initHeader = () => {
  const header = document.querySelector('[data-site-header]');

  if (!header) {
    return;
  }

  const menu = header.querySelector('[data-header-menu]');
  const menuToggle = header.querySelector('[data-header-toggle]');
  const mobileHeaderQuery = window.matchMedia('(max-width: 900px)');
  const navigationLinks = [...header.querySelectorAll('[data-nav-link][href^="#"]')];
  const navigationSections = navigationLinks
    .map((link) => ({ link, section: document.querySelector(link.getAttribute('href')) }))
    .filter(({ section }) => section);
  let lastScrollPosition = window.scrollY;
  let isHeaderActivated = false;
  let isScrollUpdateQueued = false;

  const isMenuOpen = () => header.classList.contains('is-menu-open');

  const setMenuState = (isOpen, { returnFocus = false } = {}) => {
    header.classList.toggle('is-menu-open', isOpen);

    if (isOpen) {
      header.classList.remove('is-menu-dismissed-by-scroll');
    }

    menuToggle?.setAttribute('aria-expanded', String(isOpen));
    menuToggle?.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');

    if (isOpen) {
      header.classList.remove('is-hidden');
    } else if (returnFocus) {
      menuToggle?.focus();
    }
  };

  const updateActiveNavigation = (currentScrollPosition) => {
    const sectionMarker = currentScrollPosition + header.offsetHeight + 24;
    const activeItem = navigationSections.find(({ section }) => {
      const sectionTop = section.getBoundingClientRect().top + currentScrollPosition;
      return sectionMarker >= sectionTop && sectionMarker < sectionTop + section.offsetHeight;
    });

    navigationSections.forEach(({ link }) => {
      const isActive = link === activeItem?.link;
      link.classList.toggle('is-active', isActive);

      if (isActive) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  const activateHeader = (currentScrollPosition) => {
    isHeaderActivated = true;
    lastScrollPosition = currentScrollPosition;
    header.classList.remove('is-menu-dismissed-by-scroll');
    header.classList.add('is-fixed', 'is-scrolled', 'is-activating');
    header.classList.toggle('is-hidden', !isMenuOpen());
    window.requestAnimationFrame(() => header.classList.remove('is-activating'));
  };

  const deactivateHeader = () => {
    isHeaderActivated = false;
    lastScrollPosition = 0;
    header.classList.remove(
      'is-fixed',
      'is-scrolled',
      'is-hidden',
      'is-activating',
      'is-menu-dismissed-by-scroll',
    );
  };

  const updateHeaderVisibility = () => {
    const currentScrollPosition = Math.max(window.scrollY, 0);
    const scrollDelta = currentScrollPosition - lastScrollPosition;

    if (mobileHeaderQuery.matches && isMenuOpen() && scrollDelta !== 0) {
      header.classList.add('is-menu-dismissed-by-scroll');
      setMenuState(false);
    }

    updateActiveNavigation(currentScrollPosition);

    if (currentScrollPosition === 0) {
      deactivateHeader();
    } else if (!isHeaderActivated && currentScrollPosition >= ACTIVATION_OFFSET) {
      activateHeader(currentScrollPosition);
    } else if (isHeaderActivated && Math.abs(scrollDelta) >= DIRECTION_THRESHOLD) {
      header.classList.toggle('is-hidden', scrollDelta > 0 && !isMenuOpen());
      lastScrollPosition = currentScrollPosition;
    } else if (!isHeaderActivated) {
      lastScrollPosition = currentScrollPosition;
    }

    isScrollUpdateQueued = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!isScrollUpdateQueued) {
        window.requestAnimationFrame(updateHeaderVisibility);
        isScrollUpdateQueued = true;
      }
    },
    { passive: true },
  );

  header.addEventListener('focusin', () => {
    if (isHeaderActivated) {
      header.classList.remove('is-hidden');
    }
  });
  header.addEventListener('focusout', (event) => {
    if (
      mobileHeaderQuery.matches &&
      isMenuOpen() &&
      event.relatedTarget &&
      !header.contains(event.relatedTarget)
    ) {
      setMenuState(false);
    }
  });

  menuToggle?.addEventListener('click', () => setMenuState(!isMenuOpen()));
  menu?.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      setMenuState(false);
    }
  });
  document.addEventListener('click', (event) => {
    if (mobileHeaderQuery.matches && isMenuOpen() && !header.contains(event.target)) {
      setMenuState(false);
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isMenuOpen()) {
      setMenuState(false, { returnFocus: true });
    }
  });
  mobileHeaderQuery.addEventListener('change', ({ matches }) => {
    if (!matches) {
      setMenuState(false);
    }
  });
  window.addEventListener('resize', () => updateActiveNavigation(Math.max(window.scrollY, 0)), {
    passive: true,
  });

  updateActiveNavigation(Math.max(window.scrollY, 0));

  if (window.scrollY >= ACTIVATION_OFFSET) {
    activateHeader(window.scrollY);
  }
};
