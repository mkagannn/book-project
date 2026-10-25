document.addEventListener('DOMContentLoaded', loadActiveLoans);

async function loadActiveLoans() {
  const tbody = document.getElementById('loans-tbody');
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding: 20px;">Loading active loans...</td></tr>';
  
  try {
    const allLoans = await api.getLoans();
    // Sadece "Approved" (Aktif) olanları filtrele
    const activeLoans = allLoans.filter(loan => loan.status === 'Approved');
    
    renderTable(activeLoans);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red;">Error: ${err.message}</td></tr>`;
  }
}

function renderTable(loans) {
  const tbody = document.getElementById('loans-tbody');
  
  if (loans.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p>No active loans at the moment.</p>
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
    const memberName = loan.userId?.name || 'Unknown User';
    const initials = getInitials(memberName);
    const bookTitle = loan.bookId?.title || 'Unknown Book';
    
    const dueDate = new Date(loan.endDate);
    dueDate.setHours(0,0,0,0);
    
    // Gecikme kontrolü
    const isOverdue = dueDate < today;
    const statusClass = isOverdue ? 'status-overdue' : 'status-active';
    const statusText = isOverdue ? 'Overdue' : 'Active';
    
    const tr = document.createElement('tr');
    
    tr.innerHTML = `
      <td>
        <div class="member-info">
          <div class="member-avatar">${initials}</div>
          <span>${memberName}</span>
        </div>
      </td>
      <td>
        <div class="book-cell">
          <svg class="book-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          ${bookTitle}
        </div>
      </td>
      <td>${formatDate(loan.requestedStartDate)}</td>
      <td style="${isOverdue ? 'color: #ef4444; font-weight: 600;' : ''}">${formatDate(loan.endDate)}</td>
      <td>
        <span class="status-badge ${statusClass}">${statusText}</span>
      </td>
      <td>
        <button class="btn-return" onclick="handleReturn('${loan._id}')">
          Receive Return
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function handleReturn(loanId) {
  if (!confirm('Mark this book as returned and make it available in the catalog again?')) return;
  
  try {
    await api.returnLoan(loanId);
    // İşlem başarılıysa tabloyu yenile
    loadActiveLoans();
  } catch (err) {
    alert('Failed to return the book: ' + err.message);
  }
}

function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getInitials(name) {
  const parts = name.trim().split(' ');
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].substring(0, 2);
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

