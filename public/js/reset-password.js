// URL'den token'ı al
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

if (!token) {
  document.getElementById('auth-error').textContent = 'Invalid or missing reset token. Please request a new password reset link.';
  document.getElementById('auth-error').style.display = 'block';
  document.getElementById('reset-btn').disabled = true;
}

async function handleResetPassword(e) {
  e.preventDefault();
  
  const errorEl = document.getElementById('auth-error');
  errorEl.style.display = 'none';

  const pwd = document.getElementById('reset-password').value;
  const pwdConfirm = document.getElementById('reset-password-confirm').value;

  if (pwd !== pwdConfirm) {
    errorEl.textContent = 'Passwords do not match.';
    errorEl.style.display = 'block';
    return;
  }

  const btn = document.getElementById('reset-btn');
  btn.textContent = 'Updating...';
  btn.disabled = true;

  try {
    const response = await api.resetPassword(token, pwd);
    alert(response.message || 'Password successfully updated.');
    window.location.href = '/auth.html';
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.style.display = 'block';
    btn.textContent = 'Update Password';
    btn.disabled = false;
  }
}

