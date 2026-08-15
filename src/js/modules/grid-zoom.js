const getGridLineWidth = (zoom) => {
  if (zoom >= 0.8) {
    return 1 + ((1 - zoom) / 0.2) * 0.3;
  }

  if (zoom >= 0.5) {
    return 1.3 + ((0.8 - zoom) / 0.3) * 1.7;
  }

  return Math.min(4, 3 + (0.5 - zoom) * 4);
};

export const initGridZoom = () => {
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
};
