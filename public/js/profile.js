document.addEventListener('DOMContentLoaded', async () => {
  // 1. Get user details from localStorage (saved during login)
  const user = typeof getUser === 'function' ? getUser() : null;
  if (!user) {
    window.location.href = '../auth.html';
    return;
  }

  // Populate basic info
  document.getElementById('p-name').textContent = user.name;
  document.getElementById('p-email').textContent = user.email;
  const parts = user.name.trim().split(' ');
  let initials = '?';
  if (parts.length > 1) {
    initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  } else if (parts.length === 1 && parts[0]) {
    initials = parts[0].substring(0, 2).toUpperCase();
  }
  document.getElementById('p-avatar').textContent = initials;
  
  document.getElementById('p-role').textContent = user.role === 'admin' ? 'Administrator' : 'Library Member';

  // 2. Fetch Loans to calculate reading stats
  try {
    const myLoans = await api.getLoans();
    
    const activeCount = myLoans.filter(l => l.status === 'Approved').length;
    const pendingCount = myLoans.filter(l => l.status === 'Requested').length;
    const returnedCount = myLoans.filter(l => l.status === 'Returned').length;

    document.getElementById('stat-active').textContent = activeCount;
    document.getElementById('stat-pending').textContent = pendingCount;
    document.getElementById('stat-returned').textContent = returnedCount;

  } catch (error) {
    console.error("Error fetching stats:", error);
  }
});

