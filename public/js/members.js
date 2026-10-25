let allMembersData = [];

document.addEventListener('DOMContentLoaded', loadMembers);

async function loadMembers() {
  const tbody = document.getElementById('members-tbody');
  tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px;">Loading members...</td></tr>';
  
  try {
    allMembersData = await api.getUsers();
    document.getElementById('total-records').textContent = `${allMembersData.length} Members`;
    renderTable(allMembersData);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:red;">Error: ${err.message}</td></tr>`;
  }
}

function filterMembers() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const filtered = allMembersData.filter(user => {
    const name = (user.name || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    return name.includes(query) || email.includes(query);
  });
  renderTable(filtered);
}

function renderTable(members) {
  const tbody = document.getElementById('members-tbody');
  if (members.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding: 20px; color:#64748b;">No members found matching your search.</td></tr>';
    return;
  }

  tbody.innerHTML = '';
  members.forEach(user => {
    const roleClass = user.role === 'admin' ? 'badge-admin' : 'badge-member';
    const roleLabel = user.role === 'admin' ? 'Admin' : 'Member';
    
    const joinedDate = new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    const parts = (user.name || '').trim().split(' ');
    let initials = '?';
    if (parts.length > 1) {
      initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else if (parts.length === 1 && parts[0]) {
      initials = parts[0].substring(0, 2).toUpperCase();
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="user-cell">
          <div class="user-avatar">${initials}</div>
          <div>
            <div style="font-weight: 600; color: #0f172a; margin-bottom: 2px;">${user.name}</div>
            <div style="font-size: 13px; color: #64748b;">${user.email}</div>
          </div>
        </div>
      </td>
      <td>
        <span class="status-badge ${roleClass}">${roleLabel}</span>
      </td>
      <td style="color: #64748b;">${joinedDate}</td>
      <td style="color: #94a3b8; font-family: monospace;">${user._id.substring(0, 8)}...</td>
    `;
    tbody.appendChild(tr);
  });
}

