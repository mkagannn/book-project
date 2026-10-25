// =========================
// auth.js
// Login ve Register formlarını backend'e bağlar.
// api.js'in yüklü olduğunu varsayar (auth.html'de önce api.js eklenmeli).
// =========================


// -------------------------
// HATA MESAJI GÖSTERİCİ
// Formdaki #auth-error elementine hata yazar.
// -------------------------

function showError(message) {
  const el = document.getElementById('auth-error');
  if (el) {
    el.textContent = message;
    el.style.display = 'block';
  }
}

function clearError() {
  const el = document.getElementById('auth-error');
  if (el) {
    el.textContent = '';
    el.style.display = 'none';
  }
}


// -------------------------
// TAB GEÇİŞİ
// auth.html içindeki inline switchTab() buraya taşındı.
// -------------------------

function switchTab(tab) {
  const loginForm    = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const forgotForm   = document.getElementById('forgot-password-form');
  const tabLogin     = document.getElementById('tab-login');
  const tabRegister  = document.getElementById('tab-register');
  const title        = document.getElementById('auth-title');

  clearError();

  if (forgotForm) forgotForm.style.display = 'none';

  if (tab === 'login') {
    loginForm.style.display    = 'block';
    registerForm.style.display = 'none';
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    title.textContent = 'Welcome';
  } else {
    loginForm.style.display    = 'none';
    registerForm.style.display = 'block';
    tabLogin.classList.remove('active');
    tabRegister.classList.add('active');
    title.textContent = 'Create a new account';
  }
}

// -------------------------
// FORGOT PASSWORD EKRANI
// -------------------------

function showForgotPassword(e) {
  if (e) e.preventDefault();
  clearError();
  
  const loginForm    = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const forgotForm   = document.getElementById('forgot-password-form');
  const title        = document.getElementById('auth-title');

  loginForm.style.display    = 'none';
  registerForm.style.display = 'none';
  forgotForm.style.display   = 'block';
  
  document.getElementById('tab-login').classList.remove('active');
  document.getElementById('tab-register').classList.remove('active');
  
  title.textContent = 'Reset Password';
}

async function handleForgotPassword(e) {
  e.preventDefault();
  clearError();

  const email = document.getElementById('forgot-email').value.trim();
  const btn = document.getElementById('forgot-btn');

  btn.textContent = 'Sending...';
  btn.disabled = true;

  try {
    const response = await api.forgotPassword(email);
    alert(response.message || 'Password reset link has been sent (check console).');
    switchTab('login');
  } catch (err) {
    showError(err.message);
  } finally {
    btn.textContent = 'Send Reset Link';
    btn.disabled = false;
  }
}


// -------------------------
// ROL BAZLI YÖNLENDİRME
// Login/Register sonrası role göre sayfaya gönderir.
// -------------------------

function redirectByRole(role) {
  if (role === 'admin') {
    window.location.href = '/admin/overview.html';
  } else {
    window.location.href = '/member/browse-books.html';
  }
}


// -------------------------
// LOGIN
// -------------------------

async function handleLogin(e) {
  e.preventDefault();
  clearError();

  const loginError = document.getElementById('login-error');
  if (loginError) loginError.style.display = 'none';

  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    const data = await api.login(email, password);
    saveToken(data.token, data.user);
    redirectByRole(data.user.role);
  } catch (err) {
    if (loginError) {
      loginError.style.display = 'block';
      // Give a slight visual shake effect or focus out if needed, but display is enough
    } else {
      showError(err.message);
    }
  }
}


// -------------------------
// REGISTER
// -------------------------

async function handleRegister(e) {
  e.preventDefault();
  clearError();

  const name      = document.getElementById('reg-name').value.trim();
  const email     = document.getElementById('reg-email').value.trim();
  const password  = document.getElementById('reg-password').value;
  const password2 = document.getElementById('reg-password2').value;

  // Şifre eşleşme kontrolü — bu frontend'de yapılır, backend'e gerek yok
  if (password !== password2) {
    showError('Passwords do not match.');
    return;
  }

  try {
    const data = await api.register(name, email, password);

    saveToken(data.token, data.user);

    redirectByRole(data.user.role);

  } catch (err) {
    showError(err.message);
  }
}

