const WHEEL_THRESHOLD = 20;

export const bindShiftWheel = (element, getSlider) => {
  let wheelDelta = 0;

  element.addEventListener(
    'wheel',
    (event) => {
      if (!event.shiftKey) {
        return;
      }

      event.preventDefault();
      const slider = getSlider();

      if (!slider || slider.animating) {
        wheelDelta = 0;
        return;
      }

      wheelDelta += Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;

      if (Math.abs(wheelDelta) < WHEEL_THRESHOLD) {
        return;
      }

      if (wheelDelta > 0) {
        slider.slideNext();
      } else {
        slider.slidePrev();
      }

      wheelDelta = 0;
    },
    { passive: false },
  );
};
