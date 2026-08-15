import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';

import { bindShiftWheel } from '../utils/bind-shift-wheel.js';

const SLIDE_GAP = 7;

export const initTeachersSlider = () => {
  const root = document.querySelector('[data-teachers]');
  const slider = root?.querySelector('[data-teachers-slider]');
  const wrapper = slider?.querySelector('.swiper-wrapper');

  if (!slider || !wrapper || wrapper.children.length === 0) {
    return;
  }

  const originalSlides = [...wrapper.children];
  let swiper;
  let sideCopyCount = 0;
  let resizeFrameId;

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
    const visibleSlideCount = Math.ceil(slider.clientWidth / (slideWidth + SLIDE_GAP)) + 1;
    const requiredSlideCount = visibleSlideCount + Math.ceil(visibleSlideCount / 2) + 2;
    const requiredGroupCount = Math.ceil(requiredSlideCount / originalSlides.length);

    return Math.max(1, Math.ceil((requiredGroupCount - 1) / 2));
  };

  const buildSlider = (activeTeacherIndex = 0) => {
    swiper?.destroy(true, true);
    sideCopyCount = getRequiredSideCopyCount();

    const leadingSlides = document.createDocumentFragment();
    const trailingSlides = document.createDocumentFragment();

    for (let copyIndex = 0; copyIndex < sideCopyCount; copyIndex += 1) {
      originalSlides.forEach((slide) => {
        leadingSlides.append(createSlideClone(slide));
        trailingSlides.append(createSlideClone(slide));
      });
    }

    wrapper.replaceChildren(leadingSlides, ...originalSlides, trailingSlides);

    swiper = new Swiper(slider, {
      modules: [Navigation],
      loop: true,
      initialSlide: sideCopyCount * originalSlides.length + activeTeacherIndex,
      slidesPerView: 'auto',
      centeredSlides: true,
      slidesPerGroup: 1,
      spaceBetween: SLIDE_GAP,
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
        prevEl: root.querySelector('[data-teachers-prev]'),
        nextEl: root.querySelector('[data-teachers-next]'),
      },
    });
  };

  buildSlider();
  bindShiftWheel(slider, () => swiper);

  window.addEventListener(
    'resize',
    () => {
      window.cancelAnimationFrame(resizeFrameId);
      resizeFrameId = window.requestAnimationFrame(() => {
        const nextSideCopyCount = getRequiredSideCopyCount();

        if (nextSideCopyCount !== sideCopyCount) {
          const activeSlide = swiper.slides[swiper.activeIndex];
          buildSlider(Number(activeSlide?.dataset.teacherIndex ?? 0));
        }
      });
    },
    { passive: true },
  );
};
