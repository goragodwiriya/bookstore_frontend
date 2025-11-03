// BookStore E-commerce Application
// Main application logic for bookstore functionality

// Global variables
let books = [];
let cart = [];
let categories = [];
let currentFilter = {category: '', sort: 'title'};

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  loadBooks();
  loadCategories();
  loadCart();
  initializeEventListeners();
  updateCartCount();
});

// Load books from API
async function loadBooks() {
  try {
    const response = await fetch('../api/books');
    const data = await response.json();
    if (data && data.success) {
      books = data.data;
      displayFeaturedBooks();
      displayAllBooks();

      return;
    }
  } catch (error) {
    console.error('Error loading books:', error);
  }
  showToast('Failed to load books. Please try again.', 'error');
}

// Load categories from API and render into the categories section
async function loadCategories() {
  try {
    const response = await fetch('../api/categories');
    const data = await response.json();
    if (data && data.success) {
      categories = data.data;

      const grid = document.querySelector('.categories-grid');
      if (grid) {
        grid.innerHTML = categories.map(cat => createCategoryCard(cat)).join('');
      }

      // Populate category filter select
      const categoryFilter = document.getElementById('categoryFilter');
      if (categoryFilter) {
        // remove existing dynamic options (keep the first 'All Categories' option)
        categoryFilter.querySelectorAll('option.dynamic').forEach(o => o.remove());
        categories.forEach(cat => {
          const opt = document.createElement('option');
          opt.value = cat.name;
          opt.textContent = cat.name;
          opt.classList.add('dynamic');
          categoryFilter.appendChild(opt);
        });
      }

      return;
    }
  } catch (error) {
    console.error('Error loading categories:', error);
  }
  showToast('Failed to load categories. Please try again.', 'error');
}

// Create category card HTML from API data
function createCategoryCard(cat) {
  // Use the API-provided icon class when available
  const iconClass = cat.icon || 'fas fa-folder-open';
  // data-category uses the category name so filtering matches book.category values
  return `
    <div class="category-card" data-category="${escapeHtml(cat.name)}">
      <i class="${iconClass}"></i>
      <h3>${escapeHtml(cat.name)}</h3>
    </div>
  `;
}

// Simple escape to avoid injecting raw HTML from API
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Load cart from localStorage
function loadCart() {
  const savedCart = localStorage.getItem('bookstore_cart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem('bookstore_cart', JSON.stringify(cart));
  updateCartCount();
}

// Initialize event listeners
function initializeEventListeners() {
  // Search functionality
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
  }

  // Category filter
  const categoryFilter = document.getElementById('categoryFilter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', handleFilter);
  }

  // Sort filter
  const sortFilter = document.getElementById('sortFilter');
  if (sortFilter) {
    sortFilter.addEventListener('change', handleFilter);
  }

  // Category cards - use event delegation so dynamically-loaded cards work
  const categoriesGrid = document.querySelector('.categories-grid');
  if (categoriesGrid) {
    categoriesGrid.addEventListener('click', function(e) {
      const card = e.target.closest('.category-card');
      if (!card) return;
      const category = card.dataset.category;
      const categoryFilterEl = document.getElementById('categoryFilter');
      if (categoryFilterEl) {
        categoryFilterEl.value = category;
      }
      handleFilter();
      scrollToSection('all-books');
    });
  }

  // Checkout form
  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', handleCheckout);
  }

  // Payment method toggle
  const paymentRadios = document.querySelectorAll('input[name="payment"]');
  paymentRadios.forEach(radio => {
    radio.addEventListener('change', togglePaymentMethod);
  });

  // Format card number input
  const cardNumber = document.getElementById('cardNumber');
  if (cardNumber) {
    cardNumber.addEventListener('input', formatCardNumber);
  }

  // Format expiry date
  const expiry = document.getElementById('expiry');
  if (expiry) {
    expiry.addEventListener('input', formatExpiry);
  }

  // CVV input
  const cvv = document.getElementById('cvv');
  if (cvv) {
    cvv.addEventListener('input', function(e) {
      e.target.value = e.target.value.replace(/\D/g, '');
    });
  }
}

// Display featured books
function displayFeaturedBooks() {
  const container = document.getElementById('featuredBooks');
  if (!container) return;

  const featuredBooks = books.filter(book => book.featured).slice(0, 6);
  container.innerHTML = featuredBooks.map(book => createBookCard(book)).join('');
}

