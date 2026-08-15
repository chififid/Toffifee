const MINIMUM_VISIBLE_TIME = 1650;
const REDUCED_MOTION_VISIBLE_TIME = 300;
const MAXIMUM_VISIBLE_TIME = 2300;

export const initLoader = () => {
  const loader = document.querySelector('[data-site-loader]');

  if (!loader) {
    document.documentElement.classList.remove('is-loading');
    return;
  }

  const loaderStartedAt = performance.now();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let isLoaderHidden = false;

  const finishLoading = () => {
    if (isLoaderHidden) {
      return;
    }

    isLoaderHidden = true;
    document.documentElement.classList.remove('is-loading');

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => loader.classList.add('is-hidden'));
    });
  };

  const hideLoader = () => {
    const minimumVisibleTime = reducedMotion.matches
      ? REDUCED_MOTION_VISIBLE_TIME
      : MINIMUM_VISIBLE_TIME;
    const remainingTime = Math.max(0, minimumVisibleTime - (performance.now() - loaderStartedAt));

    window.setTimeout(finishLoading, remainingTime);
  };

  if (document.readyState === 'complete') {
    hideLoader();
  } else {
    window.addEventListener('load', hideLoader, { once: true });
  }

  window.setTimeout(finishLoading, MAXIMUM_VISIBLE_TIME);
};
