// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/test.html';
        return;
    }
    
    checkUserRole();
    loadCategories();
    loadMyUploads();
});

// Check user role and load appropriate content
async function checkUserRole() {
    try {
        const response = await fetch('/api/users/me', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        document.getElementById('username-display').textContent = data.data.username;
        
        if (data.data.isAdmin) {
            document.getElementById('admin-section').style.display = 'block';
            loadPendingUploads();
        }
    } catch (error) {
        console.error('Error checking user role:', error);
    }
}

// Load categories for the upload form
async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        
        const categorySelect = document.getElementById('category');
        categorySelect.innerHTML = data.data.map(category => 
            `<option value="${category.id}">${category.name}</option>`
        ).join('');
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Handle media upload
document.getElementById('upload-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', document.getElementById('title').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('categoryId', document.getElementById('category').value);
    
    const mediaFile = document.getElementById('media').files[0];
    if (mediaFile) {
        formData.append('media', mediaFile);
    }

    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });

        const data = await response.json();
        if (response.ok) {
            alert('Upload successful!');
            loadMyUploads();
            e.target.reset();
            document.getElementById('media-preview').innerHTML = '';
        } else {
            alert('Upload failed: ' + data.message);
        }
    } catch (error) {
        console.error('Error uploading media:', error);
        alert('Upload failed: ' + error.message);
    }
});

// Load user's uploads
async function loadMyUploads() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/test.html';
            return;
        }

        const response = await fetch('/api/posts/my-uploads', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Uploads data:', data); // Debug log

        const uploadsContainer = document.getElementById('uploads-container');
        if (!uploadsContainer) {
            console.error('Uploads container not found');
            return;
        }

        uploadsContainer.innerHTML = '';

        if (data.data && Array.isArray(data.data)) {
            data.data.forEach(post => {
                const postElement = createPostElement(post);
                uploadsContainer.appendChild(postElement);
            });
        }
    } catch (error) {
        console.error('Error loading uploads:', error);
    }
}

function createPostElement(post) {
    const div = document.createElement('div');
    div.className = 'post-card';

    const mediaElement = post.mediaType === 'video' 
        ? `<video src="/uploads/${post.mediaUrl}" controls class="post-media"></video>`
        : `<img src="/uploads/${post.mediaUrl}" alt="Post media" class="post-media">`;

    div.innerHTML = `
        <div class="post-header">
            <h3>${post.title}</h3>
            <span class="status ${post.status}">${post.status}</span>
        </div>
        <div class="media-container">
            ${mediaElement}
        </div>
        <div class="post-info">
            <p>Category: ${post.category ? post.category.name : 'Uncategorized'}</p>
            <p>Posted: ${new Date(post.createdAt).toLocaleDateString()}</p>
        </div>
    `;

    return div;
}

// Load pending uploads (admin only)
async function loadPendingUploads() {
    try {
        const response = await fetch('/api/posts/pending', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        const pendingContainer = document.getElementById('pending-uploads');
        
        pendingContainer.innerHTML = data.data.map(post => createMediaCard(post, true)).join('');
    } catch (error) {
        console.error('Error loading pending uploads:', error);
    }
}

// Create media card HTML
function createMediaCard(post, isAdmin) {
    const mediaElement = post.mediaType === 'video'
        ? `<video src="${post.mediaUrl}" controls></video>`
        : `<img src="${post.mediaUrl}" alt="${post.title}">`;

    const adminButtons = isAdmin ? `
        <div class="approval-buttons">
            <button onclick="updatePostStatus(${post.id}, 'approved')" class="approve-btn">Approve</button>
            <button onclick="updatePostStatus(${post.id}, 'rejected')" class="reject-btn">Reject</button>
        </div>
    ` : '';

    return `
        <div class="media-card">
            ${mediaElement}
            <div class="title">${post.title}</div>
            <div class="description">${post.description}</div>
            <span class="status ${post.status}">${post.status}</span>
            ${adminButtons}
        </div>
    `;
}

// Update post status (admin only)
async function updatePostStatus(postId, status) {
    try {
        const response = await fetch(`/api/posts/${postId}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status })
        });

        if (response.ok) {
            loadPendingUploads();
        } else {
            const data = await response.json();
            alert('Update failed: ' + data.message);
        }
    } catch (error) {
        console.error('Error updating post status:', error);
        alert('Update failed: ' + error.message);
    }
}

// Handle media preview
document.getElementById('media').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const preview = document.getElementById('media-preview');
        const reader = new FileReader();
        
        reader.onload = function(e) {
            if (file.type.startsWith('video/')) {
                preview.innerHTML = `<video src="${e.target.result}" controls></video>`;
            } else {
                preview.innerHTML = `<img src="${e.target.result}">`;
            }
        }
        
        reader.readAsDataURL(file);
    }
});

// Handle logout
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/test.html';
}); 