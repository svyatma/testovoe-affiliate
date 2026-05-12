document.addEventListener('DOMContentLoaded', () => {
  const initSlider = () => {
    const slider = document.querySelector('.slider');
    if (!slider) return;

    const track = slider.querySelector('.slider__track');
    const slides = Array.from(track.querySelectorAll('.slider__slide'));
    const btnPrev = slider.querySelector('.slider__btn--prev');
    const btnNext = slider.querySelector('.slider__btn--next');
    const dots = Array.from(slider.querySelectorAll('.slider__dot'));

    if (slides.length === 0) return;

    let currentIndex = 0;
    const totalSlides = slides.length;

    const getSlideWidth = () => {
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      return slides[0].offsetWidth + gap;
    };

    const getVisibleSlides = () => {
      const viewport = slider.querySelector('.slider__viewport');
      const viewportWidth = viewport.clientWidth;

      const getElementWidth = (el) => {
        if (!el) return 0;
        const style = getComputedStyle(el);
        return el.offsetWidth + (parseFloat(style.marginLeft) || 0) + (parseFloat(style.marginRight) || 0);
      };

      const viewportGap = parseFloat(getComputedStyle(viewport).gap) || 0;
      const totalButtonsWidth = getElementWidth(btnPrev) + getElementWidth(btnNext);
      const totalGaps = 2 * viewportGap;

      const availableWidth = viewportWidth - totalButtonsWidth - totalGaps;
      const slideWidth = getSlideWidth();

      return slideWidth > 0 ? Math.max(1, Math.round(availableWidth / slideWidth)) : 1;
    };

    const updateSlider = () => {
      const visibleSlides = getVisibleSlides();
      const maxIndex = Math.max(0, totalSlides - visibleSlides);
      currentIndex = Math.max(0, Math.min(currentIndex, maxIndex));

      track.style.transform = `translateX(-${currentIndex * getSlideWidth()}px)`;

      dots.forEach((dot, index) => {
        dot.classList.toggle('slider__dot--active', index === currentIndex);
      });

			if (btnPrev) {
				btnPrev.removeAttribute('disabled');
				btnPrev.setAttribute('aria-disabled', currentIndex === 0 ? 'true' : 'false');
			}
			if (btnNext) {
				btnNext.removeAttribute('disabled');
				btnNext.setAttribute('aria-disabled', currentIndex >= maxIndex ? 'true' : 'false');
			}
    };

    btnPrev.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateSlider();
      }
    });

    btnNext.addEventListener('click', () => {
      const maxIndex = Math.max(0, totalSlides - getVisibleSlides());
      if (currentIndex < maxIndex) {
        currentIndex++;
        updateSlider();
      }
    });

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        const slideIndex = parseInt(dot.getAttribute('data-slide'), 10);
        if (!isNaN(slideIndex) && slideIndex >= 0 && slideIndex < totalSlides) {
          currentIndex = slideIndex;
          updateSlider();
        }
      });
    });

    let touchStartX = 0;
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const threshold = 50;
      const diff = touchStartX - touchEndX;
      const maxIndex = Math.max(0, totalSlides - getVisibleSlides());

      if (diff > threshold && currentIndex < maxIndex) {
        currentIndex++;
        updateSlider();
      } else if (diff < -threshold && currentIndex > 0) {
        currentIndex--;
        updateSlider();
      }
    }, { passive: true });

    window.addEventListener('resize', updateSlider);
    updateSlider();
  };

  const initFaq = () => {
    document.querySelectorAll('.faq__item').forEach(item => {
      const question = item.querySelector('.faq__question');
      const icon = item.querySelector('.faq__question-icon');
      if (!question || !icon) return;

      question.addEventListener('click', () => {
        const isExpanded = item.classList.toggle('faq__item--expanded');
        question.setAttribute('aria-expanded', isExpanded);
        icon.textContent = isExpanded ? '−' : '+';
      });
    });
  };

  const initForm = () => {
    const form = document.getElementById('booking-form');
    if (!form) return;

    const phoneInput = form.querySelector('#phone');
    const emailInput = form.querySelector('#email');

    const showError = (input, message) => {
      const errorEl = input?.parentElement.querySelector('.booking__error');
      if (errorEl) errorEl.textContent = message;
    };

    const clearError = (input) => showError(input, '');

    if (phoneInput) {
      phoneInput.addEventListener('input', (e) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 11);
        let formatted = '+7';
        if (value.length > 1) formatted += ` (${value.slice(1, 4)}`;
        if (value.length >= 4) formatted += `) ${value.slice(4, 7)}`;
        if (value.length >= 7) formatted += `-${value.slice(7, 9)}`;
        if (value.length >= 9) formatted += `-${value.slice(9, 11)}`;
        e.target.value = formatted;
        clearError(phoneInput);
      });
    }

    const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

    if (emailInput) {
      emailInput.addEventListener('blur', () => {
        const value = emailInput.value.trim();
        showError(emailInput, value && !isValidEmail(value) ? 'Введите корректный email' : '');
      });
      emailInput.addEventListener('input', () => clearError(emailInput));
    }

    form.querySelectorAll('.booking__input').forEach(input => {
      input.addEventListener('input', () => clearError(input));
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      form.querySelectorAll('.booking__error').forEach(el => el.textContent = '');

      let isValid = true;

      const requiredFields = [
        { id: 'first-name', message: 'Введите имя' },
        { id: 'last-name', message: 'Введите фамилию' },
        { id: 'email', message: 'Введите email' },
        { id: 'phone', message: 'Введите телефон' }
      ];

      requiredFields.forEach(({ id, message }) => {
        const input = form.querySelector(`#${id}`);
        if (!input?.value.trim()) {
          showError(input, message);
          isValid = false;
        }
      });

      if (emailInput?.value.trim() && !isValidEmail(emailInput.value.trim())) {
        showError(emailInput, 'Введите корректный email');
        isValid = false;
      }

      if (phoneInput && phoneInput.value.replace(/\D/g, '').length < 11) {
        showError(phoneInput, 'Введите полный номер телефона');
        isValid = false;
      }

      if (isValid) {
        openModal();
        form.reset();
      }
    });
  };

  const initModal = () => {
    const modal = document.getElementById('success-modal');
    if (!modal) return;

    const openModal = () => {
      modal.classList.add('modal--open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
      modal.classList.remove('modal--open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    modal.querySelector('.modal__close')?.addEventListener('click', closeModal);
    modal.querySelector('.modal__overlay')?.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    window.openModal = openModal;
  };

  initSlider();
  initFaq();
  initForm();
  initModal();
});