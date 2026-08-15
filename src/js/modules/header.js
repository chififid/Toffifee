const ACTIVATION_OFFSET = 160;
const DIRECTION_THRESHOLD = 8;

export const initHeader = () => {
  const header = document.querySelector('[data-site-header]');

  if (!header) {
    return;
  }

  const navigationLinks = [...header.querySelectorAll('[data-nav-link][href^="#"]')];
  const navigationSections = navigationLinks
    .map((link) => ({ link, section: document.querySelector(link.getAttribute('href')) }))
    .filter(({ section }) => section);
  let lastScrollPosition = window.scrollY;
  let isHeaderActivated = false;
  let isScrollUpdateQueued = false;

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
    header.classList.add('is-fixed', 'is-scrolled', 'is-hidden', 'is-activating');
    window.requestAnimationFrame(() => header.classList.remove('is-activating'));
  };

  const deactivateHeader = () => {
    isHeaderActivated = false;
    lastScrollPosition = 0;
    header.classList.remove('is-fixed', 'is-scrolled', 'is-hidden', 'is-activating');
  };

  const updateHeaderVisibility = () => {
    const currentScrollPosition = Math.max(window.scrollY, 0);
    const scrollDelta = currentScrollPosition - lastScrollPosition;

    updateActiveNavigation(currentScrollPosition);

    if (currentScrollPosition === 0) {
      deactivateHeader();
    } else if (!isHeaderActivated && currentScrollPosition >= ACTIVATION_OFFSET) {
      activateHeader(currentScrollPosition);
    } else if (isHeaderActivated && Math.abs(scrollDelta) >= DIRECTION_THRESHOLD) {
      header.classList.toggle('is-hidden', scrollDelta > 0);
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
  window.addEventListener('resize', () => updateActiveNavigation(Math.max(window.scrollY, 0)), {
    passive: true,
  });

  updateActiveNavigation(Math.max(window.scrollY, 0));

  if (window.scrollY >= ACTIVATION_OFFSET) {
    activateHeader(window.scrollY);
  }
};
