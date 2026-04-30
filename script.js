const apiEndpoint = 'https://dummyjson.com/products?limit=12';
const cartKey = 'dynamicEcommerceCart';

const productGrid = document.getElementById('product-grid');
const loader = document.getElementById('loader');
const cartCountElement = document.getElementById('cart-count');

const getSavedCart = () => {
  const saved = localStorage.getItem(cartKey);
  return saved ? JSON.parse(saved) : {};
};

const setSavedCart = (cart) => {
  localStorage.setItem(cartKey, JSON.stringify(cart));
};

const updateCartCount = () => {
  const cart = getSavedCart();
  const count = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  cartCountElement.textContent = count;
};

const createProductCard = (product) => {
  const card = document.createElement('article');
  card.className = 'product-card';

  card.innerHTML = `
    <div class="card-media">
      <img src="${product.thumbnail}" alt="${product.title}" loading="lazy" />
    </div>
    <div class="card-body">
      <span class="card-category">${product.category}</span>
      <h3 class="product-title">${product.title}</h3>
      <div class="product-meta">
        <span class="price">$${product.price.toFixed(2)}</span>
        <span class="rating">★ ${product.rating.toFixed(1)}</span>
      </div>
      <button class="add-button" type="button">Add to Cart</button>
    </div>
  `;

  const actionButton = card.querySelector('.add-button');
  actionButton.addEventListener('click', () => addToCart(product));

  return card;
};

const addToCart = (product) => {
  const cart = getSavedCart();
  const existing = cart[product.id];

  if (existing) {
    existing.quantity += 1;
  } else {
    cart[product.id] = {
      id: product.id,
      title: product.title,
      price: product.price,
      thumbnail: product.thumbnail,
      quantity: 1,
    };
  }

  setSavedCart(cart);
  updateCartCount();
  showToast(`${product.title} added to cart`);
};

const showToast = (message) => {
  const toast = document.createElement('div');
  toast.className = 'toast-notice';
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('visible'));

  setTimeout(() => {
    toast.classList.remove('visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, 1800);
};

const renderProducts = (products) => {
  productGrid.innerHTML = '';
  products.forEach((product) => {
    productGrid.appendChild(createProductCard(product));
  });
};

const showLoader = () => {
  loader.style.display = 'flex';
};

const hideLoader = () => {
  loader.style.display = 'none';
};

const loadProducts = async () => {
  showLoader();

  try {
    const response = await fetch(apiEndpoint);
    if (!response.ok) {
      throw new Error('Unable to load products.');
    }

    const data = await response.json();
    const products = Array.isArray(data.products) ? data.products : [];

    if (!products.length) {
      productGrid.innerHTML = '<div class="loader">No products available.</div>';
      return;
    }

    renderProducts(products);
  } catch (error) {
    productGrid.innerHTML = `<div class="loader">${error.message}</div>`;
  } finally {
    hideLoader();
  }
};

window.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  loadProducts();
});
