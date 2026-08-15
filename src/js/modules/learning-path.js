const EXIT_DURATION = 120;

export const initLearningPath = () => {
  const root = document.querySelector('[data-learning-path]');

  if (!root) {
    return;
  }

  const tabs = [...root.querySelectorAll('[data-learning-tab]')];
  const levelCards = [...root.querySelectorAll('[data-level-card]')];
  const tabsControl = root.querySelector('[data-learning-tabs]');
  const levelPanel = root.querySelector('[data-learning-panel]');
  const detailTitle = root.querySelector('[data-learning-detail-title]');
  const detailText = root.querySelector('[data-learning-detail-text]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const textTransitionRevisions = new Map();
  let currentAudience = tabs.find((tab) => tab.classList.contains('is-active'))?.dataset.audience;

  if (!currentAudience) {
    currentAudience = 'children';
  }

  const transitionText = (targets, updateContent, transitionKey, motion = 'fade') => {
    const elements = targets.filter(Boolean);
    const revision = (textTransitionRevisions.get(transitionKey) ?? 0) + 1;
    textTransitionRevisions.set(transitionKey, revision);
    elements.forEach((element) =>
      element.getAnimations().forEach((animation) => animation.cancel()),
    );

    if (reducedMotion.matches || elements.length === 0) {
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
        duration: EXIT_DURATION,
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
    if (!card || !detailTitle || !detailText) {
      return;
    }

    detailTitle.textContent = `${card.dataset.level} — ${card.dataset.name} УРОВЕНЬ`;
    detailText.textContent =
      currentAudience === 'adults'
        ? card.dataset.description.replace(/^Ребёнок/, 'Взрослый ученик')
        : card.dataset.description;
  };

  const updateAudience = (audience, { focusTab = false } = {}) => {
    const activeTab = tabs.find((tab) => tab.dataset.audience === audience);

    if (!activeTab) {
      return;
    }

    if (audience !== currentAudience) {
      currentAudience = audience;
      tabsControl?.classList.toggle('is-adults', audience === 'adults');

      const hours = levelCards.map((card) => card.querySelector('[data-level-hours]'));
      transitionText(
        hours,
        () => {
          levelCards.forEach((card) => {
            const hoursElement = card.querySelector('[data-level-hours]');

            if (hoursElement) {
              hoursElement.textContent =
                audience === 'adults' ? card.dataset.hoursAdults : card.dataset.hoursChildren;
            }
          });
        },
        'hours',
        'slide',
      );
      transitionText(
        [detailTitle, detailText],
        () => updateDetail(root.querySelector('[data-level-card].is-selected')),
        'detail',
      );
    }

    tabs.forEach((tab) => {
      const isActive = tab === activeTab;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });
    levelPanel?.setAttribute('aria-labelledby', activeTab.id);

    if (focusTab) {
      activeTab.focus();
    }
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => updateAudience(tab.dataset.audience));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        return;
      }

      event.preventDefault();
      let nextIndex = index;

      if (event.key === 'ArrowLeft') {
        nextIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (event.key === 'ArrowRight') {
        nextIndex = (index + 1) % tabs.length;
      } else if (event.key === 'Home') {
        nextIndex = 0;
      } else if (event.key === 'End') {
        nextIndex = tabs.length - 1;
      }

      updateAudience(tabs[nextIndex].dataset.audience, { focusTab: true });
    });
  });

  levelCards.forEach((card) => {
    card.setAttribute('aria-pressed', String(card.classList.contains('is-selected')));
    card.addEventListener('click', () => {
      if (card.classList.contains('is-selected')) {
        return;
      }

      levelCards.forEach((item) => {
        const isSelected = item === card;
        item.classList.toggle('is-selected', isSelected);
        item.setAttribute('aria-pressed', String(isSelected));
      });
      transitionText([detailTitle, detailText], () => updateDetail(card), 'detail');
    });
  });

  updateAudience(currentAudience);
};
