function showPage(pageId) {
  const registerPage = document.getElementById('register-page');
  const loginPage = document.getElementById('login-page');
  const otpPage = document.getElementById('otp-page');
  const switchButton = document.getElementById('switch-page');
  
  registerPage.style.display = pageId === 'register' ? 'block' : 'none';
  loginPage.style.display = pageId === 'login' ? 'block' : 'none';
  otpPage.style.display = pageId === 'otp' ? 'block' : 'none';
  
  switchButton.textContent = pageId === 'register' ? 'Switch to Login' : 'Switch to Register';
}

// Function to handle manual page switching
function switchPages() {
  const currentPage = document.getElementById('login-page').style.display === 'block' ? 'register' : 'login';
  showPage(currentPage);
}

document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const emailInput = document.getElementById('register-email');
  const usernameInput = document.getElementById('register-username');
  const passwordInput = document.getElementById('register-password');
  const email = emailInput.value;
  const username = usernameInput.value;
  const password = passwordInput.value;
  
  try {
    const res = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password })
    });

    const data = await res.json();
    if (res.ok) {
      alert(data.message);
      emailInput.value = '';
      usernameInput.value = '';
      passwordInput.value = '';
      showPage('login');
      document.getElementById('login-email').value = email;
      document.getElementById('login-username').value = username;
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error('Error:', err);
    alert('Registration failed.');
  }
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const emailInput = document.getElementById('login-email');
  const usernameInput = document.getElementById('login-username');
  const passwordInput = document.getElementById('login-password');
  const email = emailInput.value;
  const username = usernameInput.value;
  const password = passwordInput.value;
  
  try {
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password })
    });
    
    const data = await res.json();
    if (res.ok) {
      if (data.requiresOTP) {
        alert('OTP sent to your email');
        sessionStorage.setItem('pendingUsername', username);
        showPage('otp');
        passwordInput.value = '';
        document.getElementById('otp-code').value = '';
      } else {
        alert('✅ ' + data.message);
        window.location.href = '/success.html';
      }
    } else {
      alert('❌ ' + data.message);
    }
  } catch (err) {
    console.error('Error:', err);
    alert('Login failed.');
  }
});


document.getElementById('otp-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const otpCode = document.getElementById('otp-code').value;
  const username = sessionStorage.getItem('pendingUsername');
  
  try {
    const res = await fetch('/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, otp: otpCode })
    });
    
    const data = await res.json();
    if (res.ok) {
      alert('✅ OTP Verified! ' + data.message);
      sessionStorage.removeItem('pendingUsername');
      window.location.href = '/success.html';
    } else {
      alert('❌ ' + data.message);
    }
  } catch (err) {
    console.error('Error:', err);
    alert('OTP verification failed.');
  }
});