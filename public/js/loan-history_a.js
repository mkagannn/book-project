document.addEventListener('DOMContentLoaded', loadAdminHistory);

async function loadAdminHistory() {
  const tbody = document.getElementById('history-tbody');
  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">Loading history records...</td></tr>';
  
  try {
    const allLoans = await api.getLoans();
    const historyLoans = allLoans.filter(loan => loan.status === 'Returned' || loan.status === 'Approved');
    
    document.getElementById('total-records').textContent = `${historyLoans.length} Total Records`;
    if (historyLoans.length > 0) {
      document.getElementById('total-records-container').style.display = 'inline-block';
    }

    renderTable(historyLoans);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Error: ${err.message}</td></tr>`;
  }
}

function renderTable(loans) {
  const tbody = document.getElementById('history-tbody');
  
  if (loans.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p>No loan records found.</p>
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
    const memberName = loan.userId?.name || 'Unknown Member';
    
    let statusBadge = '';
    if (loan.status === 'Returned') {
      statusBadge = `<span class="status-badge">Returned</span>`;
    } else if (loan.status === 'Approved') {
      const dueDate = new Date(loan.endDate);
      dueDate.setHours(0,0,0,0);
      
      const isOverdue = dueDate < today;
      const diffTime = dueDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (isOverdue) {
        statusBadge = `<span class="status-badge status-overdue">Overdue (${Math.abs(diffDays)} Days)</span>`;
      } else {
        statusBadge = `<span class="status-badge status-active">Active (${diffDays} Days Left)</span>`;
      }
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
      <td style="font-weight: 500; color: #334155;">${memberName}</td>
      <td>${formatDate(loan.requestedStartDate)}</td>
      <td style="color: #64748b;">${formatDate(loan.endDate)}</td>
      <td>
        ${statusBadge}
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

