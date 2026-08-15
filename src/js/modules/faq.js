export const initFaq = () => {
  const root = document.querySelector('[data-faq]');
  const items = [...(root?.querySelectorAll('[data-faq-item]') ?? [])];

  items.forEach((item) => {
    const question = item.querySelector('[data-faq-question]');

    question?.addEventListener('click', () => {
      const willOpen = !item.classList.contains('is-open');

      items.forEach((currentItem) => {
        const isOpen = currentItem === item && willOpen;
        currentItem.classList.toggle('is-open', isOpen);
        currentItem
          .querySelector('[data-faq-question]')
          ?.setAttribute('aria-expanded', String(isOpen));
      });
    });
  });
};
