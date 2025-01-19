async function handlePostSubmit(event) {
    event.preventDefault();
    
    try {
        const formData = new FormData();
        const title = document.getElementById('post-title').value;
        const category = document.getElementById('category-select').value;
        const mediaFile = document.getElementById('media-file').files[0];

        if (!title || !category || !mediaFile) {
            alert('Please fill in all fields');
            return;
        }

        formData.append('title', title);
        formData.append('categoryId', category);
        formData.append('media', mediaFile);

        const token = localStorage.getItem('token');
        const response = await fetch('/api/posts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error creating post');
        }

        // Clear form and show success message
        event.target.reset();
        alert('Post created successfully! Waiting for approval.');
        
        // Optionally redirect to dashboard
        window.location.href = '/dashboard.html';

    } catch (error) {
        console.error('Error creating post:', error);
        alert('Error creating post: ' + error.message);
    }
}

// Add form submit listener
document.addEventListener('DOMContentLoaded', () => {
    const postForm = document.getElementById('post-form');
    if (postForm) {
        postForm.addEventListener('submit', handlePostSubmit);
    }
}); 