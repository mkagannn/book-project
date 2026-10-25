// Kapak renkleri — her kitaba index'e göre renk atanır
const COVER_COLORS = [
  'cover-red', 'cover-navy', 'cover-green', 'cover-teal',
  'cover-orange', 'cover-purple', 'cover-crimson', 'cover-dark'
];

let allBooks = []; // tüm kitaplar (filtreleme için saklanır)

// -------------------------
// SAYFA YÜKLENINCE: kitapları çek
// -------------------------
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const books = await api.getBooks();
    allBooks = books;
    renderBooks(books);
    populateCategories(books);
  } catch (err) {
    document.getElementById('books-grid').innerHTML =
      `<div class="books-empty">Kitaplar yüklenemedi: ${err.message}</div>`;
  }
});

// -------------------------
// KİTAPLARI RENDER ET
// Sadece borrowedBy null olanları göster (kullanıcı notuna göre)
// -------------------------
function renderBooks(books) {
  const grid = document.getElementById('books-grid');

  if (books.length === 0) {
    grid.innerHTML = '<div class="books-empty">No books found.</div>';
    return;
  }

  grid.innerHTML = books.map((book, i) => {
    const color = COVER_COLORS[i % COVER_COLORS.length];
    const authorName = book.author?.name || 'Unknown Author';
    const isAvailable = !book.borrowedBy;
    const badge = isAvailable
      ? `<span class="book-badge available">Available</span>`
      : `<span class="book-badge borrowed">Borrowed</span>`;

    return `
      <a class="book-card" href="book-detail.html?id=${book._id}">
        <div class="book-cover ${color}">
          <span class="book-cover-title">${book.title}</span>
        </div>
        <div class="book-info">
          <div class="book-title">${book.title}</div>
          <div class="book-author">${authorName}</div>
          ${badge}
        </div>
      </a>
    `;
  }).join('');
}

// -------------------------
// KATEGORİ DROPDOWN DOLDUR
// Yazarları kategori olarak kullanıyoruz (backend'de kategori alanı yok)
// -------------------------
function populateCategories(books) {
  const select = document.getElementById('category-select');
  const authors = [...new Set(books.map(b => b.author?.name).filter(Boolean))];

  authors.forEach(author => {
    const opt = document.createElement('option');
    opt.value = author;
    opt.textContent = author;
    select.appendChild(opt);
  });
}

// -------------------------
// ARAMA FİLTRESİ
// -------------------------
document.getElementById('search-input').addEventListener('input', applyFilters);
document.getElementById('category-select').addEventListener('change', applyFilters);

function applyFilters() {
  const query    = document.getElementById('search-input').value.toLowerCase();
  const category = document.getElementById('category-select').value;

  const filtered = allBooks.filter(book => {
    const matchName   = book.title.toLowerCase().includes(query);
    const matchAuthor = !category || book.author?.name === category;
    return matchName && matchAuthor;
  });

  renderBooks(filtered);
}

