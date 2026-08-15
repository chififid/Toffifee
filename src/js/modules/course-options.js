export const initCourseOptions = () => {
  const root = document.querySelector('[data-course-options]');
  const tabs = [...(root?.querySelectorAll('[data-course-tab]') ?? [])];

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((item) => {
        const isActive = item === tab;
        item.classList.toggle('is-active', isActive);
        item.setAttribute('aria-pressed', String(isActive));
      });
    });
  });
};
