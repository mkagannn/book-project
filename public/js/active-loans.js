document.addEventListener('DOMContentLoaded', loadMyActiveLoans);

async function loadMyActiveLoans() {
  const tbody = document.getElementById('loans-tbody');
  tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;">Loading your loans...</td></tr>';
  
  try {
    // Backend now automatically filters by user ID if role is member
    const myLoans = await api.getLoans();
    const activeLoans = myLoans.filter(loan => loan.status === 'Approved');
    
    renderTable(activeLoans);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:red;">Error: ${err.message}</td></tr>`;
  }
}

function renderTable(loans) {
  const tbody = document.getElementById('loans-tbody');
  
  if (loans.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4">
          <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p>You don't have any active borrowed books.</p>
            <a href="browse-books.html" class="btn-browse">Browse Books</a>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = '';
  const today = new Date();
  today.setHours(0,0,0,0);
  
  loans.forEach(loan => {
    const bookTitle = loan.bookId?.title || 'Unknown Book';
    const bookAuthor = loan.bookId?.author?.name || 'Unknown Author';
    
    const dueDate = new Date(loan.endDate);
    dueDate.setHours(0,0,0,0);
    
    const isOverdue = dueDate < today;
    const statusClass = isOverdue ? 'status-overdue' : 'status-active';
    
    // Compute days left or days overdue
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    let statusText = '';

    if (diffDays < 0) {
      statusText = `Overdue (${Math.abs(diffDays)} Days)`;
    } else if (diffDays === 0) {
      statusText = 'Due Today';
    } else if (diffDays === 1) {
      statusText = '1 Day Left';
    } else {
      statusText = `${diffDays} Days Left`;
    }

    const tr = document.createElement('tr');
    
    tr.innerHTML = `
      <td>
        <div class="book-cell">
          <svg class="book-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          <div>
            <div style="font-weight: 600; color: #0f172a; margin-bottom: 2px;">${bookTitle}</div>
            <div style="font-size: 13px; color: #64748b;">${bookAuthor}</div>
          </div>
        </div>
      </td>
      <td>${formatDate(loan.requestedStartDate)}</td>
      <td style="${isOverdue ? 'color: #ef4444; font-weight: 600;' : 'font-weight: 500;'}">${formatDate(loan.endDate)}</td>
      <td>
        <span class="status-badge ${statusClass}">${statusText}</span>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

