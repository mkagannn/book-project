// =========================
// api.js
// Backend ile iletişimi merkezileştiren yardımcı modül.
// Tüm fetch çağrıları buradan geçer.
// =========================

const API_BASE = 'http://localhost:3000';

// -------------------------
// TOKEN YÖNETİMİ
// localStorage'da 'cl_token' ve 'cl_user' anahtarlarını kullanıyoruz.
// -------------------------

// Token kaydet (login/register sonrası çağrılır)
function saveToken(token, user) {
  localStorage.setItem('cl_token', token);
  localStorage.setItem('cl_user', JSON.stringify(user));
}

// Token'ı oku
function getToken() {
  return localStorage.getItem('cl_token');
}

// Giriş yapmış kullanıcıyı oku (obje olarak)
function getUser() {
  const raw = localStorage.getItem('cl_user');
  return raw ? JSON.parse(raw) : null;
}

// Çıkış: token + kullanıcıyı sil, login sayfasına yönlendir
function logout() {
  localStorage.removeItem('cl_token');
  localStorage.removeItem('cl_user');
  window.location.href = '../auth.html';
}

// -------------------------
// API FETCH WRAPPER
// Tüm istekler bu fonksiyondan geçer.
// Token varsa Authorization header'ı otomatik eklenir.
// -------------------------

async function apiFetch(path, options = {}) {
  const token = getToken();

  // Header'ları birleştir: her zaman JSON, token varsa Authorization ekle
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  // 401 gelirse token geçersiz demek → logout (login işlemi hariç)
  if (response.status === 401 && !path.includes('/login')) {
    logout();
    // Return a dummy promise to prevent the rest of the code from throwing immediately
    return new Promise(() => {});
  }

  // Response body'yi JSON olarak parse et
  const data = await response.json();

  // 2xx dışındaki durumlarda hata fırlat (mesaj backend'den gelir)
  if (!response.ok) {
    throw new Error(data.message || 'Bir hata oluştu.');
  }

  return data;
}

// -------------------------
// HAZIR API FONKSİYONLARI
// Her endpoint için ayrı fonksiyon — çağıran sayfa detay bilmez.
// -------------------------

// AUTH
const api = {
  logout,
  getUser,
  getToken,
  saveToken,

  login: (email, password) =>
    apiFetch('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  register: (name, email, password) =>
    apiFetch('/users/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    }),

  // LOANS
  getLoans: () =>
    apiFetch('/loans'),

  getLoanById: (id) =>
    apiFetch(`/loans/${id}`),

  createLoan: (userId, bookId, requestedStartDate, endDate) =>
    apiFetch('/loans', {
      method: 'POST',
      body: JSON.stringify({ userId, bookId, requestedStartDate, endDate })
    }),

  approveLoan: (id) =>
    apiFetch(`/loans/${id}/approve`, { method: 'PUT' }),

  retrieveLoan: (id) =>
    apiFetch(`/loans/${id}/retrieve`, { method: 'PUT' }),

  returnLoan: (id) =>
    apiFetch(`/loans/${id}/return`, { method: 'PUT' }),

  rejectLoan: (id) =>
    apiFetch(`/loans/${id}`, { method: 'DELETE' }),

  // BOOKS
  getBooks: () =>
    apiFetch('/books'),

  getBookById: (id) =>
    apiFetch(`/books/${id}`),

  createBook: (title, authorId) =>
    apiFetch('/books', {
      method: 'POST',
      body: JSON.stringify({ title, author: authorId })
    }),

  updateBook: (id, title, authorId) =>
    apiFetch(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title, author: authorId })
    }),

  deleteBook: (id) =>
    apiFetch(`/books/${id}`, { method: 'DELETE' }),

  // AUTHORS
  getAuthors: () =>
    apiFetch('/authors'),

  createAuthor: (name, birthYear) =>
    apiFetch('/authors', {
      method: 'POST',
      body: JSON.stringify({ name, birthYear })
    }),

  // USERS
  getUsers: () => apiFetch('/users'),

  forgotPassword: (email) =>
    apiFetch('/users/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),

  resetPassword: (token, newPassword) =>
    apiFetch('/users/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword })
    })
};

