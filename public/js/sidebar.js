document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("sidebar-container");

  if (container) {
    // Always load the unified sidebar.html
    const sidebarFile = "sidebar.html";

    fetch(`../components/${sidebarFile}`)
      .then(response => {
        if (!response.ok) {
          throw new Error("Sidebar HTML dosyası bulunamadı.");
        }
        return response.text();
      })
      .then(html => {
        container.innerHTML = html;

        // Profili ve rol bazlı menüyü doldur
        const user = typeof getUser === 'function' ? getUser() : null;
        
        if (user) {
          // Rol bazlı gösterim
          if (user.role === 'admin') {
            document.getElementById('nav-admin').style.display = 'flex';
            document.getElementById('brand-admin-badge').style.display = 'inline';
          } else {
            document.getElementById('nav-member').style.display = 'flex';
          }

          const nameEl = document.getElementById('sidebar-name');
          const emailEl = document.getElementById('sidebar-email');
          const avatarEl = document.getElementById('sidebar-avatar');

          if (nameEl) nameEl.textContent = user.name;
          if (emailEl) emailEl.textContent = user.email;
          if (avatarEl) {
            const parts = user.name.trim().split(' ');
            let initials = '?';
            if (parts.length > 1) {
              initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
            } else if (parts.length === 1 && parts[0]) {
              initials = parts[0].substring(0, 2).toUpperCase();
            }
            avatarEl.textContent = initials;
          }
        }

        // Aktif menüyü belirle
        const currentPath = window.location.pathname; // e.g., /member/active-loans.html
        const navItems = document.querySelectorAll('.sidebar .nav-item');
        
        navItems.forEach(item => {
          // href değerini al (örn: "active-loans.html")
          const href = item.getAttribute('href');
          
          if (href && href !== '#' && currentPath.includes(href)) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
      })
      .catch(error => console.error("Sidebar yükleme hatası:", error));
  }
});
