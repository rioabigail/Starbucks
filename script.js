const navToggle = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.primary-nav');

if (navToggle && navigation) {
  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
    navigation.classList.toggle('open', !isOpen);
  });
}

const bagCountElements = document.querySelectorAll('.bag-count');

function getBagCount() {
  const count = Number.parseInt(localStorage.getItem('starbucks-bag-count') || '0', 10);
  return Number.isFinite(count) && count >= 0 ? count : 0;
}

function updateBagCount(count) {
  localStorage.setItem('starbucks-bag-count', String(count));
  bagCountElements.forEach((element) => {
    element.textContent = String(count);
  });
}

updateBagCount(getBagCount());

const menuCards = [...document.querySelectorAll('.menu-card')];
const searchInput = document.querySelector('#menu-search');
const filterButtons = document.querySelectorAll('.filter-button');
const resultLabel = document.querySelector('#menu-result');
const emptyMessage = document.querySelector('#no-results');
let selectedCategory = 'all';

function filterMenu() {
  const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
  let visibleCount = 0;

  menuCards.forEach((card) => {
    const matchesCategory = selectedCategory === 'all' || card.dataset.category === selectedCategory;
    const matchesSearch = (card.dataset.name || '').includes(query);
    const isVisible = matchesCategory && matchesSearch;
    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  if (resultLabel) {
    resultLabel.textContent = query || selectedCategory !== 'all'
      ? `Showing ${visibleCount} ${visibleCount === 1 ? 'favorite' : 'favorites'}`
      : 'Showing all favorites';
  }
  if (emptyMessage) emptyMessage.hidden = visibleCount !== 0;
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    selectedCategory = button.dataset.filter || 'all';
    filterButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle('active', isActive);
      item.setAttribute('aria-pressed', String(isActive));
    });
    filterMenu();
  });
});

if (searchInput) searchInput.addEventListener('input', filterMenu);

let toastTimer;
const cartToast = document.querySelector('#cart-toast');

document.querySelectorAll('.add-button').forEach((button) => {
  button.addEventListener('click', () => {
    const product = button.dataset.product || 'Item';
    const count = getBagCount() + 1;
    updateBagCount(count);
    if (cartToast) {
      cartToast.textContent = `${product} added to your bag · ${count} ${count === 1 ? 'item' : 'items'} total`;
      cartToast.classList.add('show');
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(() => cartToast.classList.remove('show'), 2600);
    }
  });
});

const contactForm = document.querySelector('#contact-form');

if (contactForm) {
  const fields = {
    name: { input: contactForm.elements.namedItem('name'), error: document.querySelector('#name-error'), message: 'Please enter at least 2 characters for your name.' },
    email: { input: contactForm.elements.namedItem('email'), error: document.querySelector('#email-error'), message: 'Please enter a valid email address.' },
    topic: { input: contactForm.elements.namedItem('topic'), error: document.querySelector('#topic-error'), message: 'Please choose a topic.' },
    message: { input: contactForm.elements.namedItem('message'), error: document.querySelector('#message-error'), message: 'Please enter a message of at least 10 characters.' }
  };
  const successMessage = document.querySelector('#form-success');

  function validateField(field) {
    const isValid = field.input.checkValidity();
    field.input.setAttribute('aria-invalid', String(!isValid));
    field.error.textContent = isValid ? '' : field.message;
    return isValid;
  }

  Object.values(fields).forEach(({ input, error }) => {
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') {
        const field = Object.values(fields).find((item) => item.input === input);
        if (field) validateField(field);
      }
      error.textContent = input.checkValidity() ? '' : error.textContent;
    });
    input.addEventListener('change', () => {
      if (input.getAttribute('aria-invalid') === 'true') {
        const field = Object.values(fields).find((item) => item.input === input);
        if (field) validateField(field);
      }
    });
  });

  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const isValid = Object.values(fields).map(validateField).every(Boolean);
    if (!isValid) {
      contactForm.querySelector('[aria-invalid="true"]')?.focus();
      successMessage.hidden = true;
      return;
    }
    contactForm.reset();
    Object.values(fields).forEach(({ input }) => input.removeAttribute('aria-invalid'));
    successMessage.hidden = false;
    successMessage.focus?.();
  });
}
