/**
 * Bibliophile Bookstore Application
 * A complete e-commerce bookstore with cart functionality
 * Author: MiniMax Agent
 */

class BookstoreApp {
  constructor() {
    this.books = [];
    this.filteredBooks = [];
    this.cart = [];
    this.currentPage = this.getCurrentPage();

    // Initialize the application
    this.init();
  }

  /**
   * Initialize the application
   */
  init() {
    this.loadCart();
    this.updateCartUI();

    // Determine current page and initialize accordingly
    switch (this.currentPage) {
      case 'index':
        this.initHomePage();
        break;
      case 'cart':
        this.initCartPage();
        break;
      case 'checkout':
        this.initCheckoutPage();
        break;
    }
  }

  /**
   * Get current page name from URL
   */
  getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('cart.html')) return 'cart';
    if (path.includes('checkout.html')) return 'checkout';
    return 'index';
  }

  /**
   * Initialize homepage functionality
   */
  async initHomePage() {
    try {
      await this.loadBooks();
      // load categories for the category filter dropdown
      await this.loadCategories();
      this.setupEventListeners();
      this.displayBooks(this.books);
      this.hideLoading();
    } catch (error) {
      console.error('Error initializing home page:', error);
      this.showError('Failed to load books. Please refresh the page.');
    }
  }

  /**
   * Initialize cart page functionality
   */
  async initCartPage() {
    try {
      await this.loadBooks();
      // ensure categories are loaded in case the UI shows the filter
      await this.loadCategories();
      this.setupCartEventListeners();
      this.displayCartItems();
      this.updateCartSummary();
      this.hideLoading();

      // Show empty cart if no items
      if (this.cart.length === 0) {
        this.showEmptyCart();
      }
    } catch (error) {
      console.error('Error initializing cart page:', error);
      this.showError('Failed to load cart. Please refresh the page.');
    }
  }

  /**
   * Initialize checkout page functionality
   */
  async initCheckoutPage() {
    try {
      await this.loadBooks();
      // ensure categories available on checkout page if needed
      await this.loadCategories();
      this.setupCheckoutEventListeners();

      // Redirect to cart if empty
      if (this.cart.length === 0) {
        this.showNoItems();
        return;
      }

      this.displayOrderSummary();
      this.updateCheckoutTotal();
      this.hideLoading();
    } catch (error) {
      console.error('Error initializing checkout page:', error);
      this.showError('Failed to load checkout. Please refresh the page.');
    }
  }

  /**
   * Load books from JSON file
   */
  async loadBooks() {
    try {
      const response = await fetch('../api/books');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.success) {
        this.books = data.data;
        this.filteredBooks = [...this.books];
      }
    } catch (error) {
      console.error('Error loading books:', error);
      throw error;
    }
  }

  /**
   * Load categories from API and populate category select
   */
  async loadCategories() {
    try {
      const response = await fetch('../api/categories');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.success && Array.isArray(data.data)) {
        const categoryFilter = document.getElementById('categoryFilter');
        if (!categoryFilter) return;

        // Reset to only the default
        categoryFilter.innerHTML = '<option value="">All Categories</option>';

        // Populate categories from API (display book count for clarity)
        data.data.forEach(cat => {
          try {
            const opt = document.createElement('option');
            opt.value = cat.name;
            opt.textContent = `${cat.name} (${cat.book_count || 0})`;
            categoryFilter.appendChild(opt);
          } catch (e) {
            // skip malformed category entries
          }
        });
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fail silently; UI will still work with default option
    }
  }

  /**
   * Load cart from localStorage
   */
  loadCart() {
    const savedCart = localStorage.getItem('bibliophile_cart');
    if (savedCart) {
      try {
        this.cart = JSON.parse(savedCart);
      } catch (error) {
        console.error('Error parsing saved cart:', error);
        this.cart = [];
        this.saveCart();
      }
    }
  }

  /**
   * Save cart to localStorage
   */
  saveCart() {
    try {
      localStorage.setItem('bibliophile_cart', JSON.stringify(this.cart));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }

  /**
   * Update cart count in UI
   */
  updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
      const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
      cartCount.textContent = totalItems;
      cartCount.style.display = totalItems > 0 ? 'block' : 'none';
    }
  }

  /**
   * Setup event listeners for home page
   */
  setupEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.handleSearch(e.target.value);
      });
    }

    // Filter functionality
    const categoryFilter = document.getElementById('categoryFilter');
    const priceFilter = document.getElementById('priceFilter');
    const clearFilters = document.getElementById('clearFilters');

    if (categoryFilter) {
      categoryFilter.addEventListener('change', () => this.applyFilters());
    }

    if (priceFilter) {
      priceFilter.addEventListener('change', () => this.applyFilters());
    }

    if (clearFilters) {
      clearFilters.addEventListener('click', () => this.clearAllFilters());
    }

    // Cart button
    const cartButton = document.getElementById('cartButton');
    if (cartButton) {
      cartButton.addEventListener('click', () => {
        window.location.href = 'cart.html';
      });
    }
  }

  /**
   * Setup event listeners for cart page
   */
  setupCartEventListeners() {
    // Cart button
    const cartButton = document.getElementById('cartButton');
    if (cartButton) {
      cartButton.addEventListener('click', () => {
        window.location.href = 'cart.html';
      });
    }

    // Checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        window.location.href = 'checkout.html';
      });
    }
  }

  /**
   * Setup event listeners for checkout page
   */
  setupCheckoutEventListeners() {
    // Cart button
    const cartButton = document.getElementById('cartButton');
    if (cartButton) {
      cartButton.addEventListener('click', () => {
        window.location.href = 'cart.html';
      });
    }

    // Payment method toggle
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    paymentMethods.forEach(method => {
      method.addEventListener('change', (e) => {
        this.togglePaymentFields(e.target.value);
      });
    });

    // Checkout form
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleCheckout(e);
      });
    }
  }

  /**
   * Handle search functionality
   */
  handleSearch(query) {
    if (!query.trim()) {
      this.filteredBooks = [...this.books];
    } else {
      const searchTerm = query.toLowerCase();
      this.filteredBooks = this.books.filter(book =>
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm)
      );
    }
    this.applyFilters();
  }

  /**
   * Apply filters to books
   */
  applyFilters() {
    let filtered = [...this.filteredBooks];

    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter && categoryFilter.value) {
      const selected = categoryFilter.value.trim().toLowerCase();
      if (selected) {
        filtered = filtered.filter(book => ((book.category || '').toString().toLowerCase() === selected));
      }
    }

    // Price filter
    const priceFilter = document.getElementById('priceFilter');
    if (priceFilter && priceFilter.value) {
      const [min, max] = priceFilter.value.split('-').map(Number);
      filtered = filtered.filter(book => {
        if (max) {
          return book.price >= min && book.price <= max;
        } else {
          return book.price >= min;
        }
      });
    }

    this.displayBooks(filtered);
  }

  /**
   * Clear all filters
   */
  clearAllFilters() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const priceFilter = document.getElementById('priceFilter');

    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = '';
    if (priceFilter) priceFilter.value = '';

    this.filteredBooks = [...this.books];
    this.displayBooks(this.books);
  }

  /**
   * Display books in grid
   */
  displayBooks(books) {
    const booksGrid = document.getElementById('booksGrid');
    const noResults = document.getElementById('noResults');

    if (!booksGrid) return;

    if (books.length === 0) {
      booksGrid.innerHTML = '';
      if (noResults) noResults.style.display = 'block';
      return;
    }

    if (noResults) noResults.style.display = 'none';

    booksGrid.innerHTML = books.map(book => `
            <div class="book-card" onclick="App.showBookDetails(${book.id})">
                <img src="${book.cover}" alt="${book.title}" class="book-cover" loading="lazy">
                <div class="book-info">
                    <h3 class="book-title">${this.escapeHtml(book.title)}</h3>
                    <p class="book-author">by ${this.escapeHtml(book.author)}</p>
                    <p class="book-description">${this.escapeHtml(book.description)}</p>
                    <div class="book-footer">
                        <span class="book-price">$${book.price.toFixed(2)}</span>
                        <span class="category-tag">${this.escapeHtml(book.category)}</span>
                    </div>
                    <button class="add-to-cart-btn" onclick="event.stopPropagation(); App.addToCart(${book.id})"
                            ${this.isInCart(book.id) ? 'disabled' : ''}>
                        ${this.isInCart(book.id) ? 'Added to Cart' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        `).join('');
  }

  /**
   * Add book to cart
   */
  addToCart(bookId) {
    const book = this.books.find(b => b.id === bookId);
    if (!book) return;

    const existingItem = this.cart.find(item => item.id === bookId);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cart.push({
        id: bookId,
        quantity: 1,
        book: book
      });
    }

    this.saveCart();
    this.updateCartUI();
    this.showAddToCartSuccess(book.title);

    // Update the button state
    this.updateAddToCartButton(bookId);
  }

  /**
   * Remove item from cart
   */
  removeFromCart(bookId) {
    this.cart = this.cart.filter(item => item.id !== bookId);
    this.saveCart();
    this.updateCartUI();
    this.displayCartItems();
    this.updateCartSummary();
  }

  /**
   * Update item quantity in cart
   */
  updateQuantity(bookId, quantity) {
    if (quantity <= 0) {
      this.removeFromCart(bookId);
      return;
    }

    const item = this.cart.find(item => item.id === bookId);
    if (item) {
      item.quantity = quantity;
      this.saveCart();
      this.updateCartUI();
      this.updateCartSummary();
    }
  }

  /**
   * Check if book is in cart
   */
  isInCart(bookId) {
    return this.cart.some(item => item.id === bookId);
  }

  /**
   * Update add to cart button state
   */
  updateAddToCartButton(bookId) {
    const buttons = document.querySelectorAll(`button[onclick="App.addToCart(${bookId})"]`);
    buttons.forEach(button => {
      if (this.isInCart(bookId)) {
        button.textContent = 'Added to Cart';
        button.disabled = true;
      } else {
        button.textContent = 'Add to Cart';
        button.disabled = false;
      }
    });
  }

  /**
   * Display cart items
   */
  displayCartItems() {
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    if (!cartItemsContainer) return;

    if (this.cart.length === 0) {
      cartItemsContainer.innerHTML = '';
      return;
    }

    cartItemsContainer.innerHTML = this.cart.map(item => `
            <div class="cart-item">
                <img src="${item.book.cover}" alt="${item.book.title}" class="cart-item-image">
                <div class="cart-item-info">
                    <h3 class="cart-item-title">${this.escapeHtml(item.book.title)}</h3>
                    <p class="cart-item-author">by ${this.escapeHtml(item.book.author)}</p>
                    <p class="book-price">$${item.book.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="App.updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn" onclick="App.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                    <p class="cart-item-total">$${(item.book.price * item.quantity).toFixed(2)}</p>
                    <button class="remove-btn" onclick="App.removeFromCart(${item.id})" title="Remove from cart">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="M19 6v14a2 2 0 0,1-2 2H7a2 2 0 0,1-2-2V6m3 0V4a2 2 0 0,1 2-2h4a2 2 0 0,1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
  }

  /**
   * Update cart summary
   */
  updateCartSummary() {
    const subtotal = document.getElementById('subtotal');
    const tax = document.getElementById('tax');
    const total = document.getElementById('total');
    const checkoutBtn = document.getElementById('checkoutBtn');

    const cartTotal = this.cart.reduce((sum, item) => sum + (item.book.price * item.quantity), 0);
    const taxAmount = cartTotal * 0.08; // 8% tax
    const finalTotal = cartTotal + taxAmount;

    if (subtotal) subtotal.textContent = `$${cartTotal.toFixed(2)}`;
    if (tax) tax.textContent = `$${taxAmount.toFixed(2)}`;
    if (total) total.textContent = `$${finalTotal.toFixed(2)}`;

    if (checkoutBtn) {
      checkoutBtn.disabled = this.cart.length === 0;
    }
  }

  /**
   * Display order summary on checkout page
   */
  displayOrderSummary() {
    const orderItems = document.getElementById('orderItems');
    if (!orderItems) return;

    orderItems.innerHTML = this.cart.map(item => `
            <div class="order-item">
                <span>${this.escapeHtml(item.book.title)} (${item.quantity}x)</span>
                <span>$${(item.book.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');
  }

  /**
   * Update checkout page totals
   */
  updateCheckoutTotal() {
    const subtotal = document.getElementById('orderSubtotal');
    const tax = document.getElementById('orderTax');
    const total = document.getElementById('orderTotal');
    const totalDisplay = document.getElementById('orderTotalDisplay');

    const cartTotal = this.cart.reduce((sum, item) => sum + (item.book.price * item.quantity), 0);
    const taxAmount = cartTotal * 0.08;
    const finalTotal = cartTotal + taxAmount;

    if (subtotal) subtotal.textContent = `$${cartTotal.toFixed(2)}`;
    if (tax) tax.textContent = `$${taxAmount.toFixed(2)}`;
    if (total) total.textContent = `$${finalTotal.toFixed(2)}`;
    if (totalDisplay) totalDisplay.textContent = `$${finalTotal.toFixed(2)}`;
  }

  /**
   * Toggle payment method fields
   */
  togglePaymentFields(method) {
    const creditCardFields = document.getElementById('creditCardFields');
    const paypalFields = document.getElementById('paypalFields');

    if (method === 'creditCard') {
      if (creditCardFields) creditCardFields.style.display = 'block';
      if (paypalFields) paypalFields.style.display = 'none';
    } else {
      if (creditCardFields) creditCardFields.style.display = 'none';
      if (paypalFields) paypalFields.style.display = 'block';
    }
  }

  /**
   * Handle checkout form submission
   */
  async handleCheckout(event) {
    event.preventDefault();

    if (this.cart.length === 0) {
      this.showError('Your cart is empty.');
      return;
    }

    const formData = new FormData(event.target);
    const orderData = {
      email: formData.get('email'),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      address: formData.get('address'),
      city: formData.get('city'),
      state: formData.get('state'),
      zipCode: formData.get('zipCode'),
      paymentMethod: formData.get('paymentMethod'),
      items: this.cart,
      total: this.cart.reduce((sum, item) => sum + (item.book.price * item.quantity), 0)
    };

    // Show loading state
    this.showLoading('Processing your order...');

    try {
      // Simulate payment processing delay
      await this.delay(2000);

      // Generate order number
      const orderNumber = 'ORD-' + Date.now().toString().slice(-8);

      // Clear cart
      this.cart = [];
      this.saveCart();
      this.updateCartUI();

      // Show success modal
      this.showOrderConfirmation(orderNumber, orderData.total);

    } catch (error) {
      console.error('Checkout error:', error);
      this.showError('Payment failed. Please try again.');
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Show order confirmation modal
   */
  showOrderConfirmation(orderNumber, total) {
    const modal = document.getElementById('orderConfirmation');
    const orderNumberEl = document.getElementById('orderNumber');
    const finalTotalEl = document.getElementById('finalTotal');

    if (orderNumberEl) orderNumberEl.textContent = orderNumber;
    if (finalTotalEl) finalTotalEl.textContent = `$${total.toFixed(2)}`;
    if (modal) modal.style.display = 'flex';
  }

  /**
   * Close order confirmation modal
   */
  closeOrderConfirmation() {
    const modal = document.getElementById('orderConfirmation');
    if (modal) {
      modal.style.display = 'none';
    }

    // Redirect to homepage
    window.location.href = 'index.html';
  }

  /**
   * Show empty cart state
   */
  showEmptyCart() {
    const cartLayout = document.querySelector('.cart-layout');
    const emptyCart = document.getElementById('emptyCart');

    if (cartLayout) cartLayout.style.display = 'none';
    if (emptyCart) emptyCart.style.display = 'block';
  }

  /**
   * Show no items state on checkout
   */
  showNoItems() {
    const checkoutLayout = document.querySelector('.checkout-layout');
    const noItems = document.getElementById('noItems');

    if (checkoutLayout) checkoutLayout.style.display = 'none';
    if (noItems) noItems.style.display = 'block';
  }

  /**
   * Show success message when adding to cart
   */
  showAddToCartSuccess(bookTitle) {
    // Create temporary success message
    const message = document.createElement('div');
    message.className = 'success-message';
    message.textContent = `"${bookTitle}" added to cart!`;
    message.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--success);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            font-weight: 500;
            animation: slideIn 0.3s ease-out;
        `;

    document.body.appendChild(message);

    setTimeout(() => {
      message.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        document.body.removeChild(message);
      }, 300);
    }, 2000);
  }

  /**
   * Show loading state
   */
  showLoading(message = 'Loading...') {
    const loadingState = document.getElementById('loadingState');
    if (loadingState) {
      loadingState.querySelector('p').textContent = message;
      loadingState.style.display = 'block';
    }
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    const loadingState = document.getElementById('loadingState');
    if (loadingState) {
      loadingState.style.display = 'none';
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    alert(message); // Simple error display - could be improved with a better UI
  }

  /**
   * Utility: Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Utility: Create a delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Filter books by category (used by footer links)
   */
  filterByCategory(category) {
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
      categoryFilter.value = category;
      this.applyFilters();
    }

    // Scroll to books section
    const booksSection = document.querySelector('.books-section');
    if (booksSection) {
      booksSection.scrollIntoView({behavior: 'smooth'});
    }
  }

  /**
   * Show book details (placeholder - could be expanded)
   */
  showBookDetails(bookId) {
    const book = this.books.find(b => b.id === bookId);
    if (book) {
      alert(`${book.title}\n\n${book.description}\n\nPrice: $${book.price.toFixed(2)}`);
    }
  }
}

// CSS for success messages (injected dynamically)
const successStyles = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = successStyles;
document.head.appendChild(styleSheet);

// Initialize the application
const App = new BookstoreApp();

// Export for global access
window.App = App;