document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember-me').checked;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, rememberMe })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));

            // Redirect based on role
            switch (data.data.user.role) {
                case 'admin':
                    window.location.href = '/admin-dashboard.html';
                    break;
                case 'approver':
                    window.location.href = '/approver-dashboard.html';
                    break;
                default:
                    window.location.href = '/user-dashboard.html';
            }
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Error during login');
    }
}

async function handleRegister(e) {
    e.preventDefault();

    const formData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        phone1: document.getElementById('phone1').value,
        phone2: document.getElementById('phone2').value
    };

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            alert('Registration successful! Please login.');
            window.location.href = '/login.html';
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Error during registration');
    }
}

// Utility function to check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

// Utility function to get user role
function getUserRole() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? user.role : null;
} 