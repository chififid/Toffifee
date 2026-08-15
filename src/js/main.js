import { initCourseOptions } from './modules/course-options.js';
import { initDoodles } from './modules/doodles.js';
import { initFaq } from './modules/faq.js';
import { initGridZoom } from './modules/grid-zoom.js';
import { initHeader } from './modules/header.js';
import { initLearningPath } from './modules/learning-path.js';
import { initLoader } from './modules/loader.js';
import { initReviewsSlider } from './modules/reviews-slider.js';
import { initTeachersSlider } from './modules/teachers-slider.js';

initLoader();
initDoodles();
initGridZoom();
initHeader();
initTeachersSlider();
initLearningPath();
initReviewsSlider();
initCourseOptions();
initFaq();
