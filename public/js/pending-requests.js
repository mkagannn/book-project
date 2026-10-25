// Başlangıçta tüm talepleri çek
document.addEventListener('DOMContentLoaded', loadPendingRequests);

async function loadPendingRequests() {
  const tbody = document.getElementById('requests-tbody');
  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">Loading requests...</td></tr>';
  
  try {
    // Tüm loan'ları çek
    const allLoans = await api.getLoans();
    
    // Sadece durumu "Requested" (Bekleyen) olanları filtrele
    const pendingLoans = allLoans.filter(loan => loan.status === 'Requested');
    
    renderTable(pendingLoans);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Error: ${err.message}</td></tr>`;
  }
}

function renderTable(loans) {
  const tbody = document.getElementById('requests-tbody');
  
  if (loans.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>No pending requests at the moment.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = ''; // Temizle
  
  loans.forEach(loan => {
    const memberName = loan.userId?.name || 'Unknown User';
    const initials = getInitials(memberName);
    const bookTitle = loan.bookId?.title || 'Unknown Book';
    
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
      <td>
        ${formatDate(loan.requestedStartDate)} <span style="color:#94a3b8; margin:0 4px;">→</span> ${formatDate(loan.endDate)}
      </td>
      <td style="color:#64748b;">
        ${formatDate(loan.createdAt)}
      </td>
      <td>
        <div class="actions-cell">
          <button class="action-btn btn-approve" onclick="handleApprove('${loan._id}')">Approve</button>
          <button class="action-btn btn-reject" onclick="handleReject('${loan._id}')">Reject</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Onaylama işlemi
async function handleApprove(loanId) {
  if (!confirm('Are you sure you want to approve this loan request?')) return;
  
  try {
    await api.approveLoan(loanId);
    // Başarılıysa listeyi yenile
    loadPendingRequests();
  } catch (err) {
    alert('Failed to approve: ' + err.message);
  }
}

// Reddetme işlemi (Silme)
async function handleReject(loanId) {
  if (!confirm('Are you sure you want to REJECT and delete this request?')) return;
  
  try {
    await api.rejectLoan(loanId);
    // Başarılıysa listeyi yenile
    loadPendingRequests();
  } catch (err) {
    alert('Failed to reject: ' + err.message);
  }
}

// Yardımcı: Tarih formatlama
function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Yardımcı: İsimden baş harfleri çıkarma (örn: "Mustafa Kağan" -> "MK")
function getInitials(name) {
  const parts = name.trim().split(' ');
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].substring(0, 2);
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

