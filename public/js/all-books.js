document.addEventListener('DOMContentLoaded', () => {
  loadBooks();
  loadAuthorsDropdown();
});

let allBooksData = [];

async function loadBooks() {
  const tbody = document.getElementById('books-tbody');
  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">Loading books...</td></tr>';
  
  try {
    allBooksData = await api.getBooks();
    document.getElementById('total-records').textContent = `${allBooksData.length} Books`;
    renderTable(allBooksData);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Error: ${err.message}</td></tr>`;
  }
}

function filterBooks() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const filtered = allBooksData.filter(book => {
    const title = (book.title || '').toLowerCase();
    const author = (book.author?.name || '').toLowerCase();
    return title.includes(query) || author.includes(query);
  });
  renderTable(filtered);
}

function renderTable(books) {
  const tbody = document.getElementById('books-tbody');
  if (books.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px; color:#64748b;">No books found matching your criteria.</td></tr>';
    return;
  }

  tbody.innerHTML = '';
  books.forEach(book => {
    const isBorrowed = book.borrowedBy != null;
    const statusBadge = isBorrowed 
      ? `<span class="status-badge badge-borrowed">Borrowed</span>` 
      : `<span class="status-badge badge-available">Available</span>`;

    const authorName = book.author?.name || 'Unknown Author';
    const addedDate = new Date(book.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="book-cell">
          <div class="book-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <div>
            <div style="font-weight: 600; color: #0f172a; margin-bottom: 2px;">${book.title}</div>
            <div style="font-size: 13px; color: #64748b;">ID: ${book._id.substring(0,6)}...</div>
          </div>
        </div>
      </td>
      <td style="color: #334155;">${authorName}</td>
      <td style="color: #64748b;">${addedDate}</td>
      <td>${statusBadge}</td>
      <td style="display:flex; gap:8px;">
        <button class="btn-edit" onclick="openEditBookModal('${book._id}', '${book.title.replace(/'/g, "\\'")}', '${book.author?._id || ''}')">Edit</button>
        <button class="btn-danger" onclick="deleteBook('${book._id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function loadAuthorsDropdown() {
  try {
    const authors = await api.getAuthors();
    const select = document.getElementById('bookAuthor');
    
    select.innerHTML = '<option value="">Select an Author...</option>';
    
    authors.forEach(author => {
      const option = document.createElement('option');
      option.value = author._id;
      option.textContent = author.name;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Failed to load authors", err);
  }
}

let isCreatingNewAuthor = false;

function toggleNewAuthor(e) {
  e.preventDefault();
  isCreatingNewAuthor = !isCreatingNewAuthor;
  
  const selectEl = document.getElementById('bookAuthor');
  const containerEl = document.getElementById('newAuthorContainer');
  const nameInputEl = document.getElementById('newAuthorName');
  const toggleBtn = document.getElementById('toggleAuthorBtn');

  if (isCreatingNewAuthor) {
    selectEl.style.display = 'none';
    containerEl.style.display = 'block';
    toggleBtn.textContent = 'Cancel New Author';
    nameInputEl.focus();
  } else {
    selectEl.style.display = 'block';
    containerEl.style.display = 'none';
    toggleBtn.textContent = '+ Add New Author';
    nameInputEl.value = '';
    document.getElementById('newAuthorBirthYear').value = '';
  }
}

let editingBookId = null;

function openAddBookModal() {
  editingBookId = null;
  document.getElementById('modalTitle').textContent = 'Add New Book';
  document.getElementById('saveBtn').textContent = 'Save Book';
  
  document.getElementById('addBookModal').classList.add('active');
  document.getElementById('bookTitle').value = '';
  document.getElementById('bookAuthor').value = '';
  
  // Reset toggle state
  isCreatingNewAuthor = false;
  document.getElementById('bookAuthor').style.display = 'block';
  document.getElementById('newAuthorContainer').style.display = 'none';
  document.getElementById('newAuthorName').value = '';
  document.getElementById('newAuthorBirthYear').value = '';
  document.getElementById('toggleAuthorBtn').style.display = 'inline';
  document.getElementById('toggleAuthorBtn').textContent = '+ Add New Author';
}

function openEditBookModal(id, title, authorId) {
  editingBookId = id;
  document.getElementById('modalTitle').textContent = 'Edit Book';
  document.getElementById('saveBtn').textContent = 'Update Book';
  
  document.getElementById('addBookModal').classList.add('active');
  document.getElementById('bookTitle').value = title;
  document.getElementById('bookAuthor').value = authorId || '';
  
  // Reset toggle state but hide the "+ Add New Author" link while editing to keep it simple
  isCreatingNewAuthor = false;
  document.getElementById('bookAuthor').style.display = 'block';
  document.getElementById('newAuthorContainer').style.display = 'none';
  document.getElementById('newAuthorName').value = '';
  document.getElementById('newAuthorBirthYear').value = '';
  document.getElementById('toggleAuthorBtn').style.display = 'none';
}

function closeAddBookModal() {
  document.getElementById('addBookModal').classList.remove('active');
}

async function saveBook() {
  const title = document.getElementById('bookTitle').value.trim();
  let authorId = document.getElementById('bookAuthor').value;
  const newAuthorName = document.getElementById('newAuthorName').value.trim();
  const newAuthorBirthYear = document.getElementById('newAuthorBirthYear').value.trim();

  if (!title) {
    alert("Please fill in the book title.");
    return;
  }

  if (isCreatingNewAuthor) {
    if (!newAuthorName) {
      alert("Please enter the name of the new author.");
      return;
    }
    if (!newAuthorBirthYear) {
      alert("Please enter the birth year of the new author.");
      return;
    }
  } else {
    if (!authorId) {
      alert("Please select an author from the list.");
      return;
    }
  }

  const btn = document.getElementById('saveBtn');
  btn.textContent = 'Saving...';
  btn.disabled = true;

  try {
    if (editingBookId) {
      // UPDATE MODE
      await api.updateBook(editingBookId, title, authorId);
    } else {
      // CREATE MODE
      if (isCreatingNewAuthor) {
        const newAuthor = await api.createAuthor(newAuthorName, parseInt(newAuthorBirthYear));
        authorId = newAuthor._id; 
        loadAuthorsDropdown(); 
      }
      await api.createBook(title, authorId);
    }

    closeAddBookModal();
    loadBooks(); // reload table
  } catch (err) {
    alert("Failed to save book: " + err.message);
  } finally {
    btn.textContent = editingBookId ? 'Update Book' : 'Save Book';
    btn.disabled = false;
  }
}

async function deleteBook(id) {
  if (!confirm("Are you sure you want to delete this book? This action cannot be undone.")) return;

  try {
    await api.deleteBook(id);
    loadBooks(); 
  } catch (err) {
    alert("Failed to delete book: " + err.message);
  }
}

