// Function to switch between pages
function showPage(pageId) {
  const registerPage = document.getElementById('register-page');
  const loginPage = document.getElementById('login-page');
  const switchButton = document.getElementById('switch-page');
  
  registerPage.style.display = pageId === 'register' ? 'block' : 'none';
  loginPage.style.display = pageId === 'login' ? 'block' : 'none';
  
  // Update button text based on current page
  switchButton.textContent = pageId === 'register' ? 'Switch to Login' : 'Switch to Register';
}

// Function to handle manual page switching
function switchPages() {
  const currentPage = document.getElementById('register-page').style.display === 'block' ? 'login' : 'register';
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
      // Clear the input fields after successful registration
      emailInput.value = '';
      usernameInput.value = '';
      passwordInput.value = '';
      // Switch to login page
      showPage('login');
      // Pre-fill the login username field
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
      alert('✅ ' + data.message);
      // Redirect to success page after successful login
      window.location.href = '/success.html';
    } else {
      alert('❌ ' + data.message);
    }
  } catch (err) {
    console.error('Error:', err);
    alert('Login failed.');
  }
});