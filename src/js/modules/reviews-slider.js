import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';

import { bindShiftWheel } from '../utils/bind-shift-wheel.js';

export const initReviewsSlider = () => {
  const root = document.querySelector('[data-reviews]');
  const slider = root?.querySelector('[data-reviews-slider]');

  if (!slider) {
    return;
  }

  slider.querySelectorAll('img').forEach((image) => {
    image.draggable = false;
  });

  const swiper = new Swiper(slider, {
    modules: [Navigation],
    slidesPerView: 'auto',
    slidesPerGroup: 1,
    spaceBetween: 16,
    slidesOffsetAfter: 24,
    speed: 520,
    grabCursor: true,
    simulateTouch: true,
    touchStartPreventDefault: false,
    preventClicks: false,
    preventClicksPropagation: false,
    watchOverflow: true,
    breakpoints: {
      700: {
        spaceBetween: 24,
        slidesOffsetAfter: 80,
      },
      1100: {
        spaceBetween: 32,
        slidesOffsetAfter: 440,
      },
    },
    navigation: {
      prevEl: root.querySelector('[data-reviews-prev]'),
      nextEl: root.querySelector('[data-reviews-next]'),
    },
  });

  bindShiftWheel(slider, () => swiper);
};
