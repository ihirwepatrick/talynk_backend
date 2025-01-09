document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    
    // Add text fields
    formData.append('username', document.getElementById('username').value);
    formData.append('password', document.getElementById('password').value);
    formData.append('primaryPhone', document.getElementById('primaryPhone').value);
    formData.append('secondaryPhone', document.getElementById('secondaryPhone').value);
    
    // Add face image
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
        document.getElementById('response').textContent = JSON.stringify(data, null, 2);
        
        if (response.ok) {
            // Store token if registration successful
            if (data.data && data.data.token) {
                localStorage.setItem('token', data.data.token);
            }
        }
    } catch (error) {
        document.getElementById('response').textContent = 'Error: ' + error.message;
    }
});

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