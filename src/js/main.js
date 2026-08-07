import '../css/reset.css';
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import '../scss/main.scss';

const getGridLineWidth = (zoom) => {
  if (zoom >= 0.8) {
    return 1 + ((1 - zoom) / 0.2) * 0.3;
  }

  if (zoom >= 0.5) {
    return 1.3 + ((0.8 - zoom) / 0.3) * 1.7;
  }

  return Math.min(4, 3 + (0.5 - zoom) * 4);
};

const updateGridForZoom = () => {
  const zoomSignals = [
    window.devicePixelRatio,
    window.outerWidth > 0 ? window.outerWidth / window.innerWidth : 1,
    window.screen.width > 0 ? window.screen.width / window.innerWidth : 1,
  ].filter((value) => Number.isFinite(value) && value > 0);
  const viewportZoom = Math.min(1, ...zoomSignals);
  const isZoomedOut = viewportZoom < 0.99;
  const isStronglyZoomedOut = viewportZoom <= 0.8;
  const visibleLineWidth = getGridLineWidth(viewportZoom).toFixed(2);
  document.documentElement.classList.toggle('is-grid-zoomed-out', isStronglyZoomedOut);

  if (isZoomedOut) {
    document.documentElement.style.setProperty('--grid-line-width', `${visibleLineWidth}px`);
  } else {
    document.documentElement.style.removeProperty('--grid-line-width');
  }
};

updateGridForZoom();
window.addEventListener('resize', updateGridForZoom, { passive: true });
window.visualViewport?.addEventListener('resize', updateGridForZoom, { passive: true });

const siteHeader = document.querySelector('.site-header');

