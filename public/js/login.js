async function handleLogin(event) {
    event.preventDefault();
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: document.getElementById('username').value,
                password: document.getElementById('password').value
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            
            // Redirect based on user role
            if (data.data.user.isAdmin) {
                window.location.href = '/admin-dashboard.html';
            } else {
                window.location.href = '/user-dashboard.html';
            }
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Error during login');
    }
}

document.getElementById('login-form').addEventListener('submit', handleLogin); 