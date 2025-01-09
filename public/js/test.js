// Check authentication status on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
});

// Tab switching
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all tabs
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked tab
        button.classList.add('active');
        document.getElementById(`${button.dataset.tab}-form`).classList.add('active');
    });
});

// Register form submission
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    
    formData.append('username', document.getElementById('reg-username').value);
    formData.append('password', document.getElementById('reg-password').value);
    formData.append('primaryPhone', document.getElementById('primaryPhone').value);
    formData.append('secondaryPhone', document.getElementById('secondaryPhone').value);
    
    const faceImageFile = document.getElementById('faceImage').files[0];
    if (faceImageFile) {
        formData.append('faceImage', faceImageFile);
    }

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        console.log('Registration response:', data); // Debug log

        if (response.ok && data.data && data.data.token) {
            // Store the token
            localStorage.setItem('token', data.data.token);
            console.log('Token stored:', data.data.token); // Debug log
            
            // Store user info
            localStorage.setItem('user', JSON.stringify(data.data.user));
            console.log('User stored:', data.data.user); // Debug log

            // Redirect to posts page
            window.location.href = '/posts.html';
        } else {
            document.getElementById('response').textContent = JSON.stringify(data, null, 2);
            console.error('Registration failed:', data); // Debug log
        }
    } catch (error) {
        console.error('Registration error:', error); // Debug log
        document.getElementById('response').textContent = 'Error: ' + error.message;
    }
});

// Login form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: document.getElementById('login-username').value,
                password: document.getElementById('login-password').value
            })
        });

        const data = await response.json();
        console.log('Login response:', data); // Debug log

        if (response.ok && data.data && data.data.token) {
            // Store the token
            localStorage.setItem('token', data.data.token);
            console.log('Token stored:', data.data.token); // Debug log
            
            // Store user info
            localStorage.setItem('user', JSON.stringify(data.data.user));
            console.log('User stored:', data.data.user); // Debug log

            // Redirect to posts page
            window.location.href = '/posts.html';
        } else {
            document.getElementById('response').textContent = JSON.stringify(data, null, 2);
            console.error('Login failed:', data); // Debug log
        }
    } catch (error) {
        console.error('Login error:', error); // Debug log
        document.getElementById('response').textContent = 'Error: ' + error.message;
    }
});

// Logout button
document.getElementById('logout-btn').addEventListener('click', async () => {
    try {
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();
        document.getElementById('response').textContent = JSON.stringify(data, null, 2);
        
        localStorage.removeItem('token');
        checkAuthStatus();
    } catch (error) {
        document.getElementById('response').textContent = 'Error: ' + error.message;
    }
});

// Check authentication status
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const statusElement = document.getElementById('login-status');
    const logoutButton = document.getElementById('logout-btn');
    
    if (token) {
        statusElement.textContent = 'Logged in';
        statusElement.style.color = '#28a745';
        logoutButton.style.display = 'inline-block';
    } else {
        statusElement.textContent = 'Not logged in';
        statusElement.style.color = '#dc3545';
        logoutButton.style.display = 'none';
    }
}

// Image preview
document.getElementById('faceImage').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('imagePreview');
            preview.innerHTML = `<img src="${e.target.result}" style="max-width: 200px; margin-top: 10px;">`;
        }
        reader.readAsDataURL(file);
    }
});

// Add a function to check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log('Checking auth - Token:', token); // Debug log
    console.log('Checking auth - User:', user); // Debug log

    if (!token || !user) {
        window.location.href = '/test.html';
    }
}

// Check auth when loading protected pages
if (window.location.pathname.includes('posts.html') || 
    window.location.pathname.includes('dashboard.html')) {
    checkAuth();
} 