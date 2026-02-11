const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

function getToken() {
  return localStorage.getItem('token') || '';
}

export async function apiRequest(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    const t = getToken();
    if (t) headers.Authorization = `Bearer ${t}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg = (data && data.error) || (data && data.message) || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const authApi = {
  login: (email, password) => apiRequest('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  register: (fullName, email, password, { role = '', staffCode = '' } = {}) => apiRequest('/auth/register', { method: 'POST', body: { fullName, email, password, role, staffCode }, auth: false }),
};

export const categoriesApi = {
  list: () => apiRequest('/categories', { auth: false }),
};

export const brandsApi = {
  list: () => apiRequest('/brands', { auth: false }),
};

export const productsApi = {
  list: ({ q = '', categoryId = '' } = {}) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (categoryId) params.set('categoryId', categoryId);
    const qs = params.toString();
    return apiRequest(`/products${qs ? `?${qs}` : ''}`, { auth: false });
  },
  getByBarcode: (code) => apiRequest(`/products/barcode?code=${encodeURIComponent(code)}`, { auth: false }),
  getById: (id) => apiRequest(`/products/${encodeURIComponent(id)}`, { auth: false }),
};

export const ordersApi = {
  create: (items) => apiRequest('/orders', { method: 'POST', body: { items }, auth: true }),
  tracking: (orderId) => apiRequest(`/orders/tracking?id=${encodeURIComponent(orderId)}`),
};

export const profileApi = {
  get: () => apiRequest('/profile', { auth: true }),
}

export const cartApi = {
  get: () => apiRequest('/cart', { auth: true }),
  add: (productId, quantity = 1) => apiRequest('/cart', { method: 'POST', body: { productId, quantity }, auth: true }),
  update: (productId, quantity) => apiRequest('/cart', { method: 'PATCH', body: { productId, quantity }, auth: true }),
  remove: (productId) => apiRequest(`/cart?productId=${encodeURIComponent(productId)}`, { method: 'DELETE', auth: true }),
  clear: () => apiRequest('/cart', { method: 'DELETE', auth: true }),
}

export const wishlistApi = {
  get: () => apiRequest('/wishlist', { auth: true }),
  add: (productId) => apiRequest('/wishlist', { method: 'POST', body: { productId }, auth: true }),
  remove: (productId) => apiRequest(`/wishlist?productId=${encodeURIComponent(productId)}`, { method: 'DELETE', auth: true }),
  check: (productId) => apiRequest(`/wishlist/check?productId=${encodeURIComponent(productId)}`, { auth: true }),
}

export const staffApi = {
  products: {
    create: (product) => apiRequest('/staff/products', { method: 'POST', body: product, auth: true }),
    update: (id, product) => apiRequest(`/staff/products/update?id=${encodeURIComponent(id)}`, { method: 'PATCH', body: product, auth: true }),
    delete: (id) => apiRequest(`/staff/products/delete?id=${encodeURIComponent(id)}`, { method: 'DELETE', auth: true }),
  },
  categories: {
    create: (category) => apiRequest('/staff/categories', { method: 'POST', body: category, auth: true }),
    update: (id, category) => apiRequest(`/staff/categories?id=${encodeURIComponent(id)}`, { method: 'PATCH', body: category, auth: true }),
    delete: (id) => apiRequest(`/staff/categories?id=${encodeURIComponent(id)}`, { method: 'DELETE', auth: true }),
  },
  brands: {
    create: (brand) => apiRequest('/staff/brands', { method: 'POST', body: brand, auth: true }),
    update: (id, brand) => apiRequest(`/staff/brands?id=${encodeURIComponent(id)}`, { method: 'PATCH', body: brand, auth: true }),
    delete: (id) => apiRequest(`/staff/brands?id=${encodeURIComponent(id)}`, { method: 'DELETE', auth: true }),
  },
}