// Display all books
function displayAllBooks() {
  const container = document.getElementById('allBooks');
  if (!container) return;

  let filteredBooks = [...books];

  // Apply category filter
  if (currentFilter.category) {
    filteredBooks = filteredBooks.filter(book => book.category === currentFilter.category);
  }

  // Apply sorting
  switch (currentFilter.sort) {
    case 'price-low':
      filteredBooks.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filteredBooks.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      filteredBooks.sort((a, b) => b.rating - a.rating);
      break;
    default:
      filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
  }

  container.innerHTML = filteredBooks.map(book => createBookCard(book)).join('');
}

// Create book card HTML
function createBookCard(book) {
  const isInCart = cart.some(item => item.id === book.id);
  return `
        <div class="book-card">
            <div class="book-image">
                <img src="${book.cover}" alt="${book.title}">
                <div class="book-overlay">
                    <button class="quick-view-btn" onclick="quickView(${book.id})">
                        <i class="fas fa-eye"></i> Quick View
                    </button>
                </div>
            </div>
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">by ${book.author}</p>
                <div class="book-rating">
                    ${generateStars(book.rating)}
                    <span>(${book.reviews})</span>
                </div>
                <div class="book-price">
                    <span class="current-price">$${book.price.toFixed(2)}</span>
                    ${book.originalPrice ? `<span class="original-price">$${book.originalPrice.toFixed(2)}</span>` : ''}
                </div>
                <button class="add-to-cart-btn ${isInCart ? 'in-cart' : ''}"
                        onclick="toggleCart(${book.id})"
                        ${isInCart ? 'disabled' : ''}>
                    ${isInCart ? '<i class="fas fa-check"></i> In Cart' : '<i class="fas fa-cart-plus"></i> Add to Cart'}
                </button>
            </div>
        </div>
    `;
}

// Generate star rating HTML
function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;

  let stars = '';
  for (let i = 0; i < fullStars; i++) {
    stars += '<i class="fas fa-star"></i>';
  }
  if (halfStar) {
    stars += '<i class="fas fa-star-half-alt"></i>';
  }
  for (let i = 0; i < emptyStars; i++) {
    stars += '<i class="far fa-star"></i>';
  }
  return stars;
}

// Toggle item in cart
function toggleCart(bookId) {
  const book = books.find(b => b.id === bookId);
  if (!book) return;

  const existingItem = cart.find(item => item.id === bookId);

  if (existingItem) {
    // Remove from cart
    cart = cart.filter(item => item.id !== bookId);
    showToast(`${book.title} removed from cart`);
  } else {
    // Add to cart
    cart.push({
      ...book,
      quantity: 1
    });
    showToast(`${book.title} added to cart!`);
  }

  saveCart();

  // Refresh display if on cart page
  if (window.location.pathname.includes('cart.html')) {
    displayCartItems();
  } else {
    displayAllBooks();
  }
}

// Display cart items
function displayCartItems() {
  const container = document.getElementById('cartItems');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Your cart is empty</h3>
                <p>Looks like you haven't added any books yet</p>
                <a href="index.html" class="shop-now-btn">Shop Now</a>
            </div>
        `;
  } else {
    container.innerHTML = cart.map(item => createCartItem(item)).join('');
  }

  updateCartSummary();
}

// Create cart item HTML
function createCartItem(item) {
  return `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.cover}" alt="${item.title}">
            </div>
            <div class="cart-item-details">
                <h3>${item.title}</h3>
                <p>by ${item.author}</p>
                <div class="cart-item-price">
                    $${item.price.toFixed(2)}
                </div>
            </div>
            <div class="cart-item-quantity">
                <button onclick="updateQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
            <div class="cart-item-total">
                $${(item.price * item.quantity).toFixed(2)}
            </div>
            <button class="remove-item" onclick="removeFromCart(${item.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
}

// Update item quantity
function updateQuantity(bookId, change) {
  const item = cart.find(item => item.id === bookId);
  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    removeFromCart(bookId);
  } else {
    saveCart();
    displayCartItems();
  }
}

// Remove item from cart
function removeFromCart(bookId) {
  const book = cart.find(item => item.id === bookId);
  cart = cart.filter(item => item.id !== bookId);
  saveCart();
  displayCartItems();
  showToast(`${book.title} removed from cart`);
}

