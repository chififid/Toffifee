export const initDoodles = () => {
  const doodles = [...document.querySelectorAll('[data-doodle]')];
  const loader = document.querySelector('[data-site-loader]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (doodles.length === 0 || reducedMotion.matches) {
    return;
  }

  document.documentElement.classList.add('has-doodle-motion');
  let areDoodlesObserved = false;

  const startDoodleObserver = () => {
    if (areDoodlesObserved) {
      return;
    }

    areDoodlesObserved = true;

    if (!('IntersectionObserver' in window)) {
      doodles.forEach((doodle) => doodle.classList.add('is-doodle-visible'));
      return;
    }

    const doodlesByTrigger = new Map();

    doodles.forEach((doodle) => {
      const trigger = doodle.closest('[data-doodle-trigger]') ?? doodle.parentElement ?? doodle;
      const triggerDoodles = doodlesByTrigger.get(trigger) ?? [];

      triggerDoodles.push(doodle);
      doodlesByTrigger.set(trigger, triggerDoodles);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          doodlesByTrigger
            .get(entry.target)
            ?.forEach((doodle) => doodle.classList.add('is-doodle-visible'));
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.2 },
    );

    doodlesByTrigger.forEach((_, trigger) => observer.observe(trigger));
  };

  const handleLoaderTransitionEnd = (event) => {
    if (event.propertyName !== 'opacity') {
      return;
    }

    loader?.removeEventListener('transitionend', handleLoaderTransitionEnd);
    startDoodleObserver();
  };

  if (loader && !loader.classList.contains('is-hidden')) {
    loader.addEventListener('transitionend', handleLoaderTransitionEnd);
    window.setTimeout(startDoodleObserver, 3200);
  } else {
    startDoodleObserver();
  }
};