if (siteHeader) {
  const activationOffset = 160;
  const directionThreshold = 8;
  const navigationLinks = [...siteHeader.querySelectorAll('.site-header__link[href^="#"]')];
  const navigationSections = navigationLinks
    .map((link) => ({
      link,
      section: document.querySelector(link.getAttribute('href')),
    }))
    .filter(({ section }) => section);
  let lastScrollPosition = window.scrollY;
  let isHeaderActivated = false;
  let isScrollUpdateQueued = false;

  const updateActiveNavigation = (currentScrollPosition) => {
    const sectionMarker = currentScrollPosition + siteHeader.offsetHeight + 24;
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
    siteHeader.classList.add('is-fixed', 'is-scrolled', 'is-hidden', 'is-activating');

    window.requestAnimationFrame(() => {
      siteHeader.classList.remove('is-activating');
    });
  };

  const deactivateHeader = () => {
    isHeaderActivated = false;
    lastScrollPosition = 0;
    siteHeader.classList.remove('is-fixed', 'is-scrolled', 'is-hidden', 'is-activating');
  };

  const updateHeaderVisibility = () => {
    const currentScrollPosition = Math.max(window.scrollY, 0);
    const scrollDelta = currentScrollPosition - lastScrollPosition;

    updateActiveNavigation(currentScrollPosition);

    if (currentScrollPosition === 0) {
      deactivateHeader();
    } else if (!isHeaderActivated && currentScrollPosition >= activationOffset) {
      activateHeader(currentScrollPosition);
    } else if (isHeaderActivated && Math.abs(scrollDelta) >= directionThreshold) {
      siteHeader.classList.toggle('is-hidden', scrollDelta > 0);
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

  siteHeader.addEventListener('focusin', () => {
    if (isHeaderActivated) {
      siteHeader.classList.remove('is-hidden');
    }
  });

  window.addEventListener(
    'resize',
    () => {
      updateActiveNavigation(Math.max(window.scrollY, 0));
    },
    { passive: true },
  );

  updateActiveNavigation(Math.max(window.scrollY, 0));

  if (window.scrollY >= activationOffset) {
    activateHeader(window.scrollY);
  }
}

const teachersSlider = document.querySelector('.meet-toffifee__slider');

if (teachersSlider) {
  const sliderWrapper = teachersSlider.querySelector('.swiper-wrapper');
  const originalSlides = [...sliderWrapper.children];
  const slideGap = 7;
  let teachersSwiper;
  let sideCopyCount = 0;
  let resizeFrameId;
  let wheelDelta = 0;

  originalSlides.forEach((slide, index) => {
    slide.dataset.teacherIndex = String(index);
    slide.querySelectorAll('img').forEach((image) => {
      image.draggable = false;
    });
  });

  const createSlideClone = (slide) => {
    const clone = slide.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone
      .querySelectorAll('a, button')
      .forEach((control) => control.setAttribute('tabindex', '-1'));
    return clone;
  };

  const getRequiredSideCopyCount = () => {
    const slideWidth = originalSlides[0].getBoundingClientRect().width;
    const visibleSlideCount = Math.ceil(teachersSlider.clientWidth / (slideWidth + slideGap)) + 1;
    const requiredSlideCount = visibleSlideCount + Math.ceil(visibleSlideCount / 2) + 2;
    const requiredGroupCount = Math.ceil(requiredSlideCount / originalSlides.length);

    return Math.max(1, Math.ceil((requiredGroupCount - 1) / 2));
  };

  const buildTeachersSlider = (activeTeacherIndex = 0) => {
    teachersSwiper?.destroy(true, true);
    sideCopyCount = getRequiredSideCopyCount();

    const leadingSlides = document.createDocumentFragment();
    const trailingSlides = document.createDocumentFragment();

    for (let copyIndex = 0; copyIndex < sideCopyCount; copyIndex += 1) {
      originalSlides.forEach((slide) => {
        leadingSlides.append(createSlideClone(slide));
        trailingSlides.append(createSlideClone(slide));
      });
    }

    sliderWrapper.replaceChildren(leadingSlides, ...originalSlides, trailingSlides);

    teachersSwiper = new Swiper(teachersSlider, {
      modules: [Navigation],
      loop: true,
      initialSlide: sideCopyCount * originalSlides.length + activeTeacherIndex,
      slidesPerView: 'auto',
      centeredSlides: true,
      slidesPerGroup: 1,
      spaceBetween: slideGap,
      speed: 550,
      allowTouchMove: true,
      simulateTouch: true,
      threshold: 8,
      touchStartPreventDefault: true,
      preventClicks: false,
      preventClicksPropagation: false,
      noSwiping: true,
      noSwipingSelector:
        '.teacher-card__name, .teacher-card__meta, .teacher-card__certificate, .teacher-card__play, .teacher-card__reviews',
      preventInteractionOnTransition: true,
      roundLengths: true,
      navigation: {
        prevEl: '.meet-toffifee__control--prev',
        nextEl: '.meet-toffifee__control--next',
      },
    });
  };

  buildTeachersSlider();

  teachersSlider.addEventListener(
    'wheel',
    (event) => {
      if (!event.shiftKey) {
        return;
      }

      event.preventDefault();
      wheelDelta += Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;

      if (Math.abs(wheelDelta) < 20 || teachersSwiper.animating) {
        return;
      }

      if (wheelDelta > 0) {
        teachersSwiper.slideNext();
      } else {
        teachersSwiper.slidePrev();
      }

      wheelDelta = 0;
    },
    { passive: false },
  );

  window.addEventListener(
    'resize',
    () => {
      window.cancelAnimationFrame(resizeFrameId);
      resizeFrameId = window.requestAnimationFrame(() => {
        const nextSideCopyCount = getRequiredSideCopyCount();

        if (nextSideCopyCount !== sideCopyCount) {
          const activeSlide = teachersSwiper.slides[teachersSwiper.activeIndex];
          const activeTeacherIndex = Number(activeSlide?.dataset.teacherIndex ?? 0);
          buildTeachersSlider(activeTeacherIndex);
        }
      });
    },
    { passive: true },
  );
}

const learningPath = document.querySelector('.learning-path');

if (learningPath) {
  const tabs = [...learningPath.querySelectorAll('.learning-path__tab')];
  const levelCards = [...learningPath.querySelectorAll('.level-card')];
  const tabsControl = learningPath.querySelector('.learning-path__tabs');
  const detailTitle = learningPath.querySelector('.learning-path__detail-title');
  const detailText = learningPath.querySelector('.learning-path__detail-text');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let currentAudience = 'children';
  const textTransitionRevisions = new Map();

  const transitionText = (targets, updateContent, transitionKey, motion = 'fade') => {
    const elements = targets.filter(Boolean);
    const revision = (textTransitionRevisions.get(transitionKey) ?? 0) + 1;
    textTransitionRevisions.set(transitionKey, revision);

    elements.forEach((element) => {
      element.getAnimations().forEach((animation) => animation.cancel());
    });

    if (reducedMotionQuery.matches) {
      updateContent();
      return;
    }

    const exitKeyframes =
      motion === 'slide'
        ? [
            { opacity: 1, transform: 'translateY(0)' },
            { opacity: 0, transform: 'translateY(-4px)' },
          ]
        : [{ opacity: 1 }, { opacity: 0 }];
    const enterKeyframes =
      motion === 'slide'
        ? [
            { opacity: 0, transform: 'translateY(5px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ]
        : [{ opacity: 0 }, { opacity: 1 }];

    const exitAnimations = elements.map((element) =>
      element.animate(exitKeyframes, {
        duration: 120,
        easing: 'ease-in',
        fill: 'forwards',
      }),
    );

    Promise.allSettled(exitAnimations.map((animation) => animation.finished)).then(() => {
      if (revision !== textTransitionRevisions.get(transitionKey)) {
        return;
      }

      updateContent();

      elements.forEach((element) => {
        element.animate(enterKeyframes, {
          duration: motion === 'slide' ? 220 : 180,
          easing: motion === 'slide' ? 'cubic-bezier(0.22, 1, 0.36, 1)' : 'ease-out',
          fill: 'both',
        });
      });
    });
  };

  const updateDetail = (card) => {
    detailTitle.textContent = `${card.dataset.level} — ${card.dataset.name} УРОВЕНЬ`;
    detailText.textContent =
      currentAudience === 'adults'
        ? card.dataset.description.replace(/^Ребёнок/, 'Взрослый ученик')
        : card.dataset.description;
  };

  const updateAudience = (audience) => {
    if (audience === currentAudience) {
      return;
    }

    currentAudience = audience;
    tabsControl.classList.toggle('is-adults', audience === 'adults');

    tabs.forEach((item) => {
      const isActive = item.dataset.audience === audience;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    const hours = levelCards.map((card) => card.querySelector('.level-card__hours'));

    transitionText(
      hours,
      () => {
        levelCards.forEach((card) => {
          card.querySelector('.level-card__hours').textContent =
            audience === 'adults' ? card.dataset.hoursAdults : card.dataset.hoursChildren;
        });
      },
      'hours',
      'slide',
    );

    transitionText(
      [detailTitle, detailText],
      () => updateDetail(learningPath.querySelector('.level-card.is-selected')),
      'detail',
    );
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      updateAudience(tab.dataset.audience);
    });
  });

  levelCards.forEach((card) => {
    card.setAttribute('aria-pressed', card.classList.contains('is-selected') ? 'true' : 'false');

    card.addEventListener('click', () => {
      if (card.classList.contains('is-selected')) {
        return;
      }

      levelCards.forEach((item) => {
        const isSelected = item === card;
        item.classList.toggle('is-selected', isSelected);
        item.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
      });

      transitionText([detailTitle, detailText], () => updateDetail(card), 'detail');
    });
  });
}

const reviewsSlider = document.querySelector('.reviews__slider');

if (reviewsSlider) {
  reviewsSlider.querySelectorAll('img').forEach((image) => {
    image.draggable = false;
  });

  const reviewsSwiper = new Swiper(reviewsSlider, {
    modules: [Navigation],
    slidesPerView: 'auto',
    slidesPerGroup: 1,
    spaceBetween: 32,
    slidesOffsetAfter: 440,
    speed: 520,
    grabCursor: true,
    simulateTouch: true,
    touchStartPreventDefault: false,
    preventClicks: false,
    preventClicksPropagation: false,
    watchOverflow: true,
    navigation: {
      prevEl: '.reviews__control--prev',
      nextEl: '.reviews__control--next',
    },
  });

  let wheelDelta = 0;

  reviewsSlider.addEventListener(
    'wheel',
    (event) => {
      if (!event.shiftKey) {
        return;
      }

      event.preventDefault();

      if (reviewsSwiper.animating) {
        wheelDelta = 0;
        return;
      }

      wheelDelta += Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;

      if (Math.abs(wheelDelta) < 20) {
        return;
      }

      if (wheelDelta > 0) {
        reviewsSwiper.slideNext();
      } else {
        reviewsSwiper.slidePrev();
      }

      wheelDelta = 0;
    },
    { passive: false },
  );
}

document.querySelectorAll('.course-options__tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.course-options__tab').forEach((item) => {
      const isActive = item === tab;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  });
});

document.querySelectorAll('.faq__question').forEach((question) => {
  question.addEventListener('click', () => {
    const selectedItem = question.closest('.faq__item');
    const willOpen = !selectedItem.classList.contains('is-open');

    document.querySelectorAll('.faq__item').forEach((item) => {
      const isOpen = item === selectedItem && willOpen;
      item.classList.toggle('is-open', isOpen);
      item.querySelector('.faq__question').setAttribute('aria-expanded', String(isOpen));
    });
  });
});