// Update cart summary
function updateCartSummary() {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = cart.length > 0 ? 5 : 0;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  updateElement('subtotal', `$${subtotal.toFixed(2)}`);
  updateElement('shipping', `$${shipping.toFixed(2)}`);
  updateElement('tax', `$${tax.toFixed(2)}`);
  updateElement('total', `$${total.toFixed(2)}`);
  const totalPrice = total.toFixed(2);
  updateElement('qrAmount', totalPrice);

  // Update QR code image
  const qrCode = document.getElementById('qrCode');
  if (qrCode) {
    qrCode.src = `https://promptpay.io/0868142004/${totalPrice}.png`;
  }

  // Update order items in checkout
  const orderItems = document.getElementById('orderItems');
  if (orderItems) {
    orderItems.innerHTML = cart.map(item => `
            <div class="order-item">
                <img src="${item.cover}" alt="${item.title}">
                <div class="order-item-details">
                    <h4>${item.title}</h4>
                    <p>Qty: ${item.quantity} × $${item.price.toFixed(2)}</p>
                </div>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');
  }
}

// Update cart count
function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  updateElement('cartCount', count.toString());
}

// Handle search
function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase();
  const bookCards = document.querySelectorAll('.book-card');

  bookCards.forEach(card => {
    const title = card.querySelector('.book-title').textContent.toLowerCase();
    const author = card.querySelector('.book-author').textContent.toLowerCase();

    if (title.includes(searchTerm) || author.includes(searchTerm)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// Handle filter
function handleFilter() {
  currentFilter.category = document.getElementById('categoryFilter').value;
  currentFilter.sort = document.getElementById('sortFilter').value;
  displayAllBooks();
}

// Toggle payment method
function togglePaymentMethod(e) {
  const cardPayment = document.getElementById('cardPayment');
  const qrPayment = document.getElementById('qrPayment');

  if (e.target.value === 'card') {
    cardPayment.style.display = 'block';
    qrPayment.style.display = 'none';
  } else {
    cardPayment.style.display = 'none';
    qrPayment.style.display = 'block';
  }
}

// Format card number
function formatCardNumber(e) {
  let value = e.target.value.replace(/\s/g, '');
  let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
  e.target.value = formattedValue;
}

// Format expiry date
function formatExpiry(e) {
  let value = e.target.value.replace(/\D/g, '');
  if (value.length >= 2) {
    value = value.slice(0, 2) + '/' + value.slice(2, 4);
  }
  e.target.value = value;
}

// Handle checkout
function handleCheckout(e) {
  e.preventDefault();

  // Validate form
  if (!validateCheckoutForm()) {
    return;
  }

  // Simulate payment processing
  const submitBtn = e.target.querySelector('.place-order-btn');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

  setTimeout(() => {
    // Generate order ID
    const orderId = 'ORD' + Date.now();

    // Show success modal
    document.getElementById('orderId').textContent = orderId;
    document.getElementById('successModal').style.display = 'flex';

    // Clear cart
    cart = [];
    saveCart();

    // Reset button
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Place Order <i class="fas fa-lock"></i>';
  }, 2000);
}

// Validate checkout form
function validateCheckoutForm() {
  const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'zipCode'];

  for (const field of requiredFields) {
    const input = document.getElementById(field);
    if (!input.value.trim()) {
      input.focus();
      showToast(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`, 'error');
      return false;
    }
  }

  const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

  if (paymentMethod === 'card') {
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const expiry = document.getElementById('expiry').value;
    const cvv = document.getElementById('cvv').value;

    if (cardNumber.length < 13 || cardNumber.length > 19) {
      showToast('Please enter a valid card number', 'error');
      return false;
    }

    if (!expiry.match(/^\d{2}\/\d{2}$/)) {
      showToast('Please enter a valid expiry date', 'error');
      return false;
    }

    if (cvv.length < 3 || cvv.length > 4) {
      showToast('Please enter a valid CVV', 'error');
      return false;
    }
  }

  return true;
}

// Close modal
function closeModal() {
  document.getElementById('successModal').style.display = 'none';
  window.location.href = 'index.html';
}

// Proceed to checkout
function proceedToCheckout() {
  if (cart.length === 0) {
    showToast('Your cart is empty', 'error');
    return;
  }
  window.location.href = 'checkout.html';
}

// Quick view (placeholder)
function quickView(bookId) {
  const book = books.find(b => b.id === bookId);
  showToast(`Quick view: ${book.title}`);
}

// Show toast notification
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');

  toastMessage.textContent = message;
  toast.className = `toast ${type}`;
  toast.style.display = 'flex';

  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}

// Helper function to update element
function updateElement(id, content) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = content;
  }
}

// Helper function to scroll to section
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({behavior: 'smooth'});
  }
}

// Initialize cart page
if (window.location.pathname.includes('cart.html')) {
  document.addEventListener('DOMContentLoaded', function() {
    displayCartItems();
  });
}

// Initialize checkout page
if (window.location.pathname.includes('checkout.html')) {
  document.addEventListener('DOMContentLoaded', function() {
    if (cart.length === 0) {
      window.location.href = 'cart.html';
    } else {
      updateCartSummary();
    }
  });
}